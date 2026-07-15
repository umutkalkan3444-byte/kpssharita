// LocalStorage-backed game state: XP, streaks, per-category stats,
// wrong-answer log for spaced repetition.
const KEY = "kpss-cografya-v1";

export type CategoryStat = {
  best: number; // best score %
  totalCorrect: number;
  totalWrong: number;
  runs: number;
  completedAt?: string;
  perfect: boolean;
};

export type WrongLog = {
  categorySlug: string;
  itemId: string;
  count: number;
  lastWrong: string;
  nextDue: string;
};

export type GameState = {
  xp: number;
  level: number;
  streak: number;
  lastPlayed?: string;
  daysPlayed: string[];
  categories: Record<string, CategoryStat>;
  wrongs: Record<string, WrongLog>; // key: `${slug}:${itemId}`
  badges: string[];
};

const empty = (): GameState => ({
  xp: 0,
  level: 1,
  streak: 0,
  daysPlayed: [],
  categories: {},
  wrongs: {},
  badges: [],
});

export function loadState(): GameState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...(JSON.parse(raw) as GameState) };
  } catch {
    return empty();
  }
}

export function saveState(s: GameState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function xpForLevel(level: number) {
  return level * 200;
}

export function recordRun(
  slug: string,
  correct: number,
  wrong: number,
  wrongItemIds: string[],
): GameState {
  const s = loadState();
  const total = correct + wrong;
  const pct = total ? Math.round((correct / total) * 100) : 0;

  const prev: CategoryStat = s.categories[slug] ?? {
    best: 0,
    totalCorrect: 0,
    totalWrong: 0,
    runs: 0,
    perfect: false,
  };
  prev.best = Math.max(prev.best, pct);
  prev.totalCorrect += correct;
  prev.totalWrong += wrong;
  prev.runs += 1;
  prev.completedAt = new Date().toISOString();
  if (pct === 100) prev.perfect = true;
  s.categories[slug] = prev;

  // XP: 10 per correct, +50 bonus for perfect
  const gained = correct * 10 + (pct === 100 ? 50 : 0);
  s.xp += gained;
  while (s.xp >= xpForLevel(s.level)) {
    s.xp -= xpForLevel(s.level);
    s.level += 1;
  }

  // Streak
  const t = today();
  if (s.lastPlayed !== t) {
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    s.streak = s.lastPlayed === y ? s.streak + 1 : 1;
    s.lastPlayed = t;
    if (!s.daysPlayed.includes(t)) s.daysPlayed.push(t);
  }

  // Spaced repetition: log wrongs; correct removes
  for (const id of wrongItemIds) {
    const key = `${slug}:${id}`;
    const w = s.wrongs[key] ?? {
      categorySlug: slug,
      itemId: id,
      count: 0,
      lastWrong: "",
      nextDue: "",
    };
    w.count += 1;
    w.lastWrong = new Date().toISOString();
    const days = Math.min(w.count, 5);
    w.nextDue = new Date(Date.now() + days * 86400000).toISOString();
    s.wrongs[key] = w;
  }

  // Badges
  if (pct === 100 && !s.badges.includes(`perfect-${slug}`))
    s.badges.push(`perfect-${slug}`);
  if (s.streak >= 3 && !s.badges.includes("streak-3")) s.badges.push("streak-3");
  if (s.streak >= 7 && !s.badges.includes("streak-7")) s.badges.push("streak-7");
  if (s.level >= 5 && !s.badges.includes("level-5")) s.badges.push("level-5");

  saveState(s);
  return s;
}

export function xpProgress(s: GameState) {
  const need = xpForLevel(s.level);
  return { xp: s.xp, need, pct: Math.min(100, Math.round((s.xp / need) * 100)) };
}

export function dueWrongs(s: GameState): WrongLog[] {
  const now = Date.now();
  return Object.values(s.wrongs).filter((w) => new Date(w.nextDue).getTime() <= now);
}

export function clearWrong(slug: string, itemId: string) {
  const s = loadState();
  delete s.wrongs[`${slug}:${itemId}`];
  saveState(s);
}
