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
  /** İl adları — bunlar yeşil dolgu ile vurgulanır (doğru yerleştirilen iller). */
  highlightedProvinces?: string[];
};

// ASCII normalize — kart adları ("Istanbul") ile SVG path adları ("Istanbul") eşleşsin
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

export function TurkeyMap({ className, children, variant = "provinces", highlightedProvinces }: Props) {
  const highlightSet = new Set((highlightedProvinces ?? []).map(norm));
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
        <linearGradient id="tr-highlight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="tr-shadow" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0ea5b7" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="url(#tr-sea)" />
      <g filter="url(#tr-shadow)">
        {provinces.map((p) => {
          const isHighlighted = highlightSet.has(norm(p.name));
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
            fill = "url(#tr-highlight)";
            stroke = "rgba(6,95,70,0.7)";
            strokeWidth = 0.8;
          }

          return (
            <path
              key={p.name}
              d={p.path}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
          );
        })}
      </g>
      {children}
    </svg>
  );
}
