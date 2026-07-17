import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, Award, Calendar, ChevronLeft } from "lucide-react";

import { loadState, xpProgress, type GameState } from "@/lib/storage";
import { CATEGORIES } from "@/lib/game-data";

export const Route = createFileRoute("/istatistik")({
  head: () => ({
    meta: [
      { title: "İstatistikler — Harita Ustası" },
      { name: "description", content: "Seviyeni, serini, kategori başarılarını ve rozetlerini görüntüle." },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const [state, setState] = useState<GameState | null>(null);
  useEffect(() => setState(loadState()), []);

  if (!state) return null;
  const xp = xpProgress(state);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-cyan-50 pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Ana sayfa
        </Link>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">İstatistiklerim</h1>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi icon={<Trophy className="h-4 w-4" />} label="Seviye" value={state.level} accent="from-amber-400 to-orange-500" />
          <Kpi icon={<Flame className="h-4 w-4" />} label="Seri" value={`${state.streak} gün`} accent="from-orange-400 to-rose-500" />
          <Kpi icon={<Calendar className="h-4 w-4" />} label="Çalışılan gün" value={state.daysPlayed.length} accent="from-cyan-400 to-teal-500" />
          <Kpi icon={<Award className="h-4 w-4" />} label="Rozet" value={state.badges.length} accent="from-emerald-400 to-cyan-500" />
        </div>

        <div className="mt-4 rounded-3xl border border-cyan-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>XP {xp.xp} / {xp.need}</span>
            <span>Seviye {state.level}</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-cyan-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${xp.pct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        <h2 className="mt-8 text-xl font-black">Kategoriler</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CATEGORIES.map((c) => {
            const s = state.categories[c.slug];
            return (
              <Link
                key={c.slug}
                to="/kategori/$slug"
                params={{ slug: c.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-cyan-100 bg-white/80 p-4 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
              >
                <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${c.gradient} text-xl`}>
                  {c.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black text-slate-900">{c.title}</div>
                  {s ? (
                    <div className="mt-0.5 text-xs text-slate-500">
                      En iyi %{s.best} · ✓ {s.totalCorrect} / ✗ {s.totalWrong} · {s.runs} oturum
                    </div>
                  ) : (
                    <div className="mt-0.5 text-xs text-slate-400">Henüz oynanmadı</div>
                  )}
                </div>
                {s?.perfect && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    %100
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {state.badges.length > 0 && (
          <>
            <h2 className="mt-8 text-xl font-black">Rozetler</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {state.badges.map((b) => (
                <div key={b} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  🏅 {b}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="mt-8">
          <Link
            to="/tekrar"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/30 transition-transform hover:scale-105"
          >
            Yanlışları tekrar et →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-3xl border border-cyan-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <div className={`inline-grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${accent} text-white`}>
        {icon}
      </div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}
