import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Repeat2 } from "lucide-react";
import { dueWrongs, loadState, type WrongLog } from "@/lib/storage";
import { CATEGORY_MAP } from "@/lib/game-data";

export const Route = createFileRoute("/tekrar")({
  head: () => ({
    meta: [
      { title: "Tekrar Et — Harita Ustası" },
      { name: "description", content: "Yanlış yaptığın konuları aralıklı tekrar ile pekiştir." },
    ],
  }),
  component: RepeatPage,
});

function RepeatPage() {
  const [due, setDue] = useState<WrongLog[] | null>(null);
  useEffect(() => setDue(dueWrongs(loadState())), []);

  const grouped: Record<string, WrongLog[]> = {};
  (due ?? []).forEach((w) => {
    (grouped[w.categorySlug] ??= []).push(w);
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-cyan-50 pb-16">
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-700 hover:underline">
          <ChevronLeft className="h-4 w-4" /> Ana sayfa
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-3xl font-black tracking-tight sm:text-4xl">
          <Repeat2 className="h-7 w-7 text-cyan-600" /> Tekrar Et
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Aralıklı tekrar sistemi — yanlış yaptığın konuları zamanı geldikçe önerir.
        </p>

        {due && due.length === 0 && (
          <div className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center">
            <div className="text-4xl">🌱</div>
            <div className="mt-2 text-lg font-black text-emerald-800">
              Şu an tekrar edilecek konu yok
            </div>
            <p className="mt-1 text-sm text-emerald-700">
              Bir kategori oyna; yanlışlar burada birikip zamanı gelince gösterilir.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
            >
              Kategorilere dön
            </Link>
          </div>
        )}

        <div className="mt-6 space-y-3">
          {Object.entries(grouped).map(([slug, items]) => {
            const c = CATEGORY_MAP[slug];
            if (!c) return null;
            return (
              <div
                key={slug}
                className="rounded-3xl border border-cyan-100 bg-white/80 p-5 shadow-sm backdrop-blur"
              >
                <div className="flex items-center gap-3">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${c.gradient} text-xl`}>
                    {c.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-black">{c.title}</div>
                    <div className="text-xs text-slate-500">{items.length} konu tekrar bekliyor</div>
                  </div>
                  <Link
                    to="/kategori/$slug"
                    params={{ slug }}
                    className="rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-cyan-700"
                  >
                    Tekrarla →
                  </Link>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {items.map((w) => {
                    const item = c.items.find((i) => i.id === w.itemId);
                    return (
                      <span
                        key={w.itemId}
                        className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700"
                      >
                        {item?.name ?? w.itemId} × {w.count}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
