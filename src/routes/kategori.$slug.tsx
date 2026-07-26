import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { CATEGORY_MAP } from "@/lib/game-data";
import { ExamWarmup } from "@/components/study/ExamWarmup";
import type { WarmupCompletion } from "@/lib/study/schemas";

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
  const router = useRouter();
  const [warmup, setWarmup] = useState<WarmupCompletion | null>(null);
  const [runNumber, setRunNumber] = useState(1);

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      void router.navigate({
        to: "/konu/$mainSlug",
        params: { mainSlug: category.mainSlug },
      });
    }
  };

  if (!warmup) {
    return (
      <div className="grid min-h-screen place-items-center bg-gradient-to-b from-white via-sky-50 to-cyan-50 px-4 py-8">
        <ExamWarmup
          categorySlug={category.slug}
          categoryTitle={category.title}
          seed={`${category.slug}:${runNumber}`}
          onComplete={setWarmup}
          onBack={goBack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-cyan-50">
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center text-sm font-bold text-cyan-700">
            Harita hazırlanıyor…
          </div>
        }
      >
        <GameBoard
          key={`${category.slug}:${runNumber}`}
          category={category}
          warmupCompletion={warmup}
          onRestartJourney={() => {
            setRunNumber((current) => current + 1);
            setWarmup(null);
          }}
        />
      </Suspense>
    </div>
  );
}
