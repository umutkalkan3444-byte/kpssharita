import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, Sparkles, Repeat2, BarChart3, Trophy, Flame, ArrowRight, CalendarClock } from "lucide-react";

import { MAIN_CATEGORIES } from "@/lib/game-data";
import { TurkeyMap } from "@/components/TurkeyMap";
import { loadState, xpProgress, type GameState } from "@/lib/storage";
import { kpssCountdown } from "@/lib/kpss-date";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Harita Ustası — Türkiye Coğrafya Haritada Öğren" },
      {
        name: "description",
        content:
          "Türkiye coğrafyasını harita üzerinde sürükle-bırak oyunlarıyla öğren. Bölgeler, iller, dağlar, göller, akarsular ve daha fazlası.",
      },
      { property: "og:title", content: "Harita Ustası — Türkiye Coğrafya Haritada Öğren" },
      {
        property: "og:description",
        content: "Türkiye coğrafyasını harita üzerinde sürükle-bırak oyunlarıyla öğren.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [state, setState] = useState<GameState | null>(null);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => setState(loadState()), []);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const xp = state ? xpProgress(state) : null;
  const countdown = kpssCountdown(now);

  const totalSubs = MAIN_CATEGORIES.reduce((s, m) => s + m.subs.length, 0);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-sky-50 to-cyan-50 text-slate-900">
      <BackgroundBlobs />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/30">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-base font-black tracking-tight">Harita Ustası</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link
            to="/tekrar"
            className="rounded-full px-3 py-1.5 text-slate-600 transition-colors hover:bg-white hover:text-cyan-700 sm:inline-flex sm:items-center sm:gap-1.5"
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

      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pt-4 pb-8 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-10 lg:pb-14">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/70 px-3 py-1 text-xs font-semibold text-cyan-700 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" /> Türkiye coğrafyası için oyunlaştırılmış çalışma
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Türkiye{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
              Harita Ustası
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-4 max-w-xl text-base text-slate-600 sm:text-lg"
          >
            {MAIN_CATEGORIES.length} ana konu · {totalSubs} alt konu. Bölgelerden madenlere,
            tarımdan enerjiye — haritada oynayarak kalıcı öğren.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 px-3 py-2.5 shadow-md shadow-amber-500/10"
          >
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1 text-xs font-semibold text-slate-600">
              Sınava kalan
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black leading-none text-orange-600 sm:text-3xl">
                {countdown.totalDays}
              </span>
              <span className="text-xs font-bold uppercase text-slate-500">gün</span>
            </div>
          </motion.div>



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
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Ana Konular</h2>
            <p className="mt-1 text-sm text-slate-600">
              Bir başlık seç, alt konularına göz at ve oynayarak öğren.
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            {MAIN_CATEGORIES.length} kategori
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MAIN_CATEGORIES.map((m, i) => {
            const played = state
              ? m.subs.filter((s) => state.categories[s.slug]).length
              : 0;
            const perfect = state
              ? m.subs.filter((s) => state.categories[s.slug]?.perfect).length
              : 0;
            const totalItems = m.subs.reduce((n, s) => n + s.items.length, 0);
            return (
              <motion.div
                key={m.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 * i }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to="/konu/$mainSlug"
                  params={{ mainSlug: m.slug }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-cyan-100 bg-white/85 p-6 shadow-lg shadow-cyan-500/5 backdrop-blur transition-all hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-500/25"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${m.gradient} opacity-20 blur-2xl transition-opacity group-hover:opacity-40`}
                  />
                  <div
                    className={`relative mb-4 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br ${m.gradient} text-3xl shadow-lg shadow-cyan-500/25`}
                  >
                    {m.emoji}
                  </div>
                  <div className="relative text-xl font-black text-slate-900">
                    {m.title}
                  </div>
                  <p className="relative mt-1 line-clamp-2 text-sm text-slate-600">
                    {m.description}
                  </p>
                  <div className="relative mt-4 flex items-center justify-between text-[11px] font-bold">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-cyan-700">
                        {m.subs.length} konu
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                        {totalItems} hedef
                      </span>
                    </div>
                    {state && played > 0 && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                        {played}/{m.subs.length}
                        {perfect > 0 && ` · ${perfect}★`}
                      </span>
                    )}
                  </div>
                  <div className="relative mt-4 inline-flex items-center gap-1 text-sm font-bold text-cyan-700 transition-transform group-hover:translate-x-1">
                    Alt konuları gör <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-cyan-100 bg-white/50 py-6 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-500 sm:px-6">
          Türkiye coğrafyasını harita üzerinde oynayarak öğren · kalıcı öğrenme
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
