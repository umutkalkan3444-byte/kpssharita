import { BookOpenCheck, CircleCheckBig, Lightbulb } from "lucide-react";

import { getTopicEssential } from "@/data/topic-essentials";

export function TopicEssentials({
  categorySlug,
  className = "",
  hideInLandscape = true,
}: {
  categorySlug: string;
  className?: string;
  hideInLandscape?: boolean;
}) {
  const content = getTopicEssential(categorySlug);

  // `validate:content` tüm gerçek kategori slug'ları için kayıt bulunmasını
  // zorunlu tutar. Bu koruma, geliştirme sırasında henüz tamamlanmamış yeni bir
  // kategori yüzünden oyun ekranının bütünüyle bozulmasını engeller.
  if (!content) return null;

  return (
    <section
      aria-labelledby={`topic-essentials-${categorySlug}`}
      className={`mt-4 overflow-hidden rounded-3xl border border-cyan-200/80 bg-white/90 shadow-xl shadow-cyan-500/10 ${hideInLandscape ? "max-lg:landscape:hidden" : ""} ${className}`}
    >
      <div className="border-b border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-emerald-50 px-4 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 text-white shadow-lg shadow-cyan-500/20">
            <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={`topic-essentials-${categorySlug}`}
                className="text-base font-black tracking-tight text-slate-900 sm:text-lg"
              >
                Bu konuda bilmen gerekenler
              </h2>
              <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-cyan-700 ring-1 ring-inset ring-cyan-200">
                {content.priority}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">
              {content.definition}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4 sm:px-6 sm:py-5">
        <ul className="grid gap-2.5 text-sm leading-relaxed text-slate-700 sm:grid-cols-2">
          {content.keyPoints.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <CircleCheckBig
                className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                aria-hidden="true"
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200/80 bg-amber-50/80 px-3.5 py-3 text-sm leading-relaxed text-amber-950">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            <span className="font-black">ÖSYM ipucu: </span>
            {content.examTip}
          </p>
        </div>

        <p className="text-right text-[10px] font-semibold text-slate-400">
          5 Ağustos 2026 tarihinde sınav odağıyla gözden geçirildi.
        </p>
      </div>
    </section>
  );
}
