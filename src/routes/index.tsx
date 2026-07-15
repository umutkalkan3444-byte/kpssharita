import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, Sparkles, Repeat2, BarChart3, Trophy, Flame } from "lucide-react";

import { CATEGORIES } from "@/lib/game-data";
import { TurkeyMap } from "@/components/TurkeyMap";
import { loadState, xpProgress, type GameState } from "@/lib/storage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KPSS Coğrafya Harita Oyunu — Harita Üzerinde Öğren" },
      {
        name: "description",
        content:
          "KPSS coğrafya konularını Türkiye haritası üzerinde sürükle-bırak oyunlarıyla öğren. Dağlar, göller, ovalar, iller ve daha fazlası.",
      },
      { property: "og:title", content: "KPSS Coğrafya Harita Oyunu" },
      {
        property: "og:description",
        content: "Harita üzerinde öğren, kalıcı ezberle. KPSS için oyunlaştırılmış coğrafya çalışması.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [state, setState] = useState<GameState | null>(null);
  useEffect(() => {
    setState(loadState());
  }, []);
  const xp = state ? xpProgress(state) : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-sky-50 to-cyan-50 text-slate-900">
      <BackgroundBlobs />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-base font-black tracking-tight">Harita Oyunu</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link
            to="/tekrar"
            className="hidden rounded-full px-3 py-1.5 text-slate-600 transition-colors hover:bg-white hover:text-cyan-700 sm:inline-flex sm:items-center sm:gap-1.5"
          >
            <Repeat2 className="h-4 w-4" /> Tekrar
          </Link>
          <Link
            to="/istatistik"
            className="rounded-full px-3 py-1.5 text-slate-600 transition-colors hover:bg-white hover:text-cyan-700 sm:inline-flex sm:items-center sm:gap-1.5"
          >
            <BarChart3 className="h-4 w-4" /> İstatistik
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pt-6 pb-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-14 lg:pb-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-3 py-1 text-xs font-semibold text-cyan-700 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> KPSS Coğrafya için oyunlaştırılmış çalışma
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            KPSS Coğrafya{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Harita Oyunu
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg"
          >
            Harita üzerinde öğren, kalıcı ezberle. Dağları, gölleri, ovaları ve iller sürükleyip bırakarak
            ÖSYM tarzına hazır ol.
          </motion.p>

          {state && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-cyan-200 bg-white/80 px-3 py-2 shadow-sm backdrop-blur">
                <Trophy className="h-4 w-4 text-amber-500" />
                <div className="text-xs font-semibold text-slate-600">
                  Seviye <span className="text-slate-900">{state.level}</span>
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-cyan-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    style={{ width: `${xp?.pct ?? 0}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl border border-orange-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                <Flame className="h-4 w-4 text-orange-500" /> Seri: {state.streak} gün
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                🏅 {state.badges.length} rozet
              </div>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="overflow-hidden rounded-3xl border border-cyan-200 bg-white/70 p-3 shadow-2xl shadow-cyan-500/20 backdrop-blur"
          >
            <TurkeyMap className="h-auto w-full" />
          </motion.div>
          <FloatingPin className="left-[18%] top-[35%]" delay={0.3} label="Uludağ" />
          <FloatingPin className="right-[10%] top-[42%]" delay={0.9} label="Ağrı" />
          <FloatingPin className="left-[42%] top-[70%]" delay={1.5} label="Toros" />
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Kategoriler</h2>
            <p className="mt-1 text-sm text-slate-600">Bir konu seç, haritada oynayarak öğren.</p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {CATEGORIES.length} bölüm
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const stat = state?.categories[c.slug];
            return (
              <motion.div
                key={c.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 * i }}
              >
                <Link
                  to="/kategori/$slug"
                  params={{ slug: c.slug }}
                  className="group relative block h-full overflow-hidden rounded-3xl border border-cyan-100 bg-white/80 p-5 shadow-md shadow-cyan-500/5 backdrop-blur transition-all hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl hover:shadow-cyan-500/20"
                >
                  <div
                    className={`mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${c.gradient} text-2xl shadow-lg shadow-cyan-500/20`}
                  >
                    {c.emoji}
                  </div>
                  <div className="text-base font-black text-slate-900">{c.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{c.items.length} konu</div>
                  {stat ? (
                    <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-cyan-700">En iyi %{stat.best}</span>
                      {stat.perfect && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                          %100 ✓
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 text-[11px] font-semibold text-slate-400">
                      Henüz oynanmadı
                    </div>
                  )}
                  <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-xs font-semibold text-cyan-600">Başla →</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-cyan-100 bg-white/50 py-6 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          KPSS adayları için hazırlanmıştır · Harita oyunlarıyla kalıcı öğrenme
        </div>
      </footer>
    </div>
  );
}

function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-40 h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl"
      />
    </div>
  );
}

function FloatingPin({
  className,
  delay = 0,
  label,
}: {
  className: string;
  delay?: number;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
      transition={{
        opacity: { duration: 0.6, delay },
        scale: { duration: 0.6, delay },
        y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`pointer-events-none absolute ${className}`}
    >
      <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-cyan-700 shadow-lg ring-1 ring-cyan-200">
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
        {label}
      </div>
    </motion.div>
  );
}
