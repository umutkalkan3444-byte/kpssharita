import { CATEGORY_MAP, type Category } from "@/lib/game-data";
import { type WarmupQuestion, WarmupQuestionSchema } from "@/lib/study/schemas";
import { categoryOverviewFactId, itemStudyFactId } from "./facts";
import { STUDY_CONTENT_VERSION } from "./version";
import { sourceRefsForCategory } from "./sources";

/**
 * Add externally checked, category-specific questions here. They are selected
 * before generated spatial questions and still pass the shared Zod schema.
 */
export const CURATED_QUESTION_BANK: Readonly<Partial<Record<string, readonly WarmupQuestion[]>>> =
  {};

type Item = Category["items"][number];

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function spreadItems(category: Category, axis: "lat" | "lon", direction: "asc" | "desc"): Item[] {
  const sign = direction === "asc" ? 1 : -1;
  const sorted = category.items
    .slice()
    .sort((a, b) => sign * (a[axis] - b[axis]) || a.name.localeCompare(b.name, "tr"))
    .filter(
      (item, index, all) => index === 0 || Math.abs(item[axis] - all[index - 1][axis]) > 0.000_001,
    );
  if (sorted.length <= 3) return sorted;
  return [sorted[0], sorted[Math.floor((sorted.length - 1) / 2)], sorted.at(-1)!];
}

function choiceTuple(
  correct: string,
  distractors: [string, string, string],
  seed: string,
): { choices: WarmupQuestion["choices"]; correctIndex: 0 | 1 | 2 | 3 } {
  const unique = [correct, ...distractors].filter(
    (value, index, all) => all.indexOf(value) === index,
  );
  while (unique.length < 4) unique.push(`${unique.at(-1)} — farklı sıra`);

  const correctIndex = (stableHash(seed) % 4) as 0 | 1 | 2 | 3;
  const choices = unique.slice(1, 4);
  choices.splice(correctIndex, 0, correct);
  return {
    choices: choices as WarmupQuestion["choices"],
    correctIndex,
  };
}

function orderQuestion(category: Category, axis: "lat" | "lon"): WarmupQuestion | null {
  const northOrWest = axis === "lat" ? "kuzeyden güneye" : "batıdan doğuya";
  const ordered = spreadItems(category, axis, axis === "lat" ? "desc" : "asc");
  if (ordered.length < 3) return null;
  const names = ordered.map((item) => item.name);
  const correct = names.join(" → ");
  const option = (indices: number[]) => indices.map((index) => names[index]).join(" → ");
  const { choices, correctIndex } = choiceTuple(
    correct,
    [option([2, 1, 0]), option([1, 0, 2]), option([0, 2, 1])],
    `${category.slug}:${axis}`,
  );

  return {
    id: `warmup:${category.slug}:${axis === "lat" ? "north-south" : "west-east"}`,
    categorySlug: category.slug,
    prompt: `${category.title} hedeflerinden aşağıdaki üçlü, uygulamadaki doğrulanmış merkez koordinatlarına göre ${northOrWest} hangi sıradadır?`,
    choices,
    correctIndex,
    explanation: `Doğru sıra ${correct} biçimindedir. Sıralamada hedeflerin merkez koordinatları kullanılır.`,
    relatedFactIds: [
      categoryOverviewFactId(category.slug),
      ...ordered.map((item) => itemStudyFactId(category.slug, item.id)),
    ],
    sourceRefs: sourceRefsForCategory(category),
    contentVersion: STUDY_CONTENT_VERSION,
  };
}

function membershipQuestion(category: Category): WarmupQuestion | null {
  const members = category.items
    .slice()
    .sort(
      (a, b) =>
        stableHash(`${category.slug}:member:${a.id}`) -
          stableHash(`${category.slug}:member:${b.id}`) || a.name.localeCompare(b.name, "tr"),
    )
    .filter(
      (item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index,
    )
    .slice(0, 3);
  if (members.length === 0) return null;

  const memberNames = new Set(category.items.map((item) => item.name));
  const nonMembers = Object.values(CATEGORY_MAP)
    .flatMap((candidate) => candidate.items)
    .filter((item) => !memberNames.has(item.name))
    .filter(
      (item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index,
    )
    .sort(
      (a, b) =>
        stableHash(`${category.slug}:${a.name}`) - stableHash(`${category.slug}:${b.name}`) ||
        a.name.localeCompare(b.name, "tr"),
    )
    .slice(0, 3);
  if (nonMembers.length < 3) return null;

  const correct = members.map((item) => item.name).join(" · ");
  const distractors = nonMembers.map((nonMember, index) => {
    if (members.length === 1) return nonMember.name;
    const retained = members.filter((_, memberIndex) => memberIndex !== index % members.length);
    return [...retained.map((item) => item.name), nonMember.name].join(" · ");
  }) as [string, string, string];
  const { choices, correctIndex } = choiceTuple(
    correct,
    distractors,
    `${category.slug}:membership`,
  );

  return {
    id: `warmup:${category.slug}:membership`,
    categorySlug: category.slug,
    prompt:
      members.length > 1
        ? `Aşağıdaki gruplardan hangisindeki unsurların tamamı “${category.title}” kapsamında birlikte değerlendirilir?`
        : `Aşağıdakilerden hangisi “${category.title}” kapsamında değerlendirilir?`,
    choices,
    correctIndex,
    explanation: `${members.map((item) => item.name).join(", ")} bu kategorinin doğrulanmış hedef listesindedir. Diğer seçeneklerde en az bir farklı kategori hedefi bulunur.`,
    relatedFactIds: [
      categoryOverviewFactId(category.slug),
      ...members.map((item) => itemStudyFactId(category.slug, item.id)),
    ],
    sourceRefs: sourceRefsForCategory(category),
    contentVersion: STUDY_CONTENT_VERSION,
  };
}

function referenceQuestion(category: Category, item: Item, index: number): WarmupQuestion {
  const references = [
    { lat: 39, lon: 35 },
    { lat: 38, lon: 32 },
    { lat: 40, lon: 30 },
  ] as const;
  const reference = references[index % references.length];
  const north = item.lat >= reference.lat;
  const east = item.lon >= reference.lon;
  const options = [
    `${reference.lat}° K kuzeyi ve ${reference.lon}° D doğusu`,
    `${reference.lat}° K kuzeyi ve ${reference.lon}° D batısı`,
    `${reference.lat}° K güneyi ve ${reference.lon}° D doğusu`,
    `${reference.lat}° K güneyi ve ${reference.lon}° D batısı`,
  ] as const;
  const correctIndex = (north ? (east ? 0 : 1) : east ? 2 : 3) as 0 | 1 | 2 | 3;

  return {
    id: `warmup:${category.slug}:reference-${index + 1}`,
    categorySlug: category.slug,
    prompt: `${item.name} hedefinin doğrulanmış merkez koordinatı hangi iki konum bilgisini birlikte sağlar?`,
    choices: [...options] as WarmupQuestion["choices"],
    correctIndex,
    explanation: `${item.name} hedefinin merkez koordinatı yaklaşık ${item.lat.toFixed(2)}° K, ${item.lon.toFixed(2)}° D'dir.`,
    relatedFactIds: [
      categoryOverviewFactId(category.slug),
      itemStudyFactId(category.slug, item.id),
    ],
    sourceRefs: sourceRefsForCategory(category),
    contentVersion: STUDY_CONTENT_VERSION,
  };
}

function generatedQuestions(category: Category): WarmupQuestion[] {
  if (category.items.length === 0) return [];
  const conceptual = membershipQuestion(category);
  const spatial = [orderQuestion(category, "lat"), orderQuestion(category, "lon")].filter(
    (question): question is WarmupQuestion => question !== null,
  );
  const questions = [...(conceptual ? [conceptual] : []), ...spatial];
  for (let index = 0; questions.length < 3 && index < 3; index++) {
    questions.push(
      referenceQuestion(category, category.items[index % category.items.length], index),
    );
  }
  return questions.slice(0, 3);
}

export function getWarmupQuestionBank(categorySlug: string): WarmupQuestion[] {
  const category = CATEGORY_MAP[categorySlug];
  if (!category) return [];

  const curated = (CURATED_QUESTION_BANK[categorySlug] ?? []).flatMap((question) => {
    const parsed = WarmupQuestionSchema.safeParse(question);
    return parsed.success ? [parsed.data] : [];
  });
  const combined = [...curated, ...generatedQuestions(category)];
  const seen = new Set<string>();
  return combined.filter((question) => {
    if (seen.has(question.id)) return false;
    seen.add(question.id);
    return true;
  });
}
