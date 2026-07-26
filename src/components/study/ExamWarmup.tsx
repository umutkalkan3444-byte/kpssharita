import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Brain, Check, X } from "lucide-react";

import { getWarmupQuestions } from "@/lib/study/select-warmup";
import { type WarmupCompletion, WarmupCompletionSchema } from "@/lib/study/schemas";
import { cn } from "@/lib/utils";

export type ExamWarmupProps = {
  categorySlug: string;
  categoryTitle: string;
  seed?: string;
  weakFactIds?: readonly string[];
  previousWrongQuestionIds?: readonly string[];
  onComplete: (result: WarmupCompletion) => void;
  onBack?: () => void;
};

export function ExamWarmup({
  categorySlug,
  categoryTitle,
  seed,
  weakFactIds = [],
  previousWrongQuestionIds = [],
  onComplete,
  onBack,
}: ExamWarmupProps) {
  const weakKey = weakFactIds.slice().sort().join("|");
  const wrongKey = previousWrongQuestionIds.slice().sort().join("|");
  const stableWeakFactIds = useMemo(() => (weakKey ? weakKey.split("|") : []), [weakKey]);
  const stableWrongQuestionIds = useMemo(() => (wrongKey ? wrongKey.split("|") : []), [wrongKey]);
  const questions = useMemo(
    () =>
      getWarmupQuestions(categorySlug, {
        seed: seed ?? categorySlug,
        weakFactIds: stableWeakFactIds,
        previousWrongQuestionIds: stableWrongQuestionIds,
      }),
    [categorySlug, seed, stableWeakFactIds, stableWrongQuestionIds],
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>([]);

  useEffect(() => {
    setQuestionIndex(0);
    setSelectedIndex(null);
    setWrongQuestionIds([]);
  }, [categorySlug, seed, weakKey, wrongKey]);

  if (questions.length !== 3) {
    return (
      <section className="mx-auto w-full max-w-2xl rounded-3xl border border-amber-200 bg-white/95 p-6 text-center shadow-xl">
        <Brain className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-3 text-xl font-black text-slate-900">Isınma soruları hazırlanamadı</h2>
        <p className="mt-2 text-sm text-slate-600">
          Bu kategori için üç doğrulanmış soru bulunamadı. Harita verisi tamamlandığında aşama
          otomatik olarak açılacak.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri dön
          </button>
        )}
      </section>
    );
  }

  const question = questions[questionIndex];
  const answered = selectedIndex !== null;
  const selectedCorrect = selectedIndex === question.correctIndex;

  const choose = (choiceIndex: number) => {
    if (answered) return;
    setSelectedIndex(choiceIndex);
    if (choiceIndex !== question.correctIndex) {
      setWrongQuestionIds((current) =>
        current.includes(question.id) ? current : [...current, question.id],
      );
    }
  };

  const next = () => {
    if (!answered) return;
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((current) => current + 1);
      setSelectedIndex(null);
      return;
    }

    onComplete(
      WarmupCompletionSchema.parse({
        questionIds: questions.map((item) => item.id),
        wrongQuestionIds,
        correctCount: 3 - wrongQuestionIds.length,
      }),
    );
  };

  return (
    <section className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-cyan-100 bg-white/95 shadow-2xl shadow-cyan-500/10 backdrop-blur">
      <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-4 text-white sm:px-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15">
              <Brain className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                1. aşama · sınav ısınması
              </p>
              <h1 className="truncate text-lg font-black sm:text-xl">{categoryTitle}</h1>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-black">
            {questionIndex + 1}/3
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {questions.map((item, index) => (
            <span
              key={item.id}
              className={cn(
                "h-1.5 rounded-full transition",
                index <= questionIndex ? "bg-white" : "bg-white/25",
              )}
            />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <p className="text-base font-black leading-relaxed text-slate-900 sm:text-lg">
          {question.prompt}
        </p>

        {question.statements && (
          <ol className="mt-4 space-y-2 rounded-2xl bg-cyan-50/70 p-4 text-sm font-semibold text-slate-700">
            {question.statements.map((statement, index) => (
              <li key={statement} className="flex gap-2">
                <span className="w-6 shrink-0 font-black text-cyan-700">
                  {["I.", "II.", "III."][index]}
                </span>
                <span>{statement}</span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {question.choices.map((choice, index) => {
            const isCorrect = index === question.correctIndex;
            const isSelected = index === selectedIndex;
            return (
              <button
                key={`${question.id}:${choice}`}
                type="button"
                disabled={answered}
                onClick={() => choose(index)}
                className={cn(
                  "flex min-h-14 items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-bold transition",
                  !answered &&
                    "border-cyan-100 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md",
                  answered && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                  answered &&
                    isSelected &&
                    !isCorrect &&
                    "border-rose-400 bg-rose-50 text-rose-800",
                  answered &&
                    !isCorrect &&
                    !isSelected &&
                    "border-slate-100 bg-slate-50 text-slate-400",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-50 text-xs font-black text-cyan-700",
                    answered && isCorrect && "bg-emerald-500 text-white",
                    answered && isSelected && !isCorrect && "bg-rose-500 text-white",
                  )}
                >
                  {answered && isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : answered && isSelected ? (
                    <X className="h-4 w-4" />
                  ) : (
                    ["A", "B", "C", "D"][index]
                  )}
                </span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div
            aria-live="polite"
            className={cn(
              "mt-5 rounded-2xl border p-4",
              selectedCorrect ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50",
            )}
          >
            <p
              className={cn(
                "text-sm font-black",
                selectedCorrect ? "text-emerald-800" : "text-amber-900",
              )}
            >
              {selectedCorrect ? "Doğru bağlantı!" : "Bu bilgiyi çalışma özetine ekledik."}
            </p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-700">
              {question.explanation}
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            disabled={!answered}
            onClick={next}
            className="inline-flex min-w-36 items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-black text-white shadow-lg transition enabled:hover:-translate-y-0.5 enabled:hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {questionIndex === 2 ? "Haritaya geç" : "Sonraki soru"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
