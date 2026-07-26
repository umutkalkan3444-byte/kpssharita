import { z } from "zod";

export const ExamTagSchema = z.enum(["KPSS", "YKS-TYT", "YKS-AYT"]);
export type ExamTag = z.infer<typeof ExamTagSchema>;

export const VerifiedFactSchema = z.object({
  id: z.string().min(1).max(160),
  categorySlug: z.string().min(1).max(64),
  itemIds: z.array(z.string().min(1).max(120)).max(8),
  text: z.string().min(1).max(420),
  memoryHook: z.string().min(1).max(220).optional(),
  examTags: z.array(ExamTagSchema).min(1).max(3),
  importance: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  sourceRefs: z.array(z.string().min(1).max(120)).min(1).max(6),
  reviewedAt: z.string().min(8).max(32),
  contentVersion: z.string().min(1).max(40),
});
export type VerifiedFact = z.infer<typeof VerifiedFactSchema>;

const ChoiceIndexSchema = z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]);

export const WarmupQuestionSchema = z.object({
  id: z.string().min(1).max(160),
  categorySlug: z.string().min(1).max(64),
  prompt: z.string().min(1).max(600),
  statements: z.array(z.string().min(1).max(240)).max(3).optional(),
  choices: z.tuple([
    z.string().min(1).max(220),
    z.string().min(1).max(220),
    z.string().min(1).max(220),
    z.string().min(1).max(220),
  ]),
  correctIndex: ChoiceIndexSchema,
  explanation: z.string().min(1).max(600),
  relatedFactIds: z.array(z.string().min(1).max(160)).min(1).max(8),
  sourceRefs: z.array(z.string().min(1).max(120)).min(1).max(6),
  contentVersion: z.string().min(1).max(40),
});
export type WarmupQuestion = z.infer<typeof WarmupQuestionSchema>;

export const WarmupCompletionSchema = z.object({
  questionIds: z.array(z.string().min(1).max(160)).length(3),
  wrongQuestionIds: z.array(z.string().min(1).max(160)).max(3),
  correctCount: z.number().int().min(0).max(3),
});
export type WarmupCompletion = z.infer<typeof WarmupCompletionSchema>;

export const StudyMistakeSchema = z.object({
  kind: z.enum(["target", "province"]),
  id: z.string().min(1).max(120),
  droppedOnId: z.string().min(1).max(120).optional(),
  count: z.number().int().min(1).max(99),
});
export type StudyMistake = z.infer<typeof StudyMistakeSchema>;

export const StudyReviewRequestSchema = z.object({
  categorySlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9çğıöşü-]+$/),
  correctCount: z.number().int().min(0).max(500),
  wrongCount: z.number().int().min(0).max(5_000),
  totalMs: z
    .number()
    .int()
    .min(0)
    .max(24 * 60 * 60 * 1000),
  wrongAttempts: z.array(StudyMistakeSchema).max(100),
  wrongWarmupQuestionIds: z.array(z.string().min(1).max(160)).max(3).default([]),
});
export type StudyReviewRequest = z.infer<typeof StudyReviewRequestSchema>;

export const ReviewReasonSchema = z.enum([
  "repeated_error",
  "warmup_gap",
  "exam_high_yield",
  "prerequisite",
]);
export type ReviewReason = z.infer<typeof ReviewReasonSchema>;

export const AiReviewPlanSchema = z.object({
  essentialFactIds: z.array(z.string().min(1).max(160)).min(1).max(6),
  focus: z
    .array(
      z.object({
        mistakeId: z.string().min(1).max(180),
        factIds: z.array(z.string().min(1).max(160)).min(1).max(3),
        reason: ReviewReasonSchema,
      }),
    )
    .min(1)
    .max(4),
  studyOrder: z.array(z.string().min(1).max(180)).min(1).max(4),
  closingTone: z.enum(["encouraging", "careful", "mastery"]),
});
export type AiReviewPlan = z.infer<typeof AiReviewPlanSchema>;

export const StudyReviewFocusSchema = z.object({
  mistakeId: z.string().min(1).max(180),
  label: z.string().min(1).max(160),
  count: z.number().int().min(1).max(99),
  reason: ReviewReasonSchema,
  facts: z.array(VerifiedFactSchema).min(1).max(3),
});
export type StudyReviewFocus = z.infer<typeof StudyReviewFocusSchema>;

export const StudyReviewSchema = z.object({
  title: z.string().min(1).max(140),
  essentials: z.array(VerifiedFactSchema).min(1).max(6),
  focus: z.array(StudyReviewFocusSchema).max(8),
  remainingMistakes: z.array(z.string().min(1).max(160)).max(100),
  closing: z.string().min(1).max(260),
});
export type StudyReview = z.infer<typeof StudyReviewSchema>;

export const StudyReviewResponseSchema = z.object({
  source: z.enum(["ai", "cache", "static"]),
  contentVersion: z.string().min(1).max(40),
  review: StudyReviewSchema,
});
export type StudyReviewResponse = z.infer<typeof StudyReviewResponseSchema>;

export function mistakeKey(mistake: Pick<StudyMistake, "kind" | "id" | "droppedOnId">): string {
  return `${mistake.kind}:${mistake.id}${mistake.droppedOnId ? `>${mistake.droppedOnId}` : ""}`;
}

export function normalizeStudyReviewRequest(input: StudyReviewRequest): StudyReviewRequest {
  const parsed = StudyReviewRequestSchema.parse(input);
  const merged = new Map<string, StudyMistake>();
  for (const mistake of parsed.wrongAttempts) {
    const key = mistakeKey(mistake);
    const previous = merged.get(key);
    merged.set(key, {
      ...mistake,
      count: Math.min(99, (previous?.count ?? 0) + mistake.count),
    });
  }

  return {
    ...parsed,
    wrongAttempts: Array.from(merged.values()).sort((a, b) =>
      mistakeKey(a).localeCompare(mistakeKey(b), "tr"),
    ),
    wrongWarmupQuestionIds: Array.from(new Set(parsed.wrongWarmupQuestionIds)).sort((a, b) =>
      a.localeCompare(b, "tr"),
    ),
  };
}
