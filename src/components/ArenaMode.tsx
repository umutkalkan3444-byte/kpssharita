import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame, Layers3, Swords, Timer, Trophy, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";

import { useCompetitiveMode } from "@/hooks/use-competitive-mode";
import { cn } from "@/lib/utils";

const EMBERS = [
  [8, 0.1],
  [25, 0.8],
  [42, 0.25],
  [59, 0.65],
  [76, 0.05],
  [92, 0.5],
] as const;

export function ArenaAmbient() {
  const { enabled, setEnabled } = useCompetitiveMode();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduceMotion = useReducedMotion();
  if (!enabled) return null;
  const isGameRoute = pathname.startsWith("/kategori/");

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[35] overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[14vw] bg-gradient-to-r from-rose-600/18 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-[14vw] bg-gradient-to-l from-blue-600/18 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-orange-400 to-blue-500 shadow-[0_0_22px_rgba(249,115,22,0.75)]" />
        {!reduceMotion &&
          EMBERS.map(([left, delay], index) => (
            <span
              key={index}
              className="arena-ember absolute bottom-[-16px] h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_2px_rgba(251,146,60,0.75)]"
              style={{
                left: `${left}%`,
                animationDelay: `${delay * 4}s`,
                animationDuration: `${5 + (index % 4)}s`,
              }}
            />
          ))}
      </div>
      {!isGameRoute ? (
        <motion.button
          type="button"
          onClick={() => setEnabled(false)}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          className="fixed right-3 top-1/2 z-[90] inline-flex -translate-y-1/2 items-center gap-2 rounded-full border border-orange-300 bg-slate-950/90 px-3 py-2 text-xs font-black text-white shadow-2xl shadow-orange-500/30 backdrop-blur sm:right-5"
          aria-label="Rekabet modunu kapat"
        >
          <X className="h-4 w-4 text-orange-300" />
          <span className="hidden sm:inline">Rekabeti kapat</span>
        </motion.button>
      ) : null}
    </>
  );
}

export function ArenaToggleCard() {
  const { enabled, setEnabled } = useCompetitiveMode();
  const reduceMotion = useReducedMotion();
  const [showBurst, setShowBurst] = useState(false);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next && !reduceMotion) setShowBurst(true);
  };

  useEffect(() => {
    if (!showBurst) return;
    const timer = window.setTimeout(() => setShowBurst(false), 1700);
    return () => window.clearTimeout(timer);
  }, [showBurst]);

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
        whileTap={reduceMotion ? undefined : { scale: 0.985 }}
        className={cn(
          "group relative w-full overflow-hidden rounded-3xl border p-6 text-left shadow-xl transition-colors",
          enabled
            ? "border-orange-300 bg-gradient-to-r from-rose-950 via-red-900 to-blue-950 text-white shadow-orange-500/25"
            : "border-orange-200 bg-gradient-to-br from-white via-orange-50 to-rose-50 text-slate-900 shadow-orange-500/10",
        )}
      >
        <div className="absolute -left-10 -top-16 h-40 w-40 rounded-full bg-rose-500/25 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex items-center gap-4">
          <motion.div
            animate={
              enabled && !reduceMotion ? { rotate: [-3, 3, -3], scale: [1, 1.08, 1] } : undefined
            }
            transition={{ duration: 1.2, repeat: Infinity }}
            className={cn(
              "grid h-16 w-16 shrink-0 place-items-center rounded-3xl text-white shadow-lg",
              enabled
                ? "bg-gradient-to-br from-orange-400 via-red-500 to-rose-700 shadow-orange-500/40"
                : "bg-gradient-to-br from-orange-400 to-rose-600 shadow-orange-500/25",
            )}
          >
            {enabled ? <Flame className="h-8 w-8" /> : <Swords className="h-8 w-8" />}
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black sm:text-2xl">Arkadaşınla Rekabet</h2>
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                  enabled ? "bg-orange-400 text-red-950" : "bg-orange-100 text-orange-700",
                )}
              >
                {enabled ? "Arena açık" : "Aynı cihazda"}
              </span>
            </div>
            <p className={cn("mt-1 text-sm", enabled ? "text-white/75" : "text-slate-600")}>
              Tek kart havuzundan sırayla seçim yapın. Bilinen kartlar tükendikçe sona kalan zor
              kartlar rekabeti kızıştırsın.
              {enabled ? " Sağdaki sabit düğmeyle istediğin an kapatabilirsin." : ""}
            </p>
            <div
              className={cn(
                "mt-3 flex flex-wrap gap-3 text-xs font-bold",
                enabled ? "text-orange-100" : "text-slate-500",
              )}
            >
              <span className="inline-flex items-center gap-1">
                <Layers3 className="h-3.5 w-3.5" /> Tek ortak kart havuzu
              </span>
              <span className="inline-flex items-center gap-1">
                <Timer className="h-3.5 w-3.5" /> Oyuncuya özel süre
              </span>
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5" /> Doğru kart ağırlıklı skor
              </span>
            </div>
          </div>
        </div>
      </motion.button>

      <AnimatePresence>
        {showBurst && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.35, rotate: -12, opacity: 0 }}
              animate={{ scale: [0.35, 1.12, 1], rotate: [-12, 3, 0], opacity: 1 }}
              exit={{ scale: 1.3, opacity: 0 }}
              transition={{ duration: 0.7, ease: "backOut" }}
              className="relative text-center text-white"
            >
              <div className="absolute inset-0 -z-10 scale-[2.5] rounded-full bg-orange-500/30 blur-3xl" />
              <Flame className="mx-auto h-24 w-24 fill-orange-500 text-orange-300 drop-shadow-[0_0_28px_rgba(249,115,22,0.9)]" />
              <div className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
                ARENA AÇILDI
              </div>
              <div className="mt-2 text-sm font-bold uppercase tracking-[0.3em] text-orange-300">
                Kırmızı · Mavi · Tek hamle
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
