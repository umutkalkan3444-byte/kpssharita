import { CATEGORY_MAP } from "@/lib/game-data";
import {
  categoryOverviewFactId,
  getStudyFactMap,
  getStudyFacts,
  itemStudyFactId,
  provinceMistakeStudyFactId,
} from "@/data/study/facts";
import {
  AiReviewPlanSchema,
  type AiReviewPlan,
  normalizeStudyReviewRequest,
  type ReviewReason,
  type StudyMistake,
  type StudyReview,
  type StudyReviewFocus,
  type StudyReviewRequest,
  type VerifiedFact,
  mistakeKey,
} from "./schemas";

export type ReviewMistakeContext = {
  key: string;
  label: string;
  count: number;
  defaultReason: ReviewReason;
  defaultFactIds: string[];
};

export type AiReviewConstraints = {
  sentFactIds: readonly string[];
  allowedFactIdsByMistake: Readonly<Record<string, readonly string[]>>;
};

function mapMistakeContext(categorySlug: string, mistake: StudyMistake): ReviewMistakeContext {
  const category = CATEGORY_MAP[categorySlug];
  const target = category.items.find((item) => item.id === mistake.id);
  const droppedOn = mistake.droppedOnId
    ? category.items.find((item) => item.id === mistake.droppedOnId)
    : undefined;
  const label =
    mistake.kind === "target"
      ? droppedOn
        ? `${target?.name ?? mistake.id} kartını ${droppedOn.name} hedefine bıraktın`
        : (target?.name ?? mistake.id)
      : mistake.id;
  const primaryFactId =
    mistake.kind === "target"
      ? itemStudyFactId(categorySlug, mistake.id)
      : provinceMistakeStudyFactId(categorySlug, mistake.id);
  const droppedOnFactId = droppedOn ? itemStudyFactId(categorySlug, droppedOn.id) : undefined;

  return {
    key: mistakeKey(mistake),
    label,
    count: mistake.count,
    defaultReason: mistake.count > 1 ? "repeated_error" : "exam_high_yield",
    defaultFactIds: [
      primaryFactId,
      ...(droppedOnFactId ? [droppedOnFactId] : []),
      categoryOverviewFactId(categorySlug),
    ],
  };
}

export function getReviewMistakeContexts(requestInput: StudyReviewRequest): ReviewMistakeContext[] {
  const request = normalizeStudyReviewRequest(requestInput);
  const category = CATEGORY_MAP[request.categorySlug];
  if (!category) throw new Error("Bilinmeyen çalışma kategorisi");

  const mapContexts = request.wrongAttempts.map((mistake) =>
    mapMistakeContext(request.categorySlug, mistake),
  );
  return mapContexts.sort((a, b) => b.count - a.count || a.key.localeCompare(b.key, "tr"));
}

function uniqueFacts(
  factIds: readonly string[],
  factMap: ReadonlyMap<string, VerifiedFact>,
  limit: number,
): VerifiedFact[] {
  const seen = new Set<string>();
  const facts: VerifiedFact[] = [];
  for (const id of factIds) {
    const fact = factMap.get(id);
    if (!fact || seen.has(fact.id)) continue;
    seen.add(fact.id);
    facts.push(fact);
    if (facts.length >= limit) break;
  }
  return facts;
}

function fillEssentials(
  selected: readonly VerifiedFact[],
  allFacts: readonly VerifiedFact[],
): VerifiedFact[] {
  const result = selected.slice(0, 6);
  const seen = new Set(result.map((fact) => fact.id));
  const ranked = allFacts
    .slice()
    .sort((a, b) => b.importance - a.importance || a.id.localeCompare(b.id, "tr"));
  for (const fact of ranked) {
    if (seen.has(fact.id)) continue;
    seen.add(fact.id);
    result.push(fact);
    if (result.length >= Math.min(6, Math.max(3, allFacts.length))) break;
  }
  return result;
}

function closingFor(tone: AiReviewPlan["closingTone"], mistakeCount: number): string {
  if (mistakeCount === 0 || tone === "mastery") {
    return "Haritadaki bilgileri doğru bağladın. Kalıcılık için temel bağlantıları kısa bir kez daha gözden geçir.";
  }
  if (tone === "careful") {
    return "Önce en sık karışan hedefleri, ardından kuzey-güney ve batı-doğu sıralamasını tekrar et; sonra aynı haritayı yeniden dene.";
  }
  return "Yanlışların çalışma rotanı gösteriyor. Yukarıdaki kısa sırayı izleyip aynı oyunu yeniden denediğinde gelişimi daha net göreceksin.";
}

function buildFromPlan(
  request: StudyReviewRequest,
  plan: AiReviewPlan,
  constraints: AiReviewConstraints,
): StudyReview | null {
  const category = CATEGORY_MAP[request.categorySlug];
  if (!category) return null;

  const contexts = getReviewMistakeContexts(request);
  const contextMap = new Map(contexts.map((context) => [context.key, context]));
  const provinceMistakes = request.wrongAttempts.filter((mistake) => mistake.kind === "province");
  const allFacts = getStudyFacts(request.categorySlug, provinceMistakes);
  const factMap = getStudyFactMap(request.categorySlug, provinceMistakes);
  const sentFactIds = new Set(constraints.sentFactIds);
  const focusedMistakeIds = new Set(plan.focus.map((entry) => entry.mistakeId));

  if (
    plan.essentialFactIds.some((factId) => !sentFactIds.has(factId) || !factMap.has(factId)) ||
    plan.studyOrder.some((key) => !contextMap.has(key) || !focusedMistakeIds.has(key))
  ) {
    return null;
  }

  const focusByKey = new Map<string, StudyReviewFocus>();
  for (const entry of plan.focus) {
    const context = contextMap.get(entry.mistakeId);
    const allowedFactIds = new Set(constraints.allowedFactIdsByMistake[entry.mistakeId] ?? []);
    if (
      !context ||
      allowedFactIds.size === 0 ||
      entry.factIds.some(
        (factId) => !allowedFactIds.has(factId) || !sentFactIds.has(factId) || !factMap.has(factId),
      )
    ) {
      return null;
    }
    const facts = uniqueFacts(entry.factIds, factMap, 3);
    if (facts.length === 0) return null;
    focusByKey.set(entry.mistakeId, {
      mistakeId: entry.mistakeId,
      label: context.label,
      count: context.count,
      reason: entry.reason,
      facts,
    });
  }

  const orderedKeys = [...plan.studyOrder, ...plan.focus.map((entry) => entry.mistakeId)];
  const used = new Set<string>();
  const focus = orderedKeys.flatMap((key) => {
    if (used.has(key)) return [];
    const item = focusByKey.get(key);
    if (!item) return [];
    used.add(key);
    return [item];
  });
  const essentials = fillEssentials(uniqueFacts(plan.essentialFactIds, factMap, 6), allFacts);
  const focusedKeys = new Set(focus.map((item) => item.mistakeId));

  return {
    title:
      contexts.length > 0
        ? `${category.title}: kişisel mini çalışma`
        : `${category.title}: hızlı pekiştirme`,
    essentials,
    focus,
    remainingMistakes: contexts
      .filter((context) => !focusedKeys.has(context.key))
      .map((context) => context.label),
    closing: closingFor(plan.closingTone, contexts.length),
  };
}

export function buildStaticReview(requestInput: StudyReviewRequest): StudyReview {
  const request = normalizeStudyReviewRequest(requestInput);
  const category = CATEGORY_MAP[request.categorySlug];
  if (!category) throw new Error("Bilinmeyen çalışma kategorisi");

  const contexts = getReviewMistakeContexts(request);
  const provinceMistakes = request.wrongAttempts.filter((mistake) => mistake.kind === "province");
  const allFacts = getStudyFacts(request.categorySlug, provinceMistakes);
  const factMap = getStudyFactMap(request.categorySlug, provinceMistakes);

  const focus = contexts.slice(0, 8).flatMap<StudyReviewFocus>((context) => {
    const facts = uniqueFacts(context.defaultFactIds, factMap, 3);
    if (facts.length === 0) return [];
    return [
      {
        mistakeId: context.key,
        label: context.label,
        count: context.count,
        reason: context.defaultReason,
        facts,
      },
    ];
  });
  const prioritizedFactIds = [
    categoryOverviewFactId(request.categorySlug),
    ...focus.flatMap((item) => item.facts.map((fact) => fact.id)),
  ];
  const essentials = fillEssentials(uniqueFacts(prioritizedFactIds, factMap, 6), allFacts);

  return {
    title:
      contexts.length > 0
        ? `${category.title}: kişisel mini çalışma`
        : `${category.title}: hızlı pekiştirme`,
    essentials,
    focus,
    remainingMistakes: contexts.slice(8).map((context) => context.label),
    closing: closingFor(contexts.length === 0 ? "mastery" : "encouraging", contexts.length),
  };
}

export function buildReviewFromAiPlan(
  requestInput: StudyReviewRequest,
  planInput: AiReviewPlan,
  constraints: AiReviewConstraints,
): StudyReview | null {
  const request = normalizeStudyReviewRequest(requestInput);
  const parsedPlan = AiReviewPlanSchema.safeParse(planInput);
  if (!parsedPlan.success) return null;
  return buildFromPlan(request, parsedPlan.data, constraints);
}
