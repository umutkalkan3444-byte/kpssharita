import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, Brain, LoaderCircle, RotateCcw, Sparkles } from "lucide-react";

import { STUDY_CONTENT_VERSION } from "@/data/study/version";
import { buildStaticReview } from "@/lib/study/build-static-review";
import {
  getStudyReviewCacheKey,
  readStudyReviewCache,
  writeStudyReviewCache,
} from "@/lib/study/cache";
import { getStudyReview } from "@/lib/study/review-function";
import {
  normalizeStudyReviewRequest,
  type ReviewReason,
  type StudyReviewRequest,
  type StudyReviewResponse,
  StudyReviewRequestSchema,
  StudyReviewResponseSchema,
} from "@/lib/study/schemas";

export type PostGameStudyProps = {
  result: StudyReviewRequest;
  onReplay?: () => void;
  onExit?: () => void;
};

const REASON_LABELS: Record<ReviewReason, string> = {
  repeated_error: "Tekrarlanan karışıklık",
  exam_high_yield: "Sınavda ayırt edici bilgi",
  prerequisite: "Önce oturtulacak temel",
};

export function PostGameStudy({ result, onReplay, onExit }: PostGameStudyProps) {
  const requestJson = JSON.stringify(result);
  const request = useMemo(() => {
    const parsed = StudyReviewRequestSchema.safeParse(JSON.parse(requestJson));
    return parsed.success ? normalizeStudyReviewRequest(parsed.data) : null;
  }, [requestJson]);
  const cacheKey = useMemo(
    () => (request ? getStudyReviewCacheKey(request) : "invalid"),
    [request],
  );
  const fallback = useMemo<StudyReviewResponse | null>(
    () =>
      request
        ? {
            source: "static",
            contentVersion: STUDY_CONTENT_VERSION,
            review: buildStaticReview(request),
          }
        : null,
    [request],
  );
  const [response, setResponse] = useState<StudyReviewResponse | null>(fallback);
  const [loading, setLoading] = useState(false);
  const requestReview = useServerFn(getStudyReview);

  useEffect(() => {
    if (!request || !fallback) {
      setResponse(null);
      setLoading(false);
      return;
    }

    const cached = readStudyReviewCache(request);
    setResponse(cached ?? fallback);
    const hasMistake = request.wrongAttempts.length > 0;
    if (cached || !hasMistake) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    requestReview({ data: request })
      .then((value) => {
        if (!active) return;
        const parsed = StudyReviewResponseSchema.safeParse(value);
        if (!parsed.success) return;
        setResponse(parsed.data);
        writeStudyReviewCache(request, parsed.data);
      })
      .catch(() => {
        // The verified static review is already visible.
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [cacheKey, fallback, request, requestReview]);

  if (!request || !response) {
    return (
      <section className="mx-auto w-full max-w-3xl rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-xl">
        <Brain className="mx-auto h-9 w-9 text-rose-500" />
        <h2 className="mt-3 text-lg font-black text-slate-900">Çalışma sonucu doğrulanamadı</h2>
        <p className="mt-1 text-sm text-slate-600">
          Oyun sonucu kapalı kategori ve hedef kimlikleriyle yeniden gönderilmelidir.
        </p>
      </section>
    );
  }

  const { review } = response;
  const personalized = response.source === "ai" || response.source === "cache";

  return (
    <section className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-cyan-100 bg-white/95 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <header className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 px-5 py-5 text-white sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              <BookOpen className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                Oyun sonu · kişisel konu anlatımı
              </p>
              <h2 className="truncate text-lg font-black sm:text-xl">{review.title}</h2>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold">
            {loading ? (
              <>
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                Kişiselleştiriliyor
              </>
            ) : personalized ? (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Yapay zekâ ile kişisel
              </>
            ) : (
              <>
                <Brain className="h-3.5 w-3.5" />
                Hazır çalışma
              </>
            )}
          </span>
        </div>
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-cyan-800">
            <Sparkles className="h-4 w-4" />
            Sınav için temel bağlantılar
          </h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {review.essentials.map((fact) => (
              <article
                key={fact.id}
                className="rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4"
              >
                <p className="text-sm font-bold leading-relaxed text-slate-800">{fact.text}</p>
                {fact.memoryHook && (
                  <p className="mt-2 text-xs font-semibold leading-relaxed text-cyan-800">
                    Hatırla: {fact.memoryHook}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        {review.focus.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-rose-700">
              <Brain className="h-4 w-4" />
              Yanlışlarına odaklı tekrar
            </h3>
            <div className="mt-3 space-y-3">
              {review.focus.map((focus, index) => (
                <article
                  key={focus.mistakeId}
                  className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-xs font-black text-rose-700">
                        {index + 1}
                      </span>
                      <h4 className="font-black text-slate-900">{focus.label}</h4>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {REASON_LABELS[focus.reason]}
                      {focus.count > 1 ? ` · ${focus.count} kez` : ""}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {focus.facts.map((fact) => (
                      <div key={fact.id} className="rounded-xl bg-rose-50/60 px-3 py-2.5">
                        <p className="text-xs font-semibold leading-relaxed text-slate-700">
                          {fact.text}
                        </p>
                        {fact.memoryHook && (
                          <p className="mt-1 text-[11px] font-bold text-rose-700">
                            İpucu: {fact.memoryHook}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {review.remainingMistakes.length > 0 && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <p className="text-xs font-black uppercase tracking-wide text-amber-800">
              Sonraki turda ayrıca bak
            </p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">
              {review.remainingMistakes.join(" · ")}
            </p>
          </div>
        )}

        <p className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-bold leading-relaxed text-white">
          {review.closing}
        </p>

        {(onReplay || onExit) && (
          <div className="flex flex-col gap-2 sm:flex-row">
            {onReplay && (
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-700"
              >
                <RotateCcw className="h-4 w-4" />
                Tekrar oyna
              </button>
            )}
            {onExit && (
              <button
                type="button"
                onClick={onExit}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Önceki ekrana dön
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
