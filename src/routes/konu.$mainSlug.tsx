import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";

import { MAIN_MAP, categoriesForMain } from "@/lib/game-data";
import { loadState, type GameState } from "@/lib/storage";

export const Route = createFileRoute("/konu/$mainSlug")({
  head: ({ params }) => {
    const m = MAIN_MAP[params.mainSlug];
    const title = m ? `${m.title} — Harita Ustası` : "Konu — Harita Ustası";
    const desc = m
      ? `${m.title} başlığı altındaki alt konuları Türkiye haritası üzerinde oyunla öğren.`
      : "Türkiye coğrafyası konu kategorisi.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    if (!MAIN_MAP[params.mainSlug]) throw notFound();
    return { mainSlug: params.mainSlug };
  },
  component: MainCategoryPage,
});

function MainCategoryPage() {
  const { mainSlug } = Route.useParams();
  const main = MAIN_MAP[mainSlug];
  const subs = categoriesForMain(mainSlug);
  const [state, setState] = useState<GameState | null>(null);
  useEffect(() => setState(loadState()), []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-sky-50 to-cyan-50 pb-24">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-white hover:text-cyan-700"
          >
            <Home className="h-3.5 w-3.5" /> Ana Sayfa
          </Link>
          <ChevronRight className="h-3 w-3 opacity-50" />
          <span className="rounded-full bg-white/80 px-2 py-1 text-slate-800 ring-1 ring-cyan-100">
            {main.title}
          </span>
        </nav>

        <Link
          to="/"
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 hover:underline sm:hidden"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Geri
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-4 flex items-center gap-4"
        >
          <div
            className={`grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br ${main.gradient} text-3xl shadow-xl shadow-cyan-500/20`}
          >
            {main.emoji}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{main.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{main.description}</p>
          </div>
        </motion.div>

        <div className="mt-2 text-xs font-semibold text-slate-500">{subs.length} alt konu</div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {subs.map((c, i) => {
            const stat = state?.categories[c.slug];
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.03 * i }}
              >
                <Link
                  to="/kategori/$slug"
                  params={{ slug: c.slug }}
                  className="group relative flex h-full items-start gap-3 overflow-hidden rounded-3xl border border-cyan-100 bg-white/85 p-4 shadow-sm shadow-cyan-500/5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/20"
                >
                  <div
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${main.gradient} text-xl shadow-md shadow-cyan-500/20`}
                  >
                    {c.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-black text-slate-900">{c.title}</div>
                      <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                        {c.items.length}
                      </span>
                    </div>
                    {c.description && (
                      <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                        {c.description}
                      </div>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[11px] font-semibold">
                      {stat ? (
                        <>
                          <span className="text-cyan-700">En iyi %{stat.best}</span>
                          {stat.perfect && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              %100 ✓
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">Henüz oynanmadı</span>
                      )}
                      <span className="text-cyan-600 opacity-0 transition-opacity group-hover:opacity-100">
                        Başla →
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
