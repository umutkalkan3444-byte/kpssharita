import { CATEGORY_MAP, type Category } from "@/lib/game-data";
import { type StudyMistake, type VerifiedFact } from "@/lib/study/schemas";
import { STUDY_CONTENT_VERSION } from "./version";
import { sourceRefsForCategory } from "./sources";

const REVIEWED_AT = "2026-07-26";
const EXAM_TAGS = ["KPSS", "YKS-TYT", "YKS-AYT"] as const;

export function categoryOverviewFactId(categorySlug: string): string {
  return `fact:${categorySlug}:overview`;
}

export function itemStudyFactId(categorySlug: string, itemId: string): string {
  return `fact:${categorySlug}:item:${itemId}`;
}

export function provinceMistakeStudyFactId(categorySlug: string, provinceName: string): string {
  return `fact:${categorySlug}:province:${slugPart(provinceName)}`;
}

function slugPart(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sortedBy(
  category: Category,
  value: (item: Category["items"][number]) => number,
  direction: "asc" | "desc",
) {
  const sign = direction === "asc" ? 1 : -1;
  return category.items
    .slice()
    .sort((a, b) => sign * (value(a) - value(b)) || a.name.localeCompare(b.name, "tr"));
}

function overviewText(category: Category): string {
  if (category.items.length === 0) {
    return `${category.title} konusu için henüz doğrulanmış bir harita hedefi bulunmuyor.`;
  }
  if (category.items.length === 1) {
    return `${category.items[0].name}, ${category.title} harita oyununun doğrulanmış hedefidir.`;
  }

  const north = sortedBy(category, (item) => item.lat, "desc")[0];
  const south = sortedBy(category, (item) => item.lat, "asc")[0];
  const west = sortedBy(category, (item) => item.lon, "asc")[0];
  const east = sortedBy(category, (item) => item.lon, "desc")[0];
  return `${category.title} hedefleri içinde merkez koordinatına göre en kuzeyde ${north.name}, en güneyde ${south.name}, en batıda ${west.name}, en doğuda ${east.name} yer alır.`;
}

function itemRelationText(category: Category, item: Category["items"][number]): string {
  const others = category.items.filter((candidate) => candidate.id !== item.id);
  if (others.length === 0) {
    return `${item.name}, ${category.title} harita oyununun doğrulanmış hedefidir.`;
  }

  const horizontalAnchor = others
    .slice()
    .sort(
      (a, b) =>
        Math.abs(b.lon - item.lon) - Math.abs(a.lon - item.lon) ||
        a.name.localeCompare(b.name, "tr"),
    )[0];
  const verticalAnchor = others
    .slice()
    .sort(
      (a, b) =>
        Math.abs(b.lat - item.lat) - Math.abs(a.lat - item.lat) ||
        a.name.localeCompare(b.name, "tr"),
    )[0];

  const horizontal = item.lon >= horizontalAnchor.lon ? "doğusunda" : "batısında";
  const vertical = item.lat >= verticalAnchor.lat ? "kuzeyinde" : "güneyinde";
  const hint = item.hint ? `${item.hint.trim()} ` : "";

  return `${hint}Haritadaki doğrulanmış merkez koordinatlarına göre ${item.name}, ${horizontalAnchor.name} hedefinin ${horizontal}; ${verticalAnchor.name} hedefinin ${vertical} yer alır.`;
}

function itemMemoryHook(category: Category, item: Category["items"][number]): string {
  const westToEast = sortedBy(category, (candidate) => candidate.lon, "asc");
  const index = westToEast.findIndex((candidate) => candidate.id === item.id);
  if (index < 0 || westToEast.length < 2) {
    return `${item.name} adını ${category.title} başlığıyla birlikte tekrar et.`;
  }

  const band =
    index < westToEast.length / 3 ? "batı" : index >= (westToEast.length * 2) / 3 ? "doğu" : "orta";
  return `${item.name} için önce ${category.title} konusunu, sonra haritanın ${band} bölümünü hatırla.`;
}

function buildBaseFacts(category: Category): VerifiedFact[] {
  const sourceRefs = sourceRefsForCategory(category);
  const overview: VerifiedFact = {
    id: categoryOverviewFactId(category.slug),
    categorySlug: category.slug,
    itemIds: category.items.slice(0, 8).map((item) => item.id),
    text: overviewText(category),
    memoryHook: "Önce dört uç noktayı zihninde sabitle: kuzey, güney, batı, doğu.",
    examTags: [...EXAM_TAGS],
    importance: 3,
    sourceRefs,
    reviewedAt: REVIEWED_AT,
    contentVersion: STUDY_CONTENT_VERSION,
  };

  const itemFacts = category.items.map<VerifiedFact>((item) => ({
    id: itemStudyFactId(category.slug, item.id),
    categorySlug: category.slug,
    itemIds: [item.id],
    text: itemRelationText(category, item),
    memoryHook: itemMemoryHook(category, item),
    examTags: [...EXAM_TAGS],
    importance: item.hint ? 3 : 2,
    sourceRefs,
    reviewedAt: REVIEWED_AT,
    contentVersion: STUDY_CONTENT_VERSION,
  }));

  return [overview, ...itemFacts];
}

function buildProvinceMistakeFact(category: Category, mistake: StudyMistake): VerifiedFact {
  return {
    id: provinceMistakeStudyFactId(category.slug, mistake.id),
    categorySlug: category.slug,
    itemIds: [],
    text: `${mistake.id}, ${category.title} oyununun doğrulanmış hedef listesinde yer almaz. Bu seçim yerine sağlanan hedef adlarını kategoriyle birlikte tekrar et.`,
    memoryHook: `“${mistake.id} bu hedef listesinde mi?” kontrolünü yapmadan haritada seçim yapma.`,
    examTags: [...EXAM_TAGS],
    importance: mistake.count > 1 ? 3 : 2,
    sourceRefs: ["curriculum-reviewed"],
    reviewedAt: REVIEWED_AT,
    contentVersion: STUDY_CONTENT_VERSION,
  };
}

export function getStudyFacts(
  categorySlug: string,
  provinceMistakes: readonly StudyMistake[] = [],
): VerifiedFact[] {
  const category = CATEGORY_MAP[categorySlug];
  if (!category) return [];

  const facts = buildBaseFacts(category);
  for (const mistake of provinceMistakes) {
    if (mistake.kind !== "province") continue;
    facts.push(buildProvinceMistakeFact(category, mistake));
  }
  return facts;
}

export function getStudyFactMap(
  categorySlug: string,
  provinceMistakes: readonly StudyMistake[] = [],
): Map<string, VerifiedFact> {
  return new Map(getStudyFacts(categorySlug, provinceMistakes).map((fact) => [fact.id, fact]));
}

export function factsForItem(categorySlug: string, itemId: string): VerifiedFact[] {
  return getStudyFacts(categorySlug).filter((fact) => fact.itemIds.includes(itemId));
}
