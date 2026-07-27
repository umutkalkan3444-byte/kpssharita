import { getRequest } from "@tanstack/react-start/server";

import { CATEGORY_MAP } from "@/lib/game-data";
import { REGION_OF } from "@/lib/province-regions";
import { buildReviewFromAiPlan, buildStaticReview } from "@/lib/study/build-static-review";
import {
  AiReviewPlanSchema,
  normalizeStudyReviewRequest,
  type StudyReviewRequest,
  type StudyReviewResponse,
} from "@/lib/study/schemas";
import { STUDY_CONTENT_VERSION } from "@/data/study/version";
import {
  buildTrustedStudyPayload,
  STUDY_REVIEW_INSTRUCTIONS,
  STUDY_REVIEW_PLAN_JSON_SCHEMA,
} from "./study-prompt.server";

const DEFAULT_MODEL = "gpt-5-nano";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const REQUEST_TIMEOUT_MS = 7_000;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT = 10;
const MAX_RATE_BUCKETS = 500;
const MAX_IN_FLIGHT_REVIEWS = 50;
const SERVER_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type RateBucket = { count: number; resetAt: number };
type ServerCacheEntry = {
  expiresAt: number;
  response: StudyReviewResponse;
};

const rateBuckets = new Map<string, RateBucket>();
const responseCache = new Map<string, ServerCacheEntry>();
const inFlightReviews = new Map<string, Promise<StudyReviewResponse>>();

function env(name: string): string | undefined {
  const runtimeProcess = (
    globalThis as {
      process?: { env?: Record<string, string | undefined> };
    }
  ).process;
  return runtimeProcess?.env?.[name];
}

function normalizePlace(value: string): string {
  const normalized = value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]/g, "");
  return normalized === "afyonkarahisar" ? "afyon" : normalized;
}

function validateClosedRequest(requestInput: StudyReviewRequest): StudyReviewRequest {
  const request = normalizeStudyReviewRequest(requestInput);
  const category = CATEGORY_MAP[request.categorySlug];
  if (!category) throw new Error("Geçersiz kategori");
  if (request.correctCount > category.items.length) {
    throw new Error("Geçersiz doğru sayısı");
  }

  const targetIds = new Set(category.items.map((item) => item.id));
  const categoryPlaceNames = new Set(category.items.map((item) => normalizePlace(item.name)));
  const provinceNames = new Set(Object.keys(REGION_OF).map((name) => normalizePlace(name)));
  for (const mistake of request.wrongAttempts) {
    if (mistake.kind === "target" && !targetIds.has(mistake.id)) {
      throw new Error("Geçersiz hedef kimliği");
    }
    if (
      mistake.kind === "target" &&
      mistake.droppedOnId &&
      (!targetIds.has(mistake.droppedOnId) || mistake.droppedOnId === mistake.id)
    ) {
      throw new Error("Geçersiz bırakma hedefi");
    }
    if (mistake.kind === "province" && mistake.droppedOnId) {
      throw new Error("İl seçiminde bırakma hedefi kullanılamaz");
    }
    if (
      mistake.kind === "province" &&
      (!provinceNames.has(normalizePlace(mistake.id)) ||
        categoryPlaceNames.has(normalizePlace(mistake.id)))
    ) {
      throw new Error("Geçersiz il seçimi");
    }
  }

  return request;
}

function currentRequest(): Request | null {
  try {
    return getRequest();
  } catch {
    return null;
  }
}

function sameOriginAllowed(request: Request | null): boolean {
  const production = env("NODE_ENV") === "production";
  if (!request) return !production;

  const incomingOrigin = request.headers.get("origin");
  if (!incomingOrigin) return !production;

  const allowedOrigins = new Set<string>();
  const configuredOrigin = env("APP_ORIGIN");
  if (configuredOrigin) {
    try {
      allowedOrigins.add(new URL(configuredOrigin).origin);
    } catch {
      return false;
    }
  } else {
    try {
      allowedOrigins.add(new URL(request.url).origin);
    } catch {
      return false;
    }
  }
  try {
    return allowedOrigins.has(new URL(incomingOrigin).origin);
  } catch {
    return false;
  }
}

function rateKey(request: Request | null): string {
  return request?.headers.get("cf-connecting-ip")?.trim() || "anonymous";
}

function rateLimitAllows(key: string): boolean {
  const now = Date.now();
  for (const [bucketKey, bucket] of rateBuckets) {
    if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
  }

  const bucket = rateBuckets.get(key);
  if (!bucket) {
    while (rateBuckets.size >= MAX_RATE_BUCKETS) {
      const oldestKey = rateBuckets.keys().next().value as string | undefined;
      if (!oldestKey) break;
      rateBuckets.delete(oldestKey);
    }
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (bucket.count >= RATE_LIMIT) return false;
  bucket.count += 1;
  return true;
}

function serverCacheKey(request: StudyReviewRequest): string {
  return JSON.stringify({
    version: STUDY_CONTENT_VERSION,
    category: request.categorySlug,
    mistakes: request.wrongAttempts.map((mistake) => [
      mistake.kind,
      mistake.id,
      mistake.droppedOnId ?? null,
      mistake.count,
    ]),
  });
}

function readServerCache(key: string): StudyReviewResponse | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return { ...entry.response, source: "cache" };
}

function writeServerCache(key: string, response: StudyReviewResponse): void {
  if (responseCache.size >= 100) {
    const oldestKey = responseCache.keys().next().value as string | undefined;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  responseCache.set(key, {
    expiresAt: Date.now() + SERVER_CACHE_TTL_MS,
    response,
  });
}

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as {
    output_text?: unknown;
    output?: unknown;
  };
  if (typeof record.output_text === "string") return record.output_text;
  if (!Array.isArray(record.output)) return null;

  for (const item of record.output) {
    if (!item || typeof item !== "object") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (
        part &&
        typeof part === "object" &&
        (part as { type?: unknown }).type === "output_text" &&
        typeof (part as { text?: unknown }).text === "string"
      ) {
        return (part as { text: string }).text;
      }
    }
  }
  return null;
}

async function requestAiReview(request: StudyReviewRequest): Promise<StudyReviewResponse | null> {
  const apiKey = env("OPENAI_API_KEY");
  if (env("AI_STUDY_ENABLED") !== "true" || !apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const trustedPayload = buildTrustedStudyPayload(request);
    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env("OPENAI_STUDY_MODEL") || DEFAULT_MODEL,
        store: false,
        reasoning: { effort: "minimal" },
        instructions: STUDY_REVIEW_INSTRUCTIONS,
        input: JSON.stringify(trustedPayload),
        max_output_tokens: 360,
        text: {
          verbosity: "low",
          format: {
            type: "json_schema",
            name: "study_review_plan",
            strict: true,
            schema: STUDY_REVIEW_PLAN_JSON_SCHEMA,
          },
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.warn("[study-review] OpenAI fallback", {
        status: response.status,
        requestId: response.headers.get("x-request-id"),
      });
      return null;
    }

    const payload = (await response.json()) as unknown;
    const outputText = extractOutputText(payload);
    if (!outputText) return null;
    const plan = AiReviewPlanSchema.safeParse(JSON.parse(outputText));
    if (!plan.success) return null;
    const review = buildReviewFromAiPlan(request, plan.data, {
      sentFactIds: trustedPayload.facts.map((fact) => fact.id),
      allowedFactIdsByMistake: Object.fromEntries(
        trustedPayload.mistakes.map((mistake) => [mistake.id, mistake.allowedFactIds]),
      ),
    });
    if (!review) return null;

    return {
      source: "ai",
      contentVersion: STUDY_CONTENT_VERSION,
      review,
    };
  } catch (error) {
    const kind =
      error instanceof Error && error.name === "AbortError" ? "timeout" : "request_failed";
    console.warn("[study-review] OpenAI fallback", { kind });
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function getStudyReviewOnServer(
  data: StudyReviewRequest,
): Promise<StudyReviewResponse> {
  const request = validateClosedRequest(data);
  const fallback: StudyReviewResponse = {
    source: "static",
    contentVersion: STUDY_CONTENT_VERSION,
    review: buildStaticReview(request),
  };
  const hasMistake = request.wrongAttempts.length > 0;
  if (!hasMistake) return fallback;

  const incoming = currentRequest();
  if (!sameOriginAllowed(incoming)) {
    return fallback;
  }

  const cacheKey = serverCacheKey(request);
  const cached = readServerCache(cacheKey);
  if (cached) return cached;

  const existingReview = inFlightReviews.get(cacheKey);
  if (existingReview) return existingReview;
  if (inFlightReviews.size >= MAX_IN_FLIGHT_REVIEWS || !rateLimitAllows(rateKey(incoming))) {
    return fallback;
  }

  const reviewPromise = (async () => {
    const ai = await requestAiReview(request);
    if (!ai) return fallback;
    writeServerCache(cacheKey, ai);
    return ai;
  })();
  inFlightReviews.set(cacheKey, reviewPromise);
  try {
    return await reviewPromise;
  } finally {
    if (inFlightReviews.get(cacheKey) === reviewPromise) {
      inFlightReviews.delete(cacheKey);
    }
  }
}
