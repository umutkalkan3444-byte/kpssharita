import { CATEGORY_MAP, type Category } from "@/lib/game-data";
import { type WarmupQuestion, WarmupQuestionSchema } from "@/lib/study/schemas";
import { categoryOverviewFactId, itemStudyFactId } from "./facts";
import { STUDY_CONTENT_VERSION } from "./version";
import { sourceRefsForCategory } from "./sources";
import { TOPIC_ESSENTIALS } from "@/data/topic-essentials";

/**
 * Add externally checked, category-specific questions here. They are selected
 * before generated spatial questions and still pass the shared Zod schema.
 */
export const CURATED_QUESTION_BANK: Readonly<Partial<Record<string, readonly WarmupQuestion[]>>> = {
  ruzgarlar: [
    {
      id: "warmup:ruzgarlar:adlandirma",
      categorySlug: "ruzgarlar",
      prompt: "Türkiye'deki yerel rüzgârların adlandırılmasıyla ilgili doğru ilke hangisidir?",
      choices: [
        "Rüzgâr adını gittiği yönden alır.",
        "Adı yalnız sıcaklığına göre verilir.",
        "Rüzgâr adını geldiği yönden alır.",
        "Adı yalnız estiği mevsime göre verilir.",
      ],
      correctIndex: 2,
      explanation:
        "Rüzgâr yönü, havanın geldiği yönle adlandırılır; bu nedenle Lodos güneybatıdan gelir.",
      relatedFactIds: ["fact:ruzgarlar:overview"],
      sourceRefs: ["mgm-ruzgar-adlari", "meb-cografya", "osym-kpss-2026"],
      contentVersion: STUDY_CONTENT_VERSION,
    },
    {
      id: "warmup:ruzgarlar:soguklar",
      categorySlug: "ruzgarlar",
      prompt:
        "Aşağıdaki üçlülerden hangisi kuzeyli ve genel olarak soğuk rüzgârları birlikte verir?",
      choices: [
        "Lodos – Kıble – Keşişleme",
        "Karayel – Yıldız – Poyraz",
        "Günbatısı – Lodos – Kıble",
        "Poyraz – Kıble – Günbatısı",
      ],
      correctIndex: 1,
      explanation:
        "Karayel kuzeybatıdan, Yıldız kuzeyden, Poyraz kuzeydoğudan eser ve genel olarak soğuktur.",
      relatedFactIds: ["fact:ruzgarlar:overview"],
      sourceRefs: ["mgm-ruzgar-adlari", "meb-cografya", "osym-kpss-2026"],
      contentVersion: STUDY_CONTENT_VERSION,
    },
    {
      id: "warmup:ruzgarlar:sicaklar",
      categorySlug: "ruzgarlar",
      prompt: "Güneybatıdan sıcak ve nemli eserek kar erimesini hızlandırabilen rüzgâr hangisidir?",
      choices: ["Karayel", "Poyraz", "Yıldız", "Lodos"],
      correctIndex: 3,
      explanation:
        "Lodos güneybatıdan gelir; sıcak ve nemli karakteri kar erimesi, sel ve soba zehirlenmesi riskini artırabilir.",
      relatedFactIds: ["fact:ruzgarlar:overview"],
      sourceRefs: ["mgm-ruzgar-adlari", "meb-cografya", "osym-kpss-2026"],
      contentVersion: STUDY_CONTENT_VERSION,
    },
  ],
};

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

function nearbyCategories(category: Category): Category[] {
  const order = (candidates: Category[]) =>
    candidates.sort(
      (first, second) =>
        stableHash(`${category.slug}:nearby:${first.slug}`) -
          stableHash(`${category.slug}:nearby:${second.slug}`) ||
        first.slug.localeCompare(second.slug, "tr"),
    );
  const all = Object.values(CATEGORY_MAP).filter((candidate) => candidate.slug !== category.slug);
  return [
    ...order(all.filter((candidate) => candidate.mainSlug === category.mainSlug)),
    ...order(all.filter((candidate) => candidate.mainSlug !== category.mainSlug)),
  ];
}

function topicQuestion(
  category: Category,
  kind: "definition" | "key-point",
): WarmupQuestion | null {
  const own = TOPIC_ESSENTIALS[category.slug];
  if (!own) return null;
  const ownText = kind === "definition" ? own.definition : own.keyPoints[0];
  const distractors = nearbyCategories(category)
    .map((candidate) => TOPIC_ESSENTIALS[candidate.slug])
    .filter((topic): topic is (typeof TOPIC_ESSENTIALS)[string] => Boolean(topic))
    .map((topic) => (kind === "definition" ? topic.definition : topic.keyPoints[0]))
    .filter((text, index, all) => all.indexOf(text) === index)
    .slice(0, 3) as [string, string, string];
  if (distractors.length < 3) return null;
  const { choices, correctIndex } = choiceTuple(
    ownText,
    distractors,
    `${category.slug}:topic:${kind}`,
  );

  return {
    id: `warmup:${category.slug}:topic-${kind}`,
    categorySlug: category.slug,
    prompt:
      kind === "definition"
        ? `“${category.title}” konusunu doğru tanımlayan ve kapsamını doğru kuran seçenek hangisidir?`
        : `“${category.title}” için ÖSYM/KPSS açısından doğru olan temel bilgi hangisidir?`,
    choices,
    correctIndex,
    explanation: `${ownText} ${own.examTip}`,
    relatedFactIds: [categoryOverviewFactId(category.slug)],
    sourceRefs: sourceRefsForCategory(category),
    contentVersion: STUDY_CONTENT_VERSION,
  };
}

function multipleInformationQuestion(category: Category): WarmupQuestion | null {
  const own = TOPIC_ESSENTIALS[category.slug];
  const memberNames = new Set(category.items.map((item) => item.name));
  const comparison = nearbyCategories(category).find((candidate) =>
    candidate.items.some((item) => !memberNames.has(item.name)),
  );
  const trapItem = comparison?.items.find((item) => !memberNames.has(item.name));
  if (!own || !comparison || !trapItem) return null;

  const falseStatement = `${trapItem.name}, “${category.title}” kapsamında doğru harita hedeflerinden biridir.`;
  const falseIndex = stableHash(`${category.slug}:multiple-information`) % 3;
  const statements = [own.definition, own.keyPoints[0]];
  statements.splice(falseIndex, 0, falseStatement);

  const labels = ["I", "II", "III"];
  const correct = labels.filter((_, index) => index !== falseIndex).join(" ve ");
  const pairChoices = ["I ve II", "I ve III", "II ve III"].filter((choice) => choice !== correct);
  const distractors = [...pairChoices, "I, II ve III"].slice(0, 3) as [string, string, string];
  const { choices, correctIndex } = choiceTuple(
    correct,
    distractors,
    `${category.slug}:multiple-information`,
  );

  return {
    id: `warmup:${category.slug}:multiple-information`,
    categorySlug: category.slug,
    prompt: `“${category.title}” hakkında verilen bilgilerden hangileri doğrudur?`,
    statements: statements as [string, string, string],
    choices,
    correctIndex,
    explanation: `${own.definition} ${own.keyPoints[0]} ${trapItem.name} ise “${comparison.title}” hedefidir; bu oyunun doğru kümesinde değildir.`,
    relatedFactIds: [categoryOverviewFactId(category.slug)],
    sourceRefs: sourceRefsForCategory(category),
    contentVersion: STUDY_CONTENT_VERSION,
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
  const nearbyItems = nearbyCategories(category).flatMap((candidate) => candidate.items);
  const nonMembers = nearbyItems
    .filter((item) => !memberNames.has(item.name))
    .filter(
      (item, index, all) => all.findIndex((candidate) => candidate.name === item.name) === index,
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
  if (category.slug === "ruzgarlar") return [];
  if (category.items.length === 0) return [];
  const multipleInformation = multipleInformationQuestion(category);
  const keyPoint = topicQuestion(category, "key-point");
  const membership = membershipQuestion(category);
  const spatial = [orderQuestion(category, "lat"), orderQuestion(category, "lon")].filter(
    (question): question is WarmupQuestion => question !== null,
  );
  const questions = [multipleInformation, keyPoint, membership].filter(
    (question): question is WarmupQuestion => question !== null,
  );
  questions.push(...spatial);
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
