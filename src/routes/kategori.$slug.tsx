import { createFileRoute, notFound } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { CATEGORY_MAP } from "@/lib/game-data";

const GameBoard = lazy(() =>
  import("@/components/GameBoard").then((module) => ({
    default: module.GameBoard,
  })),
);

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const c = CATEGORY_MAP[params.slug];
    const title = c ? `${c.title} — Harita Ustası` : "Kategori — Harita Ustası";
    const desc = c
      ? `${c.title} konusunu Türkiye haritasında sürükle-bırak oyunuyla öğren.`
      : "Türkiye coğrafyası harita oyunu kategorisi.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  loader: ({ params }) => {
    const c = CATEGORY_MAP[params.slug];
    if (!c) throw notFound();
    return { slug: params.slug };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = CATEGORY_MAP[slug];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-cyan-50">
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center text-sm font-bold text-cyan-700">
            Harita hazırlanıyor…
          </div>
        }
      >
        <GameBoard category={category} />
      </Suspense>
    </div>
  );
}
