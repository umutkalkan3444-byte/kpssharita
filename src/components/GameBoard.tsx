import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CheckCircle2, RotateCcw, Trophy, Smartphone, LogOut, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { TransformComponent, TransformWrapper, useControls } from "react-zoom-pan-pinch";

import { type Category, targetsFor, type TargetPoint } from "@/lib/game-data";
import { MAP_W, MAP_H } from "@/lib/geo";
import { TurkeyMap } from "@/components/TurkeyMap";
import { sfx } from "@/lib/sfx";
import { recordRun } from "@/lib/storage";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Placed = Record<string, TargetPoint>;

function DropDot({ t, placed }: { t: TargetPoint; placed?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: t.id });
  return (
    <div
      ref={setNodeRef}
      // Büyük görünmez hitbox (dokunmatik için) + görünür küçük nokta
      className="absolute grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center sm:h-20 sm:w-20"
      style={{ left: `${(t.x / MAP_W) * 100}%`, top: `${(t.y / MAP_H) * 100}%` }}
    >
      <div
        className={cn(
          "grid place-items-center rounded-full transition-all duration-200",
          placed
            ? "h-8 w-8 bg-emerald-500/95 text-white shadow-lg shadow-emerald-500/40 sm:h-9 sm:w-9"
            : "h-5 w-5 bg-white/90 ring-2 ring-cyan-400/70 backdrop-blur",
          isOver && !placed && "h-10 w-10 scale-110 bg-cyan-100 ring-cyan-500",
        )}
      >
        {placed ? <CheckCircle2 className="h-5 w-5" /> : <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />}
      </div>
      {placed && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-full mt-1 max-w-[140px] -translate-x-1/2 whitespace-normal break-words rounded-lg bg-emerald-600 px-2 py-0.5 text-center text-[10px] font-semibold text-white shadow sm:text-xs"
        >
          {t.name}
        </motion.div>
      )}
    </div>
  );
}

function Card({ id, name, shake }: { id: string; name: string; shake: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <motion.button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative min-h-[44px] w-[150px] touch-none select-none whitespace-normal break-words rounded-2xl border border-cyan-200/70 bg-white/95 px-3 py-2 text-center text-xs font-semibold text-slate-800 shadow-md shadow-cyan-500/10 backdrop-blur sm:w-[170px] sm:text-sm",
        "transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:cursor-grabbing",
        isDragging && "opacity-30",
        shake && "border-rose-400 bg-rose-50 text-rose-700",
      )}
    >
      {name}
    </motion.button>
  );
}

function ZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
      <button
        type="button"
        onClick={() => zoomIn()}
        aria-label="Yakınlaştır"
        className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <ZoomIn className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut()}
        aria-label="Uzaklaştır"
        className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <ZoomOut className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => resetTransform()}
        aria-label="Sıfırla"
        className="grid h-9 w-9 place-items-center rounded-xl border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function useIsPortraitMobile() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 900px)");
    const update = () => setPortrait(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      mq.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return portrait;
}

export function GameBoard({ category }: { category: Category }) {
  const targets = useMemo(() => targetsFor(category), [category]);
  const targetById = useMemo(() => Object.fromEntries(targets.map((t) => [t.id, t])), [targets]);
  const [cards, setCards] = useState(() => shuffle(category.items));
  const [placed, setPlaced] = useState<Placed>({});
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<{
    pct: number; correct: number; wrong: number; totalMs: number; avgMs: number;
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const isPortraitMobile = useIsPortraitMobile();

  const total = category.items.length;

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const cardId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;

    // Hiçbir hedefe bırakılmadıysa — hiçbir şey olmasın
    if (!overId) return;

    if (overId === cardId) {
      // Doğru
      sfx.correct();
      confetti({
        particleCount: 40,
        spread: 55,
        startVelocity: 30,
        origin: { y: 0.35 },
        colors: ["#22d3ee", "#34d399", "#a7f3d0", "#fef9c3"],
      });
      const t = targetById[cardId];
      setPlaced((p) => ({ ...p, [cardId]: t }));
      setCards((cs) => cs.filter((c) => c.id !== cardId));
      const next = correctCount + 1;
      setCorrectCount(next);
      if (next === total) finalize(next, wrongCount, wrongIds);
    } else {
      // Yalnızca YANLIŞ bir hedef üzerine bırakıldıysa yanlış say
      sfx.wrong();
      setShakeId(cardId);
      setWrongCount((w) => w + 1);
      setWrongIds((ids) => (ids.includes(cardId) ? ids : [...ids, cardId]));
      setTimeout(() => setShakeId((s) => (s === cardId ? null : s)), 500);
    }
  };

  const finalize = (correct: number, wrong: number, wIds: string[]) => {
    const totalMs = Date.now() - startedAt;
    const pct = Math.round((correct / total) * 100);
    const avgMs = Math.round(totalMs / total);
    setSummary({ pct, correct, wrong, totalMs, avgMs });
    setDone(true);
    recordRun(category.slug, correct, wrong, wIds);
    setTimeout(() => {
      confetti({ particleCount: 140, spread: 100, origin: { y: 0.5 } });
      sfx.win();
    }, 100);
  };

  const reset = () => {
    setCards(shuffle(category.items));
    setPlaced({});
    setWrongIds([]);
    setCorrectCount(0);
    setWrongCount(0);
    setDone(false);
    setSummary(null);
  };

  const progressPct = Math.round((correctCount / total) * 100);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 pb-28 pt-4 sm:px-6">
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Link to="/" className="rounded-full px-2 py-1 hover:bg-white hover:text-cyan-700">
          Ana Sayfa
        </Link>
        <span className="opacity-50">›</span>
        <Link
          to="/konu/$mainSlug"
          params={{ mainSlug: category.mainSlug }}
          className="rounded-full px-2 py-1 hover:bg-white hover:text-cyan-700"
        >
          {category.mainTitle}
        </Link>
        <span className="opacity-50">›</span>
        <span className="max-w-[60vw] truncate rounded-full bg-white/80 px-2 py-1 text-slate-800 ring-1 ring-cyan-100">
          {category.title}
        </span>
      </nav>
      <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
        <h1 className="min-w-0 truncate text-lg font-black tracking-tight text-slate-900 sm:text-2xl">
          <span className="mr-2">{category.emoji}</span>
          {category.title}
        </h1>
        <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 text-sm text-slate-700 sm:ml-auto">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            ✓ {correctCount}
          </span>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
            ✗ {wrongCount}
          </span>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
          </Button>
        </div>
      </header>

      <div className="mb-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-cyan-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <div className="mt-1 text-right text-xs font-medium text-slate-500">
          {correctCount} / {total} • {progressPct}%
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        <div className="relative">
          <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            doubleClick={{ mode: "toggle", step: 1.5 }}
            wheel={{ step: 0.15 }}
            pinch={{ step: 5 }}
            panning={{ velocityDisabled: true }}
          >
            <>
              <ZoomControls />
              <TransformComponent
                wrapperClass="!w-full !overflow-hidden !rounded-3xl !border !border-cyan-200 !bg-gradient-to-br !from-white !via-sky-50 !to-cyan-50 !shadow-xl !shadow-cyan-500/10"
                contentClass="!w-full"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
                >
                  <TurkeyMap
                    className="absolute inset-0 h-full w-full"
                    variant={category.mapVariant}
                  />
                  <div className="absolute inset-0">
                    {targets.map((t) => (
                      <DropDot key={t.id} t={t} placed={!!placed[t.id]} />
                    ))}
                  </div>
                </div>
              </TransformComponent>
            </>
          </TransformWrapper>
          <p className="mt-1 text-center text-[10px] font-medium text-slate-400">
            İki parmakla yakınlaştır · sürükleyerek gezin
          </p>
        </div>

        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kartları haritaya sürükle
          </div>
          <div className="max-h-[36vh] overflow-y-auto rounded-2xl bg-white/50 p-2 ring-1 ring-cyan-100">
            <div className="flex flex-wrap items-start justify-start gap-2">
              <AnimatePresence>
                {cards.map((c) => (
                  <motion.div
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                  >
                    <Card id={c.id} name={c.name} shake={shakeId === c.id} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {cards.length === 0 && !done && (
                <div className="p-3 text-sm text-slate-500">
                  Tüm kartlar yerleştirildi 🎉
                </div>
              )}
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="min-h-[44px] w-[150px] whitespace-normal break-words rounded-2xl border border-cyan-400 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-800 shadow-2xl shadow-cyan-500/40 sm:w-[170px] sm:text-sm">
              {category.items.find((i) => i.id === activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Sabit çıkış butonu */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-200 bg-white/95 px-3 py-2 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.15)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Button
            asChild
            variant="destructive"
            size="sm"
            className="w-full max-w-md whitespace-normal text-center text-[11px] leading-tight sm:text-xs"
          >
            <Link to="/">
              <LogOut className="mr-1.5 h-3.5 w-3.5 shrink-0" />
              Atanmak istemeyen bir orospu olduğum için oyunu terk etmek istiyorum 😞
            </Link>
          </Button>
        </div>
      </div>

      {/* Dikey uyarısı — mobil dikey ekranda tam ekran */}
      <AnimatePresence>
        {isPortraitMobile && !done && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 px-6 text-white"
          >
            <div className="max-w-sm text-center">
              <motion.div
                animate={{ rotate: [0, 90, 90, 0], scale: [1, 1.05, 1.05, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl bg-white/15 backdrop-blur"
              >
                <Smartphone className="h-12 w-12" />
              </motion.div>
              <h2 className="text-2xl font-black leading-tight">
                Lütfen telefonunuzu yatay çevirin 📱
              </h2>
              <p className="mt-3 text-sm text-white/85">
                Türkiye haritası oyunları için en iyi deneyim <b>yatay ekranda</b> sunulur.
                Telefonunuzu yatay konuma getirdiğinizde oyun otomatik açılacak.
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <LogOut className="h-3.5 w-3.5" />
                Ana sayfaya dön
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-3xl border border-cyan-200 bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-white shadow-lg">
                  <Trophy className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
                    Bölüm tamamlandı
                  </div>
                  <div className="truncate text-xl font-black text-slate-900">
                    {category.title}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <Stat label="Başarı" value={`%${summary.pct}`} />
                <Stat label="Doğru" value={summary.correct} />
                <Stat label="Yanlış" value={summary.wrong} />
                <Stat label="Süre" value={formatMs(summary.totalMs)} />
                <div className="col-span-2">
                  <Stat label="Ortalama Yerleştirme" value={formatMs(summary.avgMs)} />
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Button className="flex-1" onClick={reset}>Tekrar oyna</Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/">Ana sayfa</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cyan-50/70 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-black text-slate-900">{value}</div>
    </div>
  );
}

function formatMs(ms: number) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}dk ${r}sn` : `${r}sn`;
}
