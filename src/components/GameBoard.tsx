import { useMemo, useState } from "react";
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
import { CheckCircle2, RotateCcw, Trophy } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
      className="absolute grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center sm:h-14 sm:w-14"
      style={{ left: `${(t.x / MAP_W) * 100}%`, top: `${(t.y / MAP_H) * 100}%` }}
    >
      <div
        className={cn(
          "grid place-items-center rounded-full transition-all duration-200",
          placed
            ? "h-8 w-8 bg-emerald-500/95 text-white shadow-lg shadow-emerald-500/40 sm:h-9 sm:w-9"
            : "h-5 w-5 bg-white/80 ring-2 ring-cyan-400/70 backdrop-blur",
          isOver && !placed && "h-10 w-10 scale-110 bg-cyan-100 ring-cyan-500",
        )}
      >
        {placed ? <CheckCircle2 className="h-5 w-5" /> : <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />}
      </div>
      {placed && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow sm:text-xs"
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
        "group relative touch-none select-none rounded-2xl border border-cyan-200/70 bg-white/85 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-md shadow-cyan-500/10 backdrop-blur",
        "transition-all hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-lg active:cursor-grabbing",
        isDragging && "opacity-30",
        shake && "border-rose-400 bg-rose-50 text-rose-700",
      )}
    >
      {name}
    </motion.button>
  );
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

  const total = category.items.length;

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const cardId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (overId && overId === cardId) {
      // correct
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
      // wrong (dropped in empty space or wrong zone) — never reveal correct answer
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
    <div className="mx-auto w-full max-w-6xl px-3 pb-24 pt-4 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/" className="text-sm font-medium text-cyan-700 hover:underline">
          ← Ana sayfa
        </Link>
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          <span className="mr-2">{category.emoji}</span>
          {category.title}
        </h1>
        <div className="ml-auto flex items-center gap-3 text-sm text-slate-700">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-700">
            ✓ {correctCount}
          </span>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-700">
            ✗ {wrongCount}
          </span>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
          </Button>
        </div>
      </div>

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
        <div
          className="relative w-full overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-br from-white via-sky-50 to-cyan-50 shadow-xl shadow-cyan-500/10"
          style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
        >
          <TurkeyMap className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0">
            {targets.map((t) => (
              <DropDot key={t.id} t={t} placed={!!placed[t.id]} />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Kartları haritaya sürükle
          </div>
          <div className="flex flex-wrap gap-2">
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
              <div className="text-sm text-slate-500">Tüm kartlar yerleştirildi 🎉</div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="rounded-2xl border border-cyan-400 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-2xl shadow-cyan-500/40">
              {category.items.find((i) => i.id === activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-cyan-600">
                    Bölüm tamamlandı
                  </div>
                  <div className="text-xl font-black text-slate-900">
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
