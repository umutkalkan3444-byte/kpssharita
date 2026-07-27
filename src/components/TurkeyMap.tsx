import { useDroppable, type UniqueIdentifier } from "@dnd-kit/core";
import { memo, useId, useMemo, type RefCallback } from "react";
import provincesData from "@/data/turkey-provinces.json";
import { PROVINCE_LABEL_LAYOUT } from "@/data/province-labels";
import { MAP_W, MAP_H } from "@/lib/geo";
import { REGION_OF, REGION_COLORS } from "@/lib/province-regions";
import { normalizePlaceName } from "@/lib/place-name";
import { PROVINCE_DROP_KIND } from "@/lib/province-drop-target";

type ProvinceDef = { name: string; path: string };
const provinces = (provincesData as { provinces: ProvinceDef[] }).provinces;

export type MapVariant = "provinces" | "regions" | "muted";

export type ProvinceDropTarget = {
  provinceName: string;
  dropId: UniqueIdentifier;
  disabled?: boolean;
};

export type PlacedProvinceLabel = {
  provinceName: string;
  /** Defaults to provinceName when omitted. */
  label?: string;
};

export type ProvinceClaim = {
  provinceName: string;
  tone: "red" | "blue";
};

type Props = {
  className?: string;
  children?: React.ReactNode;
  viewBox?: string;
  variant?: MapVariant;
  /** İl adları — yeşil dolgu ile vurgulanır (doğru). */
  highlightedProvinces?: string[];
  /** İl adları — kırmızı dolgu ile vurgulanır (yanlış). */
  wrongProvinces?: string[];
  /** Tıklama callback'i. */
  onProvinceClick?: (name: string) => void;
  /** Etkileşim modu — iller tıklanabilir. */
  interactive?: boolean;
  /**
   * Registers matching real province SVG paths as dnd-kit droppables.
   * Names are matched with normalizePlaceName, including Afyonkarahisar/Afyon.
   */
  provinceDropTargets?: readonly ProvinceDropTarget[];
  /** Labels rendered inside, and clipped by, their province's real SVG path. */
  placedProvinceLabels?: readonly PlacedProvinceLabel[];
  /** Rekabet modunda doğru bilinen illerin oyuncu rengini gösterir. */
  provinceClaims?: readonly ProvinceClaim[];
};

type ProvincePathProps = {
  name: string;
  d: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  clickable: boolean;
  onClick?: (name: string) => void;
  showTitle: boolean;
};

type ProvincePathMarkupProps = ProvincePathProps & {
  nodeRef?: RefCallback<SVGPathElement>;
  dropId?: string;
  isDropOver?: boolean;
};

function ProvincePathMarkup({
  name,
  d,
  fill,
  stroke,
  strokeWidth,
  clickable,
  onClick,
  showTitle,
  nodeRef,
  dropId,
  isDropOver,
}: ProvincePathMarkupProps) {
  const handler =
    clickable && onClick
      ? (e: React.PointerEvent<SVGPathElement>) => {
          // Only primary button / touch / pen — prevent duplicate synthetic click
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.preventDefault();
          onClick(name);
        }
      : undefined;

  return (
    <>
      <path
        ref={nodeRef}
        d={d}
        fill={fill}
        stroke={isDropOver ? "rgba(8,145,178,0.95)" : stroke}
        strokeWidth={isDropOver ? Math.max(strokeWidth, 2) : strokeWidth}
        strokeLinejoin="round"
        pointerEvents={dropId ? "visibleFill" : "none"}
        data-drop-kind={dropId ? PROVINCE_DROP_KIND : undefined}
        data-drop-id={dropId}
        data-province-name={dropId ? name : undefined}
      >
        {showTitle ? <title>{name}</title> : null}
      </path>
      {clickable ? (
        <path
          d={d}
          fill="transparent"
          stroke="none"
          strokeWidth={0}
          strokeLinejoin="round"
          onPointerUp={handler}
          style={{ cursor: "pointer", touchAction: "manipulation" }}
          pointerEvents="visibleFill"
        />
      ) : null}
    </>
  );
}

const ProvincePath = memo(function ProvincePath(props: ProvincePathProps) {
  return <ProvincePathMarkup {...props} />;
});

type DroppableProvincePathProps = ProvincePathProps & {
  dropId: UniqueIdentifier;
  dropDisabled: boolean;
};

const DroppableProvincePath = memo(function DroppableProvincePath({
  dropId,
  dropDisabled,
  ...pathProps
}: DroppableProvincePathProps) {
  const data = useMemo(
    () => ({ kind: "province" as const, provinceName: pathProps.name }),
    [pathProps.name],
  );
  const { isOver, setNodeRef } = useDroppable({
    id: dropId,
    disabled: dropDisabled,
    data,
    // Exact collision uses the real SVG fill under the pointer. The 81
    // bundled paths are static, so rectangular resize measurements are unused.
    resizeObserverConfig: { disabled: true },
  });
  const svgRef = setNodeRef as unknown as RefCallback<SVGPathElement>;

  return (
    <ProvincePathMarkup
      {...pathProps}
      nodeRef={svgRef}
      dropId={dropDisabled ? undefined : String(dropId)}
      isDropOver={!dropDisabled && isOver}
    />
  );
});

type RenderedProvinceLabel = {
  key: string;
  label: string;
  path: string;
  layout: (typeof PROVINCE_LABEL_LAYOUT)[string];
};

export function TurkeyMap({
  className,
  children,
  viewBox = `0 0 ${MAP_W} ${MAP_H}`,
  variant = "provinces",
  highlightedProvinces,
  wrongProvinces,
  onProvinceClick,
  interactive,
  provinceDropTargets,
  placedProvinceLabels,
  provinceClaims,
}: Props) {
  const instanceId = `turkey-map-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const fillGradientId = `${instanceId}-fill`;
  const seaGradientId = `${instanceId}-sea`;
  const highlightKey = (highlightedProvinces ?? []).join("|");
  const wrongKey = (wrongProvinces ?? []).join("|");

  const highlightSet = useMemo(
    () => new Set((highlightedProvinces ?? []).map(normalizePlaceName)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightKey],
  );
  const wrongSet = useMemo(
    () => new Set((wrongProvinces ?? []).map(normalizePlaceName)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wrongKey],
  );
  const dropTargetMap = useMemo(
    () =>
      new Map(
        (provinceDropTargets ?? []).map((target) => [
          normalizePlaceName(target.provinceName),
          target,
        ]),
      ),
    [provinceDropTargets],
  );
  const claimMap = useMemo(
    () =>
      new Map(
        (provinceClaims ?? []).map((claim) => [normalizePlaceName(claim.provinceName), claim.tone]),
      ),
    [provinceClaims],
  );
  const renderedLabels = useMemo<RenderedProvinceLabel[]>(() => {
    const labelMap = new Map(
      (placedProvinceLabels ?? []).map((entry) => [
        normalizePlaceName(entry.provinceName),
        entry.label ?? entry.provinceName,
      ]),
    );

    return provinces.flatMap((province) => {
      const key = normalizePlaceName(province.name);
      const label = labelMap.get(key);
      const layout = PROVINCE_LABEL_LAYOUT[province.name];
      return label && layout ? [{ key, label, path: province.path, layout }] : [];
    });
  }, [placedProvinceLabels]);

  return (
    <svg viewBox={viewBox} className={className} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={fillGradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6f7fb" />
          <stop offset="60%" stopColor="#c9eef1" />
          <stop offset="100%" stopColor="#a6e5df" />
        </linearGradient>
        <linearGradient id={seaGradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2fbff" />
          <stop offset="100%" stopColor="#e2f4ff" />
        </linearGradient>
        {renderedLabels.map((entry) => (
          <clipPath
            key={entry.key}
            id={`${instanceId}-clip-${entry.key}`}
            clipPathUnits="userSpaceOnUse"
          >
            <path d={entry.path} />
          </clipPath>
        ))}
      </defs>
      <rect width={MAP_W} height={MAP_H} fill={`url(#${seaGradientId})`} />
      <g>
        {provinces.map((p) => {
          const key = normalizePlaceName(p.name);
          const isHighlighted = highlightSet.has(key);
          const isWrong = wrongSet.has(key);
          const claimTone = claimMap.get(key);
          const isLocked = isHighlighted || isWrong || !!claimTone;
          const dropTarget = dropTargetMap.get(key);
          let fill: string = `url(#${fillGradientId})`;
          let stroke = "rgba(15,118,155,0.45)";
          let strokeWidth = 0.6;

          if (variant === "regions") {
            const region = REGION_OF[p.name] ?? "İç Anadolu";
            fill = REGION_COLORS[region] ?? "#e6f7fb";
            stroke = "rgba(15,118,155,0.15)";
            strokeWidth = 0.3;
          } else if (variant === "muted") {
            fill = "#eaf6f8";
            stroke = "rgba(15,118,155,0.25)";
          }

          if (claimTone === "red") {
            fill = "#fb7185";
            stroke = "rgba(159,18,57,0.78)";
            strokeWidth = 0.9;
          } else if (claimTone === "blue") {
            fill = "#60a5fa";
            stroke = "rgba(30,64,175,0.78)";
            strokeWidth = 0.9;
          } else if (isHighlighted) {
            fill = "#10b981";
            stroke = "rgba(6,95,70,0.7)";
            strokeWidth = 0.8;
          } else if (isWrong) {
            fill = "#ef4444";
            stroke = "rgba(153,27,27,0.7)";
            strokeWidth = 0.8;
          }

          const clickable = !!interactive && !isLocked && !!onProvinceClick;

          const pathProps: ProvincePathProps = {
            name: p.name,
            d: p.path,
            fill,
            stroke,
            strokeWidth,
            clickable,
            onClick: onProvinceClick,
            showTitle: !!interactive || !!dropTarget,
          };

          return dropTarget ? (
            <DroppableProvincePath
              key={p.name}
              {...pathProps}
              dropId={dropTarget.dropId}
              dropDisabled={!!dropTarget.disabled}
            />
          ) : (
            <ProvincePath key={p.name} {...pathProps} />
          );
        })}
      </g>
      <g pointerEvents="none" aria-hidden="true">
        {renderedLabels.map((entry) => {
          const estimatedWidth = entry.label.length * entry.layout.fontSize * 0.58;
          const needsCompression = estimatedWidth > entry.layout.maxWidth;

          return (
            <text
              key={entry.key}
              x={entry.layout.x}
              y={entry.layout.y}
              textAnchor="middle"
              dominantBaseline="central"
              clipPath={`url(#${instanceId}-clip-${entry.key})`}
              fill="#064e3b"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={0.9}
              paintOrder="stroke"
              fontSize={entry.layout.fontSize}
              fontWeight={800}
              letterSpacing="-0.15"
              textLength={needsCompression ? entry.layout.maxWidth : undefined}
              lengthAdjust={needsCompression ? "spacingAndGlyphs" : undefined}
            >
              {entry.label}
            </text>
          );
        })}
      </g>
      {children}
    </svg>
  );
}
