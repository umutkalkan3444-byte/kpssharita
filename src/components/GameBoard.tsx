import {
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Trophy,
  Smartphone,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Flame,
  Eye,
  EyeOff,
  Lightbulb,
} from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
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
import { normalizePlaceName } from "@/lib/place-name";
import { allNamesAreProvinces } from "@/lib/province-names";
import { getCompetitiveMode } from "@/lib/competitive-mode";
import { findProvinceDropIdAtPoint, PROVINCE_DROP_KIND } from "@/lib/province-drop-target";
import { mistakeKey, type StudyMistake, type StudyReviewRequest } from "@/lib/study/schemas";
import { buildCardLabels } from "@/lib/card-label";

const PostGameStudy = lazy(() =>
  import("@/components/study/PostGameStudy").then((module) => ({
    default: module.PostGameStudy,
  })),
);

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addStudyMistake(
  current: StudyMistake[],
  incoming: Omit<StudyMistake, "count">,
): StudyMistake[] {
  const key = mistakeKey(incoming);
  const index = current.findIndex((mistake) => mistakeKey(mistake) === key);
  if (index < 0 && current.length < 100) {
    return [...current, { ...incoming, count: 1 }];
  }
  if (index < 0) {
    // Sunucu şeması en fazla 100 odak kaydı kabul eder. Çok sıra dışı,
    // yüzlerce farklı karışıklıkta aynı kartın kayıtlarını tek güvenli
    // başlık altında birleştir; sonuç ekranı hiçbir zaman geçersiz kalmasın.
    const sameItem = current.filter(
      (mistake) => mistake.kind === incoming.kind && mistake.id === incoming.id,
    );
    if (sameItem.length === 0) return current;
    const mergedCount = Math.min(99, 1 + sameItem.reduce((sum, mistake) => sum + mistake.count, 0));
    return [
      ...current.filter(
        (mistake) => !(mistake.kind === incoming.kind && mistake.id === incoming.id),
      ),
      { kind: incoming.kind, id: incoming.id, count: mergedCount },
    ];
  }
  return current.map((mistake, mistakeIndex) =>
    mistakeIndex === index ? { ...mistake, count: Math.min(99, mistake.count + 1) } : mistake,
  );
}

type Placed = Record<string, TargetPoint>;

type ArenaPlayerId = "red" | "blue";
type ArenaPlayer = { correct: number; wrong: number; elapsedMs: number };
type ArenaPlayers = Record<ArenaPlayerId, ArenaPlayer>;
type ArenaPlaced = Record<ArenaPlayerId, Placed>;
type ArenaCards = Category["items"];
type ArenaWrongProvinces = Record<ArenaPlayerId, string[]>;

function emptyArenaPlayers(): ArenaPlayers {
  return {
    red: { correct: 0, wrong: 0, elapsedMs: 0 },
    blue: { correct: 0, wrong: 0, elapsedMs: 0 },
  };
}

function emptyArenaPlaced(): ArenaPlaced {
  return { red: {}, blue: {} };
}

function initialArenaCards(items: Category["items"]): ArenaCards {
  return shuffle(items);
}

function emptyArenaWrongProvinces(): ArenaWrongProvinces {
  return { red: [], blue: [] };
}

function arenaScore(player: ArenaPlayer): number {
  // Ortak havuzda daha çok doğru kart almak ana avantajdır; yanlış ve aktif
  // süre küçük ama hissedilir cezalarla eşitliği bozar.
  return player.correct * 1_000 - player.wrong * 350 - Math.floor(player.elapsedMs / 1000) * 2;
}

function perfNow(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

const exactProvinceCollision: CollisionDetection = ({
  pointerCoordinates,
  droppableContainers,
}) => {
  if (!pointerCoordinates) return [];
  const dropId = findProvinceDropIdAtPoint(pointerCoordinates.x, pointerCoordinates.y);
  if (!dropId) return [];
  const container = droppableContainers.find(
    (candidate) => String(candidate.id) === dropId && !candidate.disabled,
  );
  if (!container) return [];
  return [
    {
      id: container.id,
      data: { droppableContainer: container, value: 1 },
    },
  ];
};

const hybridCollision: CollisionDetection = (args) => {
  const exact = exactProvinceCollision(args);
  if (exact.length > 0) return exact;
  return pointerWithin(args);
};

async function fireConfetti(options: Parameters<typeof import("canvas-confetti")>[0]) {
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }
  const module = await import("canvas-confetti");
  const confetti = (
    module as unknown as {
      default: typeof import("canvas-confetti");
    }
  ).default;
  confetti(options);
}

function CompetitionHUD({
  turn,
  players,
  turnStartedAt,
  done,
  paused,
  poolRemaining,
  totalItems,
}: {
  turn: ArenaPlayerId;
  players: ArenaPlayers;
  turnStartedAt: number;
  done: boolean;
  paused: boolean;
  poolRemaining: number;
  totalItems: number;
}) {
  // Yalnızca küçük sayaç bileşeni saniyede bir yeniden çizilir; harita etkilenmez.
  const [now, setNow] = useState(() => perfNow());
  useEffect(() => {
    if (done || paused) return;
    setNow(perfNow());
    const timer = window.setInterval(() => setNow(perfNow()), 1_000);
    return () => window.clearInterval(timer);
  }, [done, paused, turnStartedAt]);

  const elapsedFor = (id: ArenaPlayerId) =>
    players[id].elapsedMs +
    (!done && !paused && turn === id ? Math.max(0, now - turnStartedAt) : 0);

  return (
    <section aria-label="Rekabet skoru" className="mb-2 max-lg:landscape:mb-1">
      <div className="mb-1.5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-orange-700">
        <Flame className="h-3.5 w-3.5" />
        Ortak havuz · {poolRemaining}/{totalItems} kart kaldı
        <Flame className="h-3.5 w-3.5" />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        {(["red", "blue"] as const).map((id, index) => {
          const isActive = !done && turn === id;
          const isRed = id === "red";
          return (
            <div key={id} className="contents">
              {index === 1 ? (
                <div className="grid place-items-center text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">
                  VS
                </div>
              ) : null}
              <div
                className={cn(
                  "rounded-2xl border px-3 py-2 transition-all",
                  isRed
                    ? "border-rose-200 bg-gradient-to-r from-rose-100 to-white text-rose-950"
                    : "border-blue-200 bg-gradient-to-l from-blue-100 to-white text-blue-950",
                  isActive &&
                    (isRed
                      ? "ring-2 ring-rose-500 shadow-lg shadow-rose-500/20"
                      : "ring-2 ring-blue-500 shadow-lg shadow-blue-500/20"),
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black">
                    {isRed ? "Kırmızı" : "Mavi"} {isActive ? "· Sıra sende" : ""}
                  </span>
                  <span className="font-mono text-xs font-black">{formatMs(elapsedFor(id))}</span>
                </div>
                <div className="mt-0.5 text-[10px] font-bold opacity-70">
                  ✓ {players[id].correct} · ✗ {players[id].wrong} ·{" "}
                  {arenaScore({
                    ...players[id],
                    elapsedMs: elapsedFor(id),
                  })}{" "}
                  puan
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const DropDot = memo(function DropDot({
  t,
  placed,
  disabled,
  claimTone,
}: {
  t: TargetPoint;
  placed?: boolean;
  disabled?: boolean;
  claimTone?: ArenaPlayerId;
}) {
  // Doğru bilinmiş hedefler artık drop hedefi değil — üzerine bırakılırsa etkisiz.
  const { setNodeRef, isOver } = useDroppable({
    id: t.id,
    disabled: !!placed || !!disabled,
  });
  const inactiveClaim = !!disabled && !placed;
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2",
        placed
          ? "pointer-events-none flex items-center gap-0.5"
          : inactiveClaim
            ? "pointer-events-none grid h-3 w-3 place-items-center"
            : "grid h-10 w-10 place-items-center",
      )}
      style={{
        left: `${((placed || inactiveClaim ? t.geoX : t.x) / MAP_W) * 100}%`,
        top: `${((placed || inactiveClaim ? t.geoY : t.y) / MAP_H) * 100}%`,
      }}
    >
      {placed ? (
        <>
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full ring-1 ring-white shadow",
              claimTone === "red"
                ? "bg-rose-500"
                : claimTone === "blue"
                  ? "bg-blue-500"
                  : "bg-emerald-500",
            )}
          />
          <span
            className={cn(
              "whitespace-nowrap rounded-sm bg-white/85 px-1 text-[8px] font-semibold leading-tight shadow-sm sm:text-[9px]",
              claimTone === "red"
                ? "text-rose-800"
                : claimTone === "blue"
                  ? "text-blue-800"
                  : "text-emerald-800",
            )}
          >
            {t.name}
          </span>
        </>
      ) : inactiveClaim ? (
        <span
          className={cn(
            "h-2.5 w-2.5 rounded-full border-2 border-white shadow",
            claimTone === "red" ? "bg-rose-500" : "bg-blue-500",
          )}
          title={`${claimTone === "red" ? "Kırmızı" : "Mavi"} bu hedefi tamamladı`}
        />
      ) : (
        <div
          className={cn(
            "relative grid h-5 w-5 place-items-center rounded-full bg-white/90 ring-2 ring-cyan-400/70 backdrop-blur transition-all duration-150",
            isOver && "h-6 w-6 scale-110 bg-cyan-100 ring-cyan-500",
          )}
        >
          <span className="h-1 w-1 rounded-full bg-cyan-500" />
          {claimTone ? (
            <span
              className={cn(
                "absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white",
                claimTone === "red" ? "bg-rose-500" : "bg-blue-500",
              )}
            />
          ) : null}
        </div>
      )}
    </div>
  );
});

function TargetGuideLayer({ targets, placed }: { targets: TargetPoint[]; placed: Placed }) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {targets.map((target) => {
        if (placed[target.id] || Math.hypot(target.x - target.geoX, target.y - target.geoY) < 2) {
          return null;
        }
        return (
          <g key={target.id}>
            <line
              x1={target.geoX}
              y1={target.geoY}
              x2={target.x}
              y2={target.y}
              stroke="rgba(8,145,178,0.55)"
              strokeWidth={1.1}
              strokeDasharray="3 3"
            />
            <circle
              cx={target.geoX}
              cy={target.geoY}
              r={2.4}
              fill="#0891b2"
              stroke="white"
              strokeWidth={1}
            />
          </g>
        );
      })}
    </svg>
  );
}

const ShapeDropPath = memo(function ShapeDropPath({
  id,
  d,
  isLine,
}: {
  id: string;
  d: string;
  isLine: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    resizeObserverConfig: { disabled: true },
  });
  const ref = setNodeRef as unknown as RefCallback<SVGPathElement>;
  return (
    <>
      {isOver ? (
        <path
          d={d}
          fill={isLine ? "none" : "rgba(8,145,178,0.28)"}
          stroke="rgba(8,145,178,0.95)"
          strokeWidth={isLine ? 3.4 : 1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      ) : null}
      <path
        ref={ref}
        d={d}
        fill={isLine ? "none" : "transparent"}
        stroke="transparent"
        strokeWidth={isLine ? 9 : 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents={isLine ? "stroke" : "all"}
        data-drop-kind={PROVINCE_DROP_KIND}
        data-drop-id={id}
      />
    </>
  );
});

/**
 * Coğrafi şekiller oyunun başında soluk hatlarla verilir (nereden başlayıp
 * nerede bittiği görünür), doğru yerleştirilince gerçek rengine kavuşur.
 * Yerleştirilmemiş şekiller aynı zamanda sürükleme hedefidir.
 */
function ShapeLayer({
  targets,
  placed,
  categorySlug,
  interactive,
}: {
  targets: TargetPoint[];
  placed: Record<string, TargetPoint>;
  categorySlug: string;
  interactive?: boolean;
}) {
  const stroke =
    categorySlug === "akarsular"
      ? "#0284c7"
      : categorySlug.includes("dag") ||
          categorySlug === "kivrim-daglari" ||
          categorySlug === "kirik-daglari"
        ? "#78350f"
        : "#065f46";
  const fill =
    categorySlug === "akarsular"
      ? "none"
      : categorySlug === "delta-ovalari"
        ? "rgba(16,185,129,0.55)"
        : "rgba(14,165,233,0.55)";
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={cn("absolute inset-0 h-full w-full", !interactive && "pointer-events-none")}
      preserveAspectRatio="xMidYMid meet"
    >
      {targets.map((t) => {
        if (!t.shape) return null;
        const isLine = t.shape.type === "polyline";
        const isPlaced = !!placed[t.id];
        return (
          <path
            key={t.id}
            d={t.shape.d}
            fill={isLine ? "none" : isPlaced ? fill : "rgba(100,116,139,0.18)"}
            stroke={isPlaced ? stroke : "rgba(71,85,105,0.7)"}
            strokeWidth={isLine ? (isPlaced ? 2.2 : 1.6) : 1.2}
            strokeDasharray={isPlaced ? undefined : isLine ? "4 3" : "2 2"}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isPlaced ? 0.95 : 0.85}
            pointerEvents="none"
          />
        );
      })}
      {interactive
        ? targets.map((t) =>
            t.shape && !placed[t.id] ? (
              <ShapeDropPath
                key={`drop-${t.id}`}
                id={t.id}
                d={t.shape.d}
                isLine={t.shape.type === "polyline"}
              />
            ) : null,
          )
        : null}
    </svg>
  );
}


const Card = memo(function Card({ id, name, shake }: { id: string; name: string; shake: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative min-h-[40px] w-full touch-none select-none whitespace-normal break-words rounded-xl border border-cyan-200/70 bg-white/95 px-2.5 py-1.5 text-center text-xs font-semibold text-slate-800 shadow-md shadow-cyan-500/10",
        "sm:w-[170px]",
        "hover:border-cyan-400 active:cursor-grabbing",
        isDragging && "opacity-30",
        shake && "animate-shake border-rose-400 bg-rose-50 text-rose-700",
      )}
    >
      {name}
    </button>
  );
});

function ZoomControls({
  revealAll,
  onToggleRevealAll,
}: {
  revealAll?: boolean;
  onToggleRevealAll?: () => void;
}) {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  const btn =
    "grid h-8 w-8 place-items-center rounded-lg border border-cyan-200 bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white";
  return (
    <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
      <button type="button" onClick={() => zoomIn()} aria-label="Yakınlaştır" className={btn}>
        <ZoomIn className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => zoomOut()} aria-label="Uzaklaştır" className={btn}>
        <ZoomOut className="h-3.5 w-3.5" />
      </button>
      <button type="button" onClick={() => resetTransform()} aria-label="Sıfırla" className={btn}>
        <Maximize2 className="h-3.5 w-3.5" />
      </button>
      {onToggleRevealAll ? (
        <button
          type="button"
          onClick={onToggleRevealAll}
          aria-label={revealAll ? "Cevapları gizle" : "Tüm cevapları göster"}
          title={revealAll ? "Cevapları gizle" : "Tüm cevapları göster (öğrenme modu)"}
          className={cn(btn, revealAll && "border-amber-400 bg-amber-100 text-amber-800")}
        >
          {revealAll ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      ) : null}
    </div>
  );
}


function ArenaPressure({ remaining, total }: { remaining: number; total: number }) {
  const threshold = Math.max(3, Math.ceil(total * 0.3));
  if (remaining <= 0 || remaining > threshold) return null;
  const critical = remaining <= Math.max(2, Math.ceil(total * 0.12));

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-none fixed inset-0 z-[32] overflow-hidden"
    >
      <motion.div
        animate={{ opacity: critical ? [0.18, 0.42, 0.18] : [0.1, 0.24, 0.1] }}
        transition={{ duration: critical ? 0.65 : 1.4, repeat: Infinity }}
        className="absolute inset-0 shadow-[inset_0_0_95px_rgba(239,68,68,0.8)]"
      />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-orange-600/30 via-rose-500/10 to-transparent" />
      <motion.div
        animate={critical ? { scale: [1, 1.08, 1], y: [0, -3, 0] } : { y: [0, -2, 0] }}
        transition={{ duration: critical ? 0.6 : 1.2, repeat: Infinity }}
        className="absolute inset-x-0 bottom-16 mx-auto w-fit rounded-full border border-orange-300/70 bg-slate-950/80 px-4 py-2 text-center text-xs font-black uppercase tracking-[0.2em] text-orange-200 shadow-2xl backdrop-blur"
      >
        🔥 Son {remaining} kart · {critical ? "Ateş hattı!" : "Rekabet kızışıyor"}
      </motion.div>
    </motion.div>
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
  // SSR sırasında localStorage okunamaz. İlk istemci effect'inde gerçek tercih
  // bir kez alınır ve oyun boyunca kilitlenir; başka sekmedeki değişiklik devam
  // eden solo/arena state'lerini birbirine karıştıramaz.
  const [isCompetitive, setIsCompetitive] = useState(false);
  const [modeReady, setModeReady] = useState(false);
  useEffect(() => {
    setIsCompetitive(getCompetitiveMode());
    setModeReady(true);
  }, []);
  const targets = useMemo(() => targetsFor(category), [category]);
  const targetById = useMemo(() => Object.fromEntries(targets.map((t) => [t.id, t])), [targets]);

  // Tarım & Hayvancılık → "il tıklama" modu (sürükleme yok, harita büyük).
  // "Tüm ..." alt kategorileri (item adları ürün adı olan) klasik sürükleme modunda kalır.
  const isClickMode =
    ((category.mainSlug === "tarim" || category.mainSlug === "hayvancilik") &&
      !category.slug.startsWith("tum-")) ||
    category.slug === "buyuksehirler";
  const isAllProvinces = category.slug === "iller-81";
  // Tüm kart adları gerçek il adıysa sürükleme hedefi ilin kendi sınırıdır
  // (beyaz nokta yok; sınır çerçevesi vurgulanır).
  const isProvinceDrag = useMemo(
    () => !isClickMode && allNamesAreProvinces(category.items),
    [category.items, isClickMode],
  );

  const [cards, setCards] = useState(() => shuffle(category.items));
  const [placed, setPlaced] = useState<Placed>({});
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [shakeTarget, setShakeTarget] = useState<{
    id: string;
    owner: ArenaPlayerId | null;
  } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [studyMistakes, setStudyMistakes] = useState<StudyMistake[]>([]);
  const cardLabels = useMemo(() => buildCardLabels(category.items), [category.items]);
  // Click-mode: yanlış tıklanan il adları (kırmızıya boyanır, tekrar tıklanamaz)
  const [wrongProvinces, setWrongProvinces] = useState<string[]>([]);
  // Joker ile açılan iller (sarı gösterilir)
  const [hintProvinces, setHintProvinces] = useState<string[]>([]);
  // Öğrenme modu: tüm cevapları geçici olarak haritada göster
  const [revealAll, setRevealAll] = useState(false);
  const startedAtRef = useRef(Date.now());
  const [arenaTurn, setArenaTurn] = useState<ArenaPlayerId>("red");
  const arenaTurnRef = useRef<ArenaPlayerId>("red");
  const [arenaPlayers, setArenaPlayers] = useState<ArenaPlayers>(emptyArenaPlayers);
  const arenaPlayersRef = useRef<ArenaPlayers>(emptyArenaPlayers());
  const [arenaCards, setArenaCards] = useState<ArenaCards>(() => initialArenaCards(category.items));
  const arenaCardsRef = useRef<ArenaCards>(arenaCards);
  const [arenaPlaced, setArenaPlaced] = useState<ArenaPlaced>(emptyArenaPlaced);
  const arenaPlacedRef = useRef<ArenaPlaced>(emptyArenaPlaced());
  const [arenaWrongProvinces, setArenaWrongProvinces] =
    useState<ArenaWrongProvinces>(emptyArenaWrongProvinces);
  const arenaWrongProvincesRef = useRef<ArenaWrongProvinces>(emptyArenaWrongProvinces());
  const [arenaTurnStartedAt, setArenaTurnStartedAt] = useState(perfNow);
  const arenaTurnStartedAtRef = useRef(arenaTurnStartedAt);
  const [arenaPaused, setArenaPaused] = useState(false);
  const arenaPausedRef = useRef(false);
  const [arenaFinal, setArenaFinal] = useState<ArenaPlayers | null>(null);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<{
    pct: number;
    correct: number;
    wrong: number;
    totalMs: number;
    avgMs: number;
  } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const registerArenaMove = useCallback(
    (outcome: "correct" | "wrong"): ArenaPlayers | null => {
      if (!isCompetitive) return null;
      const now = perfNow();
      const playerId = arenaTurnRef.current;
      const current = arenaPlayersRef.current;
      const player = current[playerId];
      const next: ArenaPlayers = {
        ...current,
        [playerId]: {
          ...player,
          [outcome]: player[outcome] + 1,
          elapsedMs:
            player.elapsedMs +
            (arenaPausedRef.current ? 0 : Math.max(0, now - arenaTurnStartedAtRef.current)),
        },
      };
      const otherPlayer: ArenaPlayerId = playerId === "red" ? "blue" : "red";
      const nextTurn: ArenaPlayerId = otherPlayer;
      arenaPlayersRef.current = next;
      arenaTurnRef.current = nextTurn;
      arenaTurnStartedAtRef.current = now;
      setArenaPlayers(next);
      setArenaTurn(nextTurn);
      setArenaTurnStartedAt(now);
      return next;
    },
    [isCompetitive],
  );

  const router = useRouter();
  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/konu/$mainSlug", params: { mainSlug: category.mainSlug } });
    }
  }, [router, category.mainSlug]);

  const isPortraitMobile = useIsPortraitMobile();

  // İl-illeri kategorilerinde doğru bırakılan illeri harita üzerinde yeşile boyayalım
  const isIlleri =
    !!REGION_ILLERI_SLUGS[category.slug] ||
    category.slug === "iller-81" ||
    category.slug === "buyuksehirler" ||
    isClickMode;
  const allPlacedPreview = useMemo(
    () => Object.fromEntries(targets.map((t) => [t.id, t])) as Placed,
    [targets],
  );
  const displayedPlaced = revealAll ? allPlacedPreview : placed;
  const displayedWrongProvinces = isCompetitive ? arenaWrongProvinces[arenaTurn] : wrongProvinces;
  const highlightedProvinces = useMemo(
    () => (isIlleri ? Object.values(displayedPlaced).map((p) => p.name) : []),
    [displayedPlaced, isIlleri],
  );
  const provinceDropTargets = useMemo(
    () =>
      isProvinceDrag
        ? targets.map((target) => ({
            provinceName: target.name,
            dropId: target.id,
            disabled: !!placed[target.id],
          }))
        : undefined,
    [isProvinceDrag, placed, targets],
  );
  const placedProvinceLabels = useMemo(
    () =>
      isProvinceDrag
        ? Object.values(displayedPlaced).map((target) => ({
            provinceName: target.name,
            label: target.name,
          }))
        : undefined,
    [displayedPlaced, isProvinceDrag],
  );
  const arenaClaimsById = useMemo(() => {
    const claims: Record<string, ArenaPlayerId> = {};
    for (const id of Object.keys(arenaPlaced.red)) claims[id] = "red";
    for (const id of Object.keys(arenaPlaced.blue)) claims[id] = "blue";
    return claims;
  }, [arenaPlaced]);
  const provinceClaims = useMemo(
    () =>
      isCompetitive
        ? (["red", "blue"] as const).flatMap((tone) =>
            Object.values(arenaPlaced[tone]).map((target) => ({
              provinceName: target.name,
              tone,
            })),
          )
        : undefined,
    [arenaPlaced, isCompetitive],
  );

  // Otomatik odak (bölge oyunları için)
  const focus = useMemo(
    () => focusBoundsForSlug(category.slug, category.items),
    [category.items, category.slug],
  );
  // Daha geniş bir genel görünüm için odak ölçeğine padding uygula (0.72 → %28 daha geriden bak)
  const focusScale = focus ? Math.max(1, Math.min(MAP_W / focus.w, MAP_H / focus.h) * 0.62) : 1;

  const mapWrapRef = useRef<HTMLDivElement>(null);
  const mapSurfaceRef = useRef<HTMLDivElement>(null);
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
  const gameTotal = total;
  const visibleCards = isCompetitive ? arenaCards : cards;

  // Event handler'ları aynı frame içindeki ikinci touch/pointer olayında da
  // güncel değeri görsün; React effect turunu beklemiyoruz.
  const placedRef = useRef(placed);
  const wrongProvincesRef = useRef(wrongProvinces);
  const doneRef = useRef(done);
  const correctCountRef = useRef(correctCount);
  const wrongCountRef = useRef(wrongCount);
  const wrongIdsRef = useRef(wrongIds);
  const finalizeGuardRef = useRef(false);
  const shakeTimeoutRef = useRef<number | null>(null);
  const winTimeoutRef = useRef<number | null>(null);
  const lastCorrectConfettiAtRef = useRef(0);
  const runGenerationRef = useRef(0);
  const provinceClickHandlerRef = useRef<(provinceName: string) => void>(() => {});
  const activeDragRef = useRef<{
    generation: number;
    owner: ArenaPlayerId | null;
  } | null>(null);

  placedRef.current = placed;
  wrongProvincesRef.current = wrongProvinces;
  correctCountRef.current = correctCount;
  wrongCountRef.current = wrongCount;
  wrongIdsRef.current = wrongIds;

  useEffect(() => {
    if (!isCompetitive || done) return;

    const updatePauseState = () => {
      // Sekme arka plandayken de süre gerçek zamanla ilerler. Yalnız oyuncunun
      // haritaya erişemediği zorunlu dikey telefon perdesinde sayaç durur.
      const shouldPause = isPortraitMobile;
      const now = perfNow();
      if (shouldPause === arenaPausedRef.current) return;

      if (shouldPause) {
        const playerId = arenaTurnRef.current;
        const current = arenaPlayersRef.current;
        const player = current[playerId];
        const next: ArenaPlayers = {
          ...current,
          [playerId]: {
            ...player,
            elapsedMs: player.elapsedMs + Math.max(0, now - arenaTurnStartedAtRef.current),
          },
        };
        arenaPlayersRef.current = next;
        setArenaPlayers(next);
      } else {
        arenaTurnStartedAtRef.current = now;
        setArenaTurnStartedAt(now);
      }

      arenaPausedRef.current = shouldPause;
      setArenaPaused(shouldPause);
    };

    updatePauseState();
  }, [done, isCompetitive, isPortraitMobile]);

  const commitCorrectTarget = (cardId: string, target: TargetPoint) => {
    if (isCompetitive) {
      const playerId = arenaTurnRef.current;
      if (placedRef.current[cardId]) return null;
      const nextArenaPlaced: ArenaPlaced = {
        ...arenaPlacedRef.current,
        [playerId]: {
          ...arenaPlacedRef.current[playerId],
          [cardId]: target,
        },
      };
      arenaPlacedRef.current = nextArenaPlaced;
      setArenaPlaced(nextArenaPlaced);

      const nextArenaCards: ArenaCards = arenaCardsRef.current.filter((card) => card.id !== cardId);
      arenaCardsRef.current = nextArenaCards;
      setArenaCards(nextArenaCards);

      const nextPlaced = { ...placedRef.current, [cardId]: target };
      placedRef.current = nextPlaced;
      setPlaced(nextPlaced);
    } else {
      if (placedRef.current[cardId]) return null;
      const nextPlaced = { ...placedRef.current, [cardId]: target };
      placedRef.current = nextPlaced;
      setPlaced(nextPlaced);
      setCards((current) => current.filter((card) => card.id !== cardId));
    }

    const nextCorrect = correctCountRef.current + 1;
    correctCountRef.current = nextCorrect;
    setCorrectCount(nextCorrect);
    const arenaSnapshot = registerArenaMove("correct");
    return { nextCorrect, arenaSnapshot };
  };

  const commitWrongMove = () => {
    const nextWrong = wrongCountRef.current + 1;
    wrongCountRef.current = nextWrong;
    setWrongCount(nextWrong);
    registerArenaMove("wrong");
    return nextWrong;
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const dragSession = activeDragRef.current;
    activeDragRef.current = null;
    if (
      !dragSession ||
      dragSession.generation !== runGenerationRef.current ||
      (isCompetitive && dragSession.owner !== arenaTurnRef.current)
    ) {
      return;
    }
    const cardId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : null;
    if (!overId) return; // boşluğa bırakma → sessiz

    if (overId === cardId) {
      sfx.correct();
      const now = perfNow();
      if (!isAllProvinces && now - lastCorrectConfettiAtRef.current > 300) {
        lastCorrectConfettiAtRef.current = now;
        // Küçük başarı vurgusu; yoğun oyunlarda üst üste canvas yükü oluşturmaz.
        void fireConfetti({
          particleCount: 12,
          spread: 40,
          startVelocity: 22,
          origin: { y: 0.5 },
          colors: ["#10b981", "#34d399", "#a7f3d0"],
          scalar: 0.7,
        });
      }
      const t = targetById[cardId];
      const committed = commitCorrectTarget(cardId, t);
      if (committed?.nextCorrect === gameTotal) {
        finalize(
          committed.nextCorrect,
          wrongCountRef.current,
          wrongIdsRef.current,
          committed.arenaSnapshot,
        );
      }
    } else {
      sfx.wrong();
      const nextShakeTarget = { id: cardId, owner: dragSession.owner };
      setShakeTarget(nextShakeTarget);
      const nextWrongIds = wrongIdsRef.current.includes(cardId)
        ? wrongIdsRef.current
        : [...wrongIdsRef.current, cardId];
      wrongIdsRef.current = nextWrongIds;
      setWrongIds(nextWrongIds);
      setStudyMistakes((current) =>
        addStudyMistake(current, {
          kind: "target",
          id: cardId,
          droppedOnId: overId,
        }),
      );
      commitWrongMove();
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = window.setTimeout(
        () =>
          setShakeTarget((current) =>
            current?.id === nextShakeTarget.id && current.owner === nextShakeTarget.owner
              ? null
              : current,
          ),
        500,
      );
    }
  };

  // Click-mode: il tıklama akışı (sadece tarım/hayvancılık)
  const answerMap = useMemo(() => {
    const m = new Map<string, TargetPoint>();
    if (isClickMode) {
      for (const t of targets) m.set(normalizePlaceName(t.name), t);
    }
    return m;
  }, [targets, isClickMode]);

  const handleProvinceClick = (provinceName: string) => {
    if (!isClickMode || doneRef.current) return;
    const key = normalizePlaceName(provinceName);
    const playerId = arenaTurnRef.current;
    const currentPlaced = isCompetitive ? arenaPlacedRef.current[playerId] : placedRef.current;
    const currentWrongProvinces = isCompetitive
      ? arenaWrongProvincesRef.current[playerId]
      : wrongProvincesRef.current;
    if (
      Object.values(currentPlaced).some(
        (placedTarget) => normalizePlaceName(placedTarget.name) === key,
      )
    ) {
      return;
    }
    if (currentWrongProvinces.some((name) => normalizePlaceName(name) === key)) {
      return;
    }

    const target = answerMap.get(key);
    if (target) {
      sfx.correct();
      const committed = commitCorrectTarget(target.id, target);
      if (committed?.nextCorrect === gameTotal) {
        finalize(
          committed.nextCorrect,
          wrongCountRef.current,
          wrongIdsRef.current,
          committed.arenaSnapshot,
        );
      }
    } else {
      sfx.wrong();
      if (isCompetitive) {
        const nextArenaWrong: ArenaWrongProvinces = {
          ...arenaWrongProvincesRef.current,
          [playerId]: [...arenaWrongProvincesRef.current[playerId], provinceName],
        };
        arenaWrongProvincesRef.current = nextArenaWrong;
        setArenaWrongProvinces(nextArenaWrong);
      } else {
        const nextWrongProvinces = [...wrongProvincesRef.current, provinceName];
        wrongProvincesRef.current = nextWrongProvinces;
        setWrongProvinces(nextWrongProvinces);
      }
      setStudyMistakes((current) =>
        addStudyMistake(current, { kind: "province", id: provinceName }),
      );
      commitWrongMove();
    }
  };

  const takeJoker = () => {
    if (!isClickMode || doneRef.current) return;
    const takenNames = new Set(
      [...Object.values(placedRef.current).map((t) => t.name), ...hintProvinces].map(
        normalizePlaceName,
      ),
    );
    const remaining = targets.filter(
      (t) => !placedRef.current[t.id] && !takenNames.has(normalizePlaceName(t.name)),
    );
    if (remaining.length === 0) return;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    setHintProvinces((current) => [...current, pick.name]);
    const committed = commitCorrectTarget(pick.id, pick);
    if (committed?.nextCorrect === gameTotal) {
      finalize(
        committed.nextCorrect,
        wrongCountRef.current,
        wrongIdsRef.current,
        committed.arenaSnapshot,
      );
    }
  };

  const finalize = (
    correct: number,
    wrong: number,
    wIds: string[],
    finalArenaPlayers: ArenaPlayers | null = null,
  ) => {
    if (finalizeGuardRef.current) return;
    finalizeGuardRef.current = true;
    doneRef.current = true;
    const totalMs = Date.now() - startedAtRef.current;
    const attempts = correct + wrong;
    const pct = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
    const avgMs = Math.round(totalMs / gameTotal);
    setSummary({ pct, correct, wrong, totalMs, avgMs });
    setArenaFinal(finalArenaPlayers);
    setDone(true);
    if (!isCompetitive) recordRun(category.slug, correct, wrong, wIds);
    if (winTimeoutRef.current) window.clearTimeout(winTimeoutRef.current);
    winTimeoutRef.current = window.setTimeout(() => {
      void fireConfetti({ particleCount: 90, spread: 90, origin: { y: 0.5 } });
      sfx.win();
    }, 100);
  };

  provinceClickHandlerRef.current = handleProvinceClick;
  const onProvinceClick = useCallback(
    (provinceName: string) => provinceClickHandlerRef.current(provinceName),
    [],
  );

  const reset = () => {
    if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
    if (winTimeoutRef.current) window.clearTimeout(winTimeoutRef.current);
    shakeTimeoutRef.current = null;
    winTimeoutRef.current = null;
    setActiveId(null);
    setShakeTarget(null);
    runGenerationRef.current += 1;
    activeDragRef.current = null;
    const nextCards = shuffle(category.items);
    const nextArenaCards = initialArenaCards(category.items);
    const nextArenaPlaced = emptyArenaPlaced();
    const nextArenaWrong = emptyArenaWrongProvinces();
    setCards(nextCards);
    setArenaCards(nextArenaCards);
    arenaCardsRef.current = nextArenaCards;
    setArenaPlaced(nextArenaPlaced);
    arenaPlacedRef.current = nextArenaPlaced;
    setArenaWrongProvinces(nextArenaWrong);
    arenaWrongProvincesRef.current = nextArenaWrong;
    setPlaced({});
    placedRef.current = {};
    setWrongIds([]);
    wrongIdsRef.current = [];
    setWrongProvinces([]);
    wrongProvincesRef.current = [];
    setHintProvinces([]);
    setRevealAll(false);
    setStudyMistakes([]);
    setCorrectCount(0);
    correctCountRef.current = 0;
    setWrongCount(0);
    wrongCountRef.current = 0;
    startedAtRef.current = Date.now();
    const empty = emptyArenaPlayers();
    const now = perfNow();
    arenaPlayersRef.current = empty;
    arenaTurnRef.current = "red";
    arenaTurnStartedAtRef.current = now;
    arenaPausedRef.current = false;
    setArenaPlayers(empty);
    setArenaTurn("red");
    setArenaTurnStartedAt(now);
    setArenaPaused(false);
    setArenaFinal(null);
    setDone(false);
    doneRef.current = false;
    finalizeGuardRef.current = false;
    lastCorrectConfettiAtRef.current = 0;
    setSummary(null);
  };

  useEffect(
    () => () => {
      if (shakeTimeoutRef.current) window.clearTimeout(shakeTimeoutRef.current);
      if (winTimeoutRef.current) window.clearTimeout(winTimeoutRef.current);
    },
    [],
  );

  const progressPct = Math.round((correctCount / gameTotal) * 100);
  const arenaOutcome = useMemo(() => {
    if (!arenaFinal) return null;
    const redScore = arenaScore(arenaFinal.red);
    const blueScore = arenaScore(arenaFinal.blue);
    let winner: ArenaPlayerId | "draw" = "draw";
    if (redScore !== blueScore) winner = redScore > blueScore ? "red" : "blue";
    else {
      const redAccuracy =
        arenaFinal.red.correct / Math.max(1, arenaFinal.red.correct + arenaFinal.red.wrong);
      const blueAccuracy =
        arenaFinal.blue.correct / Math.max(1, arenaFinal.blue.correct + arenaFinal.blue.wrong);
      if (redAccuracy !== blueAccuracy) {
        winner = redAccuracy > blueAccuracy ? "red" : "blue";
      } else if (arenaFinal.red.elapsedMs !== arenaFinal.blue.elapsedMs) {
        winner = arenaFinal.red.elapsedMs < arenaFinal.blue.elapsedMs ? "red" : "blue";
      }
    }
    if (winner === "draw" && arenaFinal.red.elapsedMs !== arenaFinal.blue.elapsedMs) {
      winner = arenaFinal.red.elapsedMs < arenaFinal.blue.elapsedMs ? "red" : "blue";
    }
    return { redScore, blueScore, winner };
  }, [arenaFinal]);
  const studyResult = useMemo<StudyReviewRequest | null>(() => {
    if (!summary) return null;
    return {
      categorySlug: category.slug,
      correctCount: Math.min(category.items.length, 500, summary.correct),
      wrongCount: Math.min(5_000, summary.wrong),
      totalMs: Math.min(24 * 60 * 60 * 1000, summary.totalMs),
      wrongAttempts: studyMistakes,
    };
  }, [category.items.length, category.slug, studyMistakes, summary]);

  if (!modeReady) {
    return (
      <div className="mx-auto grid min-h-[50vh] w-full max-w-6xl place-items-center px-4 text-sm font-bold text-cyan-700">
        Oyun hazırlanıyor…
      </div>
    );
  }

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

      <header className="mb-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 max-lg:landscape:mb-1">
        {/* Mobil yatay: sol üstte belirgin GERİ butonu (Sıfırla'dan uzak) */}
        <button
          type="button"
          onClick={goBack}
          aria-label="Bir önceki ekrana dön"
          className="hidden h-9 items-center gap-1.5 rounded-full bg-slate-900 px-3 text-xs font-bold text-white shadow-md ring-1 ring-slate-700 transition active:scale-95 max-lg:landscape:inline-flex"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Geri
        </button>

        <h1 className="min-w-0 truncate text-base font-black tracking-tight text-slate-900 sm:text-2xl max-lg:landscape:text-sm">
          <span className="mr-2">{category.emoji}</span>
          {isClickMode ? (
            <>
              <span className="text-emerald-700">{category.title}</span>
              <span className="ml-1 text-slate-500 font-semibold text-xs sm:text-sm max-lg:landscape:text-[10px]">
                {category.slug === "buyuksehirler" ? "— doğru illere tıkla" : "— üretim illerini bul"}
              </span>
            </>
          ) : (
            category.title
          )}
        </h1>

        <div className="flex items-center justify-end gap-1.5 text-sm text-slate-700 sm:gap-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
            ✓ {correctCount}
            {isClickMode || isCompetitive ? `/${gameTotal}` : ""}
          </span>
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
            ✗ {wrongCount}
          </span>
          <Button size="sm" variant="outline" onClick={reset} className="h-7 gap-1.5 px-2 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Sıfırla
          </Button>
        </div>
      </header>

      {isCompetitive ? (
        <CompetitionHUD
          turn={arenaTurn}
          players={arenaPlayers}
          turnStartedAt={arenaTurnStartedAt}
          done={done}
          paused={arenaPaused}
          poolRemaining={arenaCards.length}
          totalItems={total}
        />
      ) : null}

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

      {isClickMode ? (
        // Click-mode: harita tam genişlik, kart paneli yok
        <div className="flex flex-1 min-h-0 flex-row gap-2">
          <div className="relative flex-1 min-h-0" ref={mapWrapRef}>
            <TransformWrapper
              key={category.slug + (containerW > 0 ? "-ready" : "-init")}
              ref={zoomRef}
              initialScale={focusScale}
              minScale={0.9}
              maxScale={8}
              doubleClick={{ disabled: true }}
              wheel={{ step: 0.15 }}
              pinch={{ step: 5 }}
              panning={{ velocityDisabled: true }}
              limitToBounds={true}
              centerOnInit={!focus}
            >
              <>
                <ZoomControls
                  revealAll={revealAll}
                  onToggleRevealAll={() => setRevealAll((v) => !v)}
                />
                <TransformComponent
                  wrapperClass="!w-full !h-full !overflow-hidden !rounded-2xl !border !border-cyan-200 !bg-gradient-to-br !from-white !via-sky-50 !to-cyan-50 !shadow-xl !shadow-cyan-500/10"
                  contentClass="!w-full"
                >
                  <div className="relative w-full" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
                    <TurkeyMap
                      className="absolute inset-0 h-full w-full"
                      variant={category.mapVariant}
                      highlightedProvinces={highlightedProvinces}
                      wrongProvinces={displayedWrongProvinces}
                      hintProvinces={hintProvinces}
                      onProvinceClick={onProvinceClick}
                      interactive
                    />
                  </div>
                </TransformComponent>
              </>
            </TransformWrapper>
          </div>
          <div className="w-[104px] shrink-0 sm:w-[140px]">
            <button
              type="button"
              onClick={takeJoker}
              disabled={done || correctCount >= gameTotal}
              className="flex w-full flex-col items-center gap-1 rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-100 to-amber-50 px-2 py-3 text-center text-[11px] font-black text-amber-800 shadow-md transition active:scale-95 disabled:opacity-40 sm:text-xs"
            >
              <Lightbulb className="h-5 w-5" />
              Joker
              <span className="text-[9px] font-semibold leading-tight text-amber-700/80">
                Bir doğru cevabı sarı göster
              </span>
            </button>
            <div className="mt-2 rounded-2xl bg-white/60 p-2 text-[10px] font-semibold leading-tight text-slate-500 ring-1 ring-cyan-100">
              Joker ile açılan iller <span className="text-amber-600">sarı</span> renkte kalır.
            </div>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={hybridCollision}
          modifiers={[snapCenterToCursor]}
          onDragStart={(e) => {
            const cardId = String(e.active.id);
            activeDragRef.current = {
              generation: runGenerationRef.current,
              owner: isCompetitive ? arenaTurnRef.current : null,
            };
            setActiveId(cardId);
          }}
          onDragCancel={() => {
            activeDragRef.current = null;
            setActiveId(null);
          }}
          onDragEnd={onDragEnd}
        >
          {/* Ana oyun alanı — mobil yatayda yan yana */}
          <div
            className={cn(
              "flex flex-1 min-h-0 flex-col gap-3 max-lg:landscape:flex-row max-lg:landscape:gap-2",
              isProvinceDrag && "lg:flex-row",
            )}
          >
            <div className="relative flex-1 min-h-0" ref={mapWrapRef}>
              <TransformWrapper
                key={category.slug + (containerW > 0 ? "-ready" : "-init")}
                ref={zoomRef}
                initialScale={focusScale}
                minScale={0.9}
                maxScale={8}
                doubleClick={{ mode: "toggle", step: 1.5 }}
                wheel={{ step: 0.15 }}
                pinch={{ step: 5 }}
                panning={{ velocityDisabled: true }}
                limitToBounds={true}
                centerOnInit={!focus}
              >
                <>
                  <ZoomControls
                    revealAll={revealAll}
                    onToggleRevealAll={() => setRevealAll((v) => !v)}
                  />
                  <TransformComponent
                    wrapperClass="!w-full !h-full !overflow-hidden !rounded-2xl !border !border-cyan-200 !bg-gradient-to-br !from-white !via-sky-50 !to-cyan-50 !shadow-xl !shadow-cyan-500/10"
                    contentClass="!w-full"
                  >
                    <div
                      ref={mapSurfaceRef}
                      className="relative w-full"
                      style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
                    >
                      <TurkeyMap
                        className="absolute inset-0 h-full w-full"
                        variant={category.mapVariant}
                        highlightedProvinces={highlightedProvinces}
                        provinceDropTargets={provinceDropTargets}
                        placedProvinceLabels={placedProvinceLabels}
                        provinceClaims={provinceClaims}
                      />
                      <ShapeLayer
                        targets={targets}
                        placed={displayedPlaced}
                        categorySlug={category.slug}
                        interactive={!revealAll}
                      />
                      {!isProvinceDrag ? (
                        <TargetGuideLayer targets={targets} placed={displayedPlaced} />
                      ) : null}
                      <div className="absolute inset-0">
                        {!isProvinceDrag
                          ? targets.map((t) =>
                              // Şekli olan hedeflerin kendisi sürükleme alanıdır;
                              // yerleşmeden beyaz nokta gösterilmez.
                              t.shape && !displayedPlaced[t.id] ? null : (
                                <DropDot
                                  key={t.id}
                                  t={t}
                                  placed={!!displayedPlaced[t.id]}
                                  claimTone={arenaClaimsById[t.id]}
                                />
                              ),
                            )
                          : null}
                      </div>
                    </div>
                  </TransformComponent>
                </>
              </TransformWrapper>
            </div>

            {/* Kart paneli — mobilde alt, mobil yatayda sağ */}
            <div
              className={cn(
                "max-lg:landscape:w-[200px] max-lg:landscape:flex-shrink-0",
                isProvinceDrag && "lg:w-[220px] lg:flex-shrink-0",
              )}
            >
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 max-lg:landscape:hidden">
                Kartları haritaya sürükle
              </div>
              <div
                className={cn(
                  "max-h-[32vh] overflow-y-auto rounded-2xl bg-white/50 p-2 ring-1 ring-cyan-100 max-lg:landscape:max-h-full max-lg:landscape:h-full",
                  isProvinceDrag && "lg:max-h-[68vh]",
                )}
              >
                <div className="flex flex-wrap items-start justify-start gap-1.5 max-lg:landscape:flex-col max-lg:landscape:flex-nowrap">
                  {visibleCards.map((c) => (
                    <div key={c.id} className="max-lg:landscape:w-full">
                      <Card
                        id={c.id}
                        name={cardLabels[c.id] ?? c.name}
                        shake={
                          shakeTarget?.id === c.id &&
                          shakeTarget.owner === (isCompetitive ? arenaTurn : null)
                        }
                      />
                    </div>
                  ))}
                  {visibleCards.length === 0 && !done && (
                    <div className="p-3 text-sm text-slate-500">Tüm kartlar yerleştirildi 🎉</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className="pointer-events-none min-h-[40px] w-[150px] whitespace-normal break-words rounded-xl border border-cyan-400 bg-white px-3 py-2 text-center text-xs font-semibold text-slate-800 shadow-2xl shadow-cyan-500/40 sm:w-[170px] sm:text-sm">
                {cardLabels[activeId] ?? category.items.find((i) => i.id === activeId)?.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {isCompetitive ? <ArenaPressure remaining={arenaCards.length} total={total} /> : null}

      {/* Sabit çıkış butonu — mobil yatayda gizli (üstteki X kullanılır) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rose-200 bg-white/95 px-3 py-2 shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.15)] backdrop-blur max-lg:landscape:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={goBack}
            className="w-full max-w-md whitespace-normal text-center text-[11px] leading-tight sm:text-xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            Geri dön — bu konuyu bir sonraki hayatımda çalışacağım 😞
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
              <button
                type="button"
                onClick={goBack}
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Geri dön
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {done && summary && studyResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-slate-900/45 px-4 py-4 backdrop-blur-sm sm:py-6"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="mx-auto w-full max-w-4xl space-y-3"
            >
              <section className="rounded-3xl border border-cyan-200 bg-white p-4 shadow-2xl sm:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-white shadow-lg">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-cyan-600">
                      Oyun tamamlandı · {arenaOutcome ? "arena sonucu" : "harita sonucu"}
                    </div>
                    <div className="truncate text-lg font-black text-slate-900">
                      {arenaOutcome
                        ? arenaOutcome.winner === "draw"
                          ? "Berabere"
                          : `${arenaOutcome.winner === "red" ? "Kırmızı" : "Mavi"} kazandı!`
                        : category.title}
                    </div>
                  </div>
                </div>
                {arenaOutcome && arenaFinal ? (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <ArenaResultCard
                      label="Kırmızı"
                      player={arenaFinal.red}
                      score={arenaOutcome.redScore}
                      winner={arenaOutcome.winner === "red"}
                      tone="red"
                    />
                    <ArenaResultCard
                      label="Mavi"
                      player={arenaFinal.blue}
                      score={arenaOutcome.blueScore}
                      winner={arenaOutcome.winner === "blue"}
                      tone="blue"
                    />
                    <p className="col-span-2 text-[10px] font-semibold leading-relaxed text-slate-500">
                      Skor: doğru kart × 1.000 − yanlış × 350 − aktif saniye × 2
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-5">
                    <Stat label="Başarı" value={`%${summary.pct}`} />
                    <Stat label="Doğru" value={summary.correct} />
                    <Stat label="Yanlış" value={summary.wrong} />
                    <Stat label="Süre" value={formatMs(summary.totalMs)} />
                    <Stat label="Ortalama" value={formatMs(summary.avgMs)} />
                  </div>
                )}
              </section>

              <Suspense
                fallback={
                  <div className="rounded-3xl border border-cyan-100 bg-white p-8 text-center text-sm font-bold text-cyan-700 shadow-xl">
                    Mini çalışma hazırlanıyor…
                  </div>
                }
              >
                <PostGameStudy result={studyResult} onReplay={reset} onExit={goBack} />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ArenaResultCard({
  label,
  player,
  score,
  winner,
  tone,
}: {
  label: string;
  player: ArenaPlayer;
  score: number;
  winner: boolean;
  tone: ArenaPlayerId;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3",
        tone === "red"
          ? "border-rose-200 bg-rose-50 text-rose-950"
          : "border-blue-200 bg-blue-50 text-blue-950",
        winner && (tone === "red" ? "ring-2 ring-rose-500" : "ring-2 ring-blue-500"),
      )}
    >
      <div className="text-xs font-black uppercase tracking-wide">
        {winner ? "🏆 " : ""}
        {label}
      </div>
      <div className="mt-1 text-2xl font-black">{score}</div>
      <div className="mt-1 text-[10px] font-bold opacity-70">
        ✓ {player.correct} · ✗ {player.wrong} · {formatMs(player.elapsedMs)}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cyan-50/70 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-cyan-700">{label}</div>
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
