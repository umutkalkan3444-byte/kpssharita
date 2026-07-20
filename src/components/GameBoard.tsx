import { useEffect, useMemo, useRef, useState } from "react";
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
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { RotateCcw, Trophy, Smartphone, LogOut, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  TransformComponent,
  TransformWrapper,
  useControls,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";

import { type Category, targetsFor, type TargetPoint } from "@/lib/game-data";
import { MAP_W, MAP_H, focusBoundsForSlug, REGION_ILLERI_SLUGS } from "@/lib/geo";
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
  // Doğru bilinmiş hedefler artık drop hedefi değil — üzerine bırakılırsa etkisiz.
  const { setNodeRef, isOver } = useDroppable({ id: t.id, disabled: !!placed });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2",
        placed
          ? "pointer-events-none flex items-center gap-0.5"
          : "grid h-16 w-16 place-items-center sm:h-20 sm:w-20",
      )}
      style={{ left: `${(t.x / MAP_W) * 100}%`, top: `${(t.y / MAP_H) * 100}%` }}
    >
      {placed ? (
        <>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ring-1 ring-white shadow" />
          <span className="whitespace-nowrap rounded-sm bg-white/85 px-1 text-[8px] font-semibold leading-tight text-emerald-800 shadow-sm sm:text-[9px]">
            {t.name}
          </span>
        </>
      ) : (
        <div
          className={cn(
            "grid h-4 w-4 place-items-center rounded-full bg-white/90 ring-2 ring-cyan-400/70 backdrop-blur transition-all duration-150",
            isOver && "h-6 w-6 scale-110 bg-cyan-100 ring-cyan-500",
          )}
        >
          <span className="h-1 w-1 rounded-full bg-cyan-500" />
        </div>
      )}
    </div>
  );
}

/** Doğru yerleştirilen öğelerin gerçek coğrafi şekillerini çizen SVG katmanı. */
function ShapeLayer({
  targets,
  placed,
  categorySlug,
}: {
  targets: TargetPoint[];
  placed: Record<string, TargetPoint>;
  categorySlug: string;
}) {
  const stroke =
    categorySlug === "akarsular" ? "#0284c7" :
    categorySlug.includes("dag") || categorySlug === "kivrim-daglari" || categorySlug === "kirik-daglari" ? "#78350f" :
    "#065f46";
  const fill =
    categorySlug === "akarsular" ? "none" :
    categorySlug === "delta-ovalari" ? "rgba(16,185,129,0.55)" :
    "rgba(14,165,233,0.55)";
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {targets.map((t) => {
        if (!t.shape || !placed[t.id]) return null;
        const isLine = t.shape.type === "polyline";
        return (
          <path
            key={t.id}
            d={t.shape.d}
            fill={isLine ? "none" : fill}
            stroke={stroke}
            strokeWidth={isLine ? 2.2 : 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        );
      })}
    </svg>
  );
}


function Card({ id, name, shake }: { id: string; name: string; shake: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative min-h-[40px] w-full touch-none select-none whitespace-normal break-words rounded-xl border border-cyan-200/70 bg-white/95 px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 shadow-md shadow-cyan-500/10 backdrop-blur",
        "sm:w-[170px]",
        "hover:border-cyan-400 active:cursor-grabbing",
        isDragging && "opacity-30",
        shake && "animate-shake border-rose-400 bg-rose-50 text-rose-700",
      )}
    >
      {name}
    </button>
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
        className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => zoomOut()}
        aria-label="Uzaklaştır"
        className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => resetTransform()}
        aria-label="Sıfırla"
        className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
      >
        <Maximize2 className="h-3.5 w-3.5" />
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

  // Tarım & Hayvancılık → "il tıklama" modu (sürükleme yok, harita büyük).
  // "Tüm ..." alt kategorileri (item adları ürün adı olan) klasik sürükleme modunda kalır.
  const isClickMode =
    (category.mainSlug === "tarim" || category.mainSlug === "hayvancilik") &&
    !category.slug.startsWith("tum-");

  const [cards, setCards] = useState(() => shuffle(category.items));
  const [placed, setPlaced] = useState<Placed>({});
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  // Click-mode: yanlış tıklanan il adları (kırmızıya boyanır, tekrar tıklanamaz)
  const [wrongProvinces, setWrongProvinces] = useState<string[]>([]);
  const [startedAt] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<{
    pct: number; correct: number; wrong: number; totalMs: number; avgMs: number;
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const isPortraitMobile = useIsPortraitMobile();

  // İl-illeri kategorilerinde doğru bırakılan illeri harita üzerinde yeşile boyayalım
  const isIlleri =
    !!REGION_ILLERI_SLUGS[category.slug] ||
    category.slug === "iller-81" ||
    category.slug === "buyuksehirler" ||
    isClickMode;
  const highlightedProvinces = useMemo(
    () => (isIlleri ? Object.values(placed).map((p) => p.name) : []),
    [placed, isIlleri],
  );


  // Otomatik odak (bölge oyunları için)
  const focus = useMemo(() => focusBoundsForSlug(category.slug), [category.slug]);
  // Daha geniş bir genel görünüm için odak ölçeğine padding uygula (0.72 → %28 daha geriden bak)
  const focusScale = focus ? Math.min(MAP_W / focus.w, MAP_H / focus.h) * 0.72 : 1;
  const isFocused = !!focus;

  const mapWrapRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
    ro.observe(el);
    setContainerW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Odak uygulaması — container boyutu ölçüldükten sonra
  useEffect(() => {
    if (!focus || containerW <= 0 || !zoomRef.current) return;
    const contH = containerW * (MAP_H / MAP_W);
    const fx = focus.x / MAP_W;
    const fy = focus.y / MAP_H;
    const fw = focus.w / MAP_W;
    const fh = focus.h / MAP_H;
    const px = containerW / 2 - focusScale * containerW * (fx + fw / 2);
    const py = contH / 2 - focusScale * contH * (fy + fh / 2);
    zoomRef.current.setTransform(px, py, focusScale, 0);
  }, [focus, focusScale, containerW, category.slug]);

  const total = category.items.length;

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const cardId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return; // boşluğa bırakma → sessiz

    if (overId === cardId) {
      sfx.correct();
      // Minimal — küçük ve nokta hedefi merkezli
      confetti({
        particleCount: 14,
        spread: 40,
        startVelocity: 22,
        origin: { y: 0.5 },
        colors: ["#10b981", "#34d399", "#a7f3d0"],
        scalar: 0.7,
      });
      const t = targetById[cardId];
      setPlaced((p) => ({ ...p, [cardId]: t }));
      setCards((cs) => cs.filter((c) => c.id !== cardId));
      const next = correctCount + 1;
      setCorrectCount(next);
      if (next === total) finalize(next, wrongCount, wrongIds);
    } else {
      sfx.wrong();
      setShakeId(cardId);
      setWrongCount((w) => w + 1);
      setWrongIds((ids) => (ids.includes(cardId) ? ids : [...ids, cardId]));
      setTimeout(() => setShakeId((s) => (s === cardId ? null : s)), 500);
    }
  };

  // Click-mode: il tıklama akışı (sadece tarım/hayvancılık)
  const norm = (s: string) =>
    s
      .toLocaleLowerCase("tr")
      .replace(/ı/g, "i").replace(/İ/g, "i")
      .replace(/ş/g, "s").replace(/ç/g, "c")
      .replace(/ğ/g, "g").replace(/ü/g, "u")
      .replace(/ö/g, "o").replace(/â/g, "a")
      .replace(/[^a-z0-9]/g, "");

  const answerMap = useMemo(() => {
    const m = new Map<string, TargetPoint>();
    if (isClickMode) {
      for (const t of targets) m.set(norm(t.name), t);
    }
    return m;
  }, [targets, isClickMode]);

  const onProvinceClick = (provinceName: string) => {
    if (!isClickMode || done) return;
    const key = norm(provinceName);
    // Zaten doğru veya yanlış işaretlendi → etkisiz
    if (Object.values(placed).some((p) => norm(p.name) === key)) return;
    if (wrongProvinces.some((n) => norm(n) === key)) return;

    const target = answerMap.get(key);
    if (target) {
      sfx.correct();
      confetti({
        particleCount: 14, spread: 40, startVelocity: 22,
        origin: { y: 0.5 },
        colors: ["#10b981", "#34d399", "#a7f3d0"], scalar: 0.7,
      });
      setPlaced((p) => ({ ...p, [target.id]: target }));
      const next = correctCount + 1;
      setCorrectCount(next);
      if (next === total) finalize(next, wrongCount, wrongIds);
    } else {
      sfx.wrong();
      setWrongProvinces((prev) => [...prev, provinceName]);
      setWrongCount((w) => w + 1);
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
    setWrongProvinces([]);
    setCorrectCount(0);
    setWrongCount(0);
    setDone(false);
    setSummary(null);
  };


  const progressPct = Math.round((correctCount / total) * 100);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-3 pb-24 pt-3 sm:px-6 max-lg:landscape:h-[100dvh] max-lg:landscape:overflow-hidden max-lg:landscape:pb-0 max-lg:landscape:pt-1 max-lg:landscape:px-2">
      {/* Breadcrumb — mobil yatayda gizli */}
      <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-500 max-lg:landscape:hidden">
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

      <header className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap max-lg:landscape:mb-1 max-lg:landscape:gap-2">
        <h1 className="min-w-0 truncate text-base font-black tracking-tight text-slate-900 sm:text-2xl max-lg:landscape:text-sm">
          <span className="mr-2">{category.emoji}</span>
          {category.title}
        </h1>
        <div className="col-span-2 flex flex-wrap items-center justify-end gap-2 text-sm text-slate-700 sm:ml-auto max-lg:landscape:col-auto max-lg:landscape:gap-1.5">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            ✓ {correctCount}
          </span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
            ✗ {wrongCount}
          </span>
          <Button size="sm" variant="outline" onClick={reset} className="h-7 gap-1.5 px-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
          </Button>
          <Link
            to="/"
            aria-label="Oyundan çık"
            className="hidden h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose-700 transition hover:bg-rose-200 max-lg:landscape:grid"
          >
            <X className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {/* Progress — kompakt */}
      <div className="mb-2 max-lg:landscape:mb-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-cyan-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        modifiers={[snapCenterToCursor]}
        onDragStart={(e) => setActiveId(String(e.active.id))}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={onDragEnd}
      >
        {/* Ana oyun alanı — mobil yatayda yan yana */}
        <div className="flex flex-1 min-h-0 flex-col gap-3 max-lg:landscape:flex-row max-lg:landscape:gap-2">
          <div className="relative flex-1 min-h-0" ref={mapWrapRef}>
            <TransformWrapper
              key={category.slug + (containerW > 0 ? "-ready" : "-init")}
              ref={zoomRef}
              initialScale={focusScale}
              minScale={focusScale}
              maxScale={isFocused ? focusScale : 5}
              doubleClick={{ disabled: isFocused, mode: "toggle", step: 1.5 }}
              wheel={{ disabled: isFocused, step: 0.15 }}
              pinch={{ disabled: isFocused, step: 5 }}
              panning={{ disabled: isFocused, velocityDisabled: true }}
              limitToBounds={true}
              centerOnInit={!focus}
            >
              <>
                {!isFocused && <ZoomControls />}
                <TransformComponent
                  wrapperClass="!w-full !h-full !overflow-hidden !rounded-2xl !border !border-cyan-200 !bg-gradient-to-br !from-white !via-sky-50 !to-cyan-50 !shadow-xl !shadow-cyan-500/10"
                  contentClass="!w-full"
                >
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
                  >
                    <TurkeyMap
                      className="absolute inset-0 h-full w-full"
                      variant={category.mapVariant}
                      highlightedProvinces={highlightedProvinces}
                    />
                    <ShapeLayer targets={targets} placed={placed} categorySlug={category.slug} />
                    <div className="absolute inset-0">
                      {targets.map((t) => (
                        <DropDot key={t.id} t={t} placed={!!placed[t.id]} />
                      ))}
                    </div>
                  </div>
                </TransformComponent>
              </>
            </TransformWrapper>
          </div>

          {/* Kart paneli — mobilde alt, mobil yatayda sağ */}
          <div className="max-lg:landscape:w-[200px] max-lg:landscape:flex-shrink-0">
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 max-lg:landscape:hidden">
              Kartları haritaya sürükle
            </div>
            <div className="max-h-[32vh] overflow-y-auto rounded-2xl bg-white/50 p-2 ring-1 ring-cyan-100 max-lg:landscape:max-h-full max-lg:landscape:h-full">
              <div className="flex flex-wrap items-start justify-start gap-1.5 max-lg:landscape:flex-col max-lg:landscape:flex-nowrap">
                {cards.map((c) => (
                  <div key={c.id} className="max-lg:landscape:w-full">
                    <Card id={c.id} name={c.name} shake={shakeId === c.id} />
                  </div>
                ))}
                {cards.length === 0 && !done && (
                  <div className="p-3 text-sm text-slate-500">
                    Tüm kartlar yerleştirildi 🎉
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="min-h-[40px] w-[150px] whitespace-normal break-words rounded-xl border border-cyan-400 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-800 shadow-2xl shadow-cyan-500/40 sm:w-[170px] sm:text-sm">
              {category.items.find((i) => i.id === activeId)?.name}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Sabit çıkış butonu — mobil yatayda gizli (üstteki X kullanılır) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-200 bg-white/95 px-3 py-2 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.15)] backdrop-blur max-lg:landscape:hidden">
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
