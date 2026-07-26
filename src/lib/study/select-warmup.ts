import { getWarmupQuestionBank } from "@/data/study/questions";
import { type WarmupQuestion, WarmupQuestionSchema } from "./schemas";

export type WarmupSelectionOptions = {
  seed?: string;
  weakFactIds?: readonly string[];
  previousWrongQuestionIds?: readonly string[];
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectWarmupQuestions(
  questions: readonly WarmupQuestion[],
  options: WarmupSelectionOptions = {},
): WarmupQuestion[] {
  const seed = options.seed ?? "default";
  const weakFacts = new Set(options.weakFactIds ?? []);
  const previousWrongs = new Set(options.previousWrongQuestionIds ?? []);

  const valid = questions.flatMap((question) => {
    const parsed = WarmupQuestionSchema.safeParse(question);
    return parsed.success ? [parsed.data] : [];
  });

  return valid
    .map((question, index) => ({
      question,
      index,
      priority:
        (previousWrongs.has(question.id) ? 1_000 : 0) +
        question.relatedFactIds.filter((id) => weakFacts.has(id)).length * 100,
      tieBreak: stableHash(`${seed}:${question.id}`),
    }))
    .sort((a, b) => b.priority - a.priority || a.tieBreak - b.tieBreak || a.index - b.index)
    .slice(0, 3)
    .map(({ question }) => question);
}

export function getWarmupQuestions(
  categorySlug: string,
  options: WarmupSelectionOptions = {},
): WarmupQuestion[] {
  return selectWarmupQuestions(getWarmupQuestionBank(categorySlug), {
    ...options,
    seed: options.seed ?? categorySlug,
  });
}
