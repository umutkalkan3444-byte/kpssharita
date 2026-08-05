import {
  normalizeStudyReviewRequest,
  type StudyReviewRequest,
  type StudyReviewResponse,
  StudyReviewResponseSchema,
  mistakeKey,
} from "./schemas";
import {
  STUDY_CACHE_MAX_ENTRIES,
  STUDY_CACHE_TTL_MS,
  STUDY_CONTENT_VERSION,
} from "@/data/study/version";

const STORAGE_KEY = "kpss-study-review-cache-v1";

type CacheEntry = {
  key: string;
  createdAt: number;
  response: StudyReviewResponse;
};

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function canonicalRequest(requestInput: StudyReviewRequest): string {
  const request = normalizeStudyReviewRequest(requestInput);
  return JSON.stringify({
    version: STUDY_CONTENT_VERSION,
    categorySlug: request.categorySlug,
    wrongAttempts: request.wrongAttempts
      .slice()
      .sort((a, b) => mistakeKey(a).localeCompare(mistakeKey(b), "tr"))
      .map((mistake) => [mistake.kind, mistake.id, mistake.droppedOnId ?? null, mistake.count]),
  });
}

export function getStudyReviewCacheKey(request: StudyReviewRequest): string {
  return `study:${stableHash(canonicalRequest(request))}`;
}

function readEntries(): CacheEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const value = JSON.parse(raw) as unknown;
    if (!Array.isArray(value)) return [];
    const now = Date.now();
    return value.flatMap((entry) => {
      if (
        !entry ||
        typeof entry !== "object" ||
        typeof (entry as CacheEntry).key !== "string" ||
        typeof (entry as CacheEntry).createdAt !== "number" ||
        now - (entry as CacheEntry).createdAt > STUDY_CACHE_TTL_MS
      ) {
        return [];
      }
      const parsed = StudyReviewResponseSchema.safeParse((entry as CacheEntry).response);
      if (!parsed.success || parsed.data.contentVersion !== STUDY_CONTENT_VERSION) {
        return [];
      }
      return [
        {
          key: (entry as CacheEntry).key,
          createdAt: (entry as CacheEntry).createdAt,
          response: parsed.data,
        },
      ];
    });
  } catch {
    return [];
  }
}

function writeEntries(entries: CacheEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        entries.sort((a, b) => b.createdAt - a.createdAt).slice(0, STUDY_CACHE_MAX_ENTRIES),
      ),
    );
  } catch {
    // Storage may be disabled or full; review generation must still work.
  }
}

export function readStudyReviewCache(request: StudyReviewRequest): StudyReviewResponse | null {
  const key = getStudyReviewCacheKey(request);
  const entry = readEntries().find((candidate) => candidate.key === key);
  if (!entry) return null;
  return { ...entry.response, source: "cache" };
}

export function writeStudyReviewCache(
  request: StudyReviewRequest,
  responseInput: StudyReviewResponse,
): void {
  const parsed = StudyReviewResponseSchema.safeParse(responseInput);
  if (
    !parsed.success ||
    parsed.data.source === "static" ||
    parsed.data.contentVersion !== STUDY_CONTENT_VERSION
  ) {
    return;
  }
  const key = getStudyReviewCacheKey(request);
  const entries = readEntries().filter((entry) => entry.key !== key);
  entries.unshift({ key, createdAt: Date.now(), response: parsed.data });
  writeEntries(entries);
}

export function clearStudyReviewCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // No-op.
  }
}
