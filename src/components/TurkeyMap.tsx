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
};

export function TurkeyMap({ className, children, variant = "provinces" }: Props) {
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
        <filter id="tr-shadow" x="-5%" y="-5%" width="110%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0ea5b7" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width={MAP_W} height={MAP_H} fill="url(#tr-sea)" />
      <g filter="url(#tr-shadow)">
        {provinces.map((p) => {
          let fill: string = "url(#tr-fill)";
          let stroke = "rgba(15,118,155,0.45)";
          let strokeWidth = 0.6;

          if (variant === "regions") {
            const region = REGION_OF[p.name] ?? "İç Anadolu";
            fill = REGION_COLORS[region] ?? "#e6f7fb";
            // Bölge içindeki il sınırlarını neredeyse gizle, dış sınırlar için hafif çizgi
            stroke = "rgba(15,118,155,0.15)";
            strokeWidth = 0.3;
          } else if (variant === "muted") {
            fill = "#eaf6f8";
            stroke = "rgba(15,118,155,0.25)";
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
