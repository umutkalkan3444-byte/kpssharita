import { memo, useMemo } from "react";
import provincesData from "@/data/turkey-provinces.json";
import { MAP_W, MAP_H } from "@/lib/geo";
import { REGION_OF, REGION_COLORS } from "@/lib/province-regions";

type ProvinceDef = { name: string; path: string };
const provinces = (provincesData as { provinces: ProvinceDef[] }).provinces;

export type MapVariant = "provinces" | "regions" | "muted";

type Props = {
  className?: string;
  children?: React.ReactNode;
  variant?: MapVariant;
  /** İl adları — yeşil dolgu ile vurgulanır (doğru). */
  highlightedProvinces?: string[];
  /** İl adları — kırmızı dolgu ile vurgulanır (yanlış). */
  wrongProvinces?: string[];
  /** Tıklama callback'i. */
  onProvinceClick?: (name: string) => void;
  /** Etkileşim modu — iller tıklanabilir. */
  interactive?: boolean;
};

function norm(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/â/g, "a")
    .replace(/[^a-z0-9]/g, "");
}

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

const ProvincePath = memo(function ProvincePath({
  name,
  d,
  fill,
  stroke,
  strokeWidth,
  clickable,
  onClick,
  showTitle,
}: ProvincePathProps) {
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      onClick={clickable && onClick ? () => onClick(name) : undefined}
      style={clickable ? { cursor: "pointer" } : undefined}
    >
      {showTitle ? <title>{name}</title> : null}
    </path>
  );
});

export function TurkeyMap({
  className,
  children,
  variant = "provinces",
  highlightedProvinces,
  wrongProvinces,
  onProvinceClick,
  interactive,
}: Props) {
  const highlightKey = (highlightedProvinces ?? []).join("|");
  const wrongKey = (wrongProvinces ?? []).join("|");

  const highlightSet = useMemo(
    () => new Set((highlightedProvinces ?? []).map(norm)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [highlightKey],
  );
  const wrongSet = useMemo(
    () => new Set((wrongProvinces ?? []).map(norm)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [wrongKey],
  );

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="tr-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e6f7fb" />
          <stop offset="60%" stopColor="#c9eef1" />
          <stop offset="100%" stopColor="#a6e5df" />
        </linearGradient>
        <linearGradient id="tr-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2fbff" />
          <stop offset="100%" stopColor="#e2f4ff" />
        </linearGradient>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="url(#tr-sea)" />
      <g>
        {provinces.map((p) => {
          const key = norm(p.name);
          const isHighlighted = highlightSet.has(key);
          const isWrong = wrongSet.has(key);
          const isLocked = isHighlighted || isWrong;
          let fill: string = "url(#tr-fill)";
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

          if (isHighlighted) {
            fill = "#10b981";
            stroke = "rgba(6,95,70,0.7)";
            strokeWidth = 0.8;
          } else if (isWrong) {
            fill = "#ef4444";
            stroke = "rgba(153,27,27,0.7)";
            strokeWidth = 0.8;
          }

          const clickable = !!interactive && !isLocked && !!onProvinceClick;

          return (
            <ProvincePath
              key={p.name}
              name={p.name}
              d={p.path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              clickable={clickable}
              onClick={onProvinceClick}
              showTitle={!!interactive}
            />
          );
        })}
      </g>
      {children}
    </svg>
  );
}
