import { createFileRoute, notFound } from "@tanstack/react-router";
import { CATEGORY_MAP } from "@/lib/game-data";
import { GameBoard } from "@/components/GameBoard";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const c = CATEGORY_MAP[params.slug];
    const title = c ? `${c.title} — KPSS Harita Oyunu` : "Kategori — KPSS Harita Oyunu";
    const desc = c
      ? `${c.title} konusunu Türkiye haritasında sürükle-bırak oyunuyla öğren.`
      : "KPSS coğrafya harita oyunu kategorisi.";
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
  const { slug } = Route.useLoaderData();
  const category = CATEGORY_MAP[slug];
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-cyan-50">
      <GameBoard category={category} />
    </div>
  );
}
