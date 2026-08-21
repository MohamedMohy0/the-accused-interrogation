import { useEffect } from "react";
import { playSfx } from "@/lib/sound";
import { loadProgress, type CaseFile, type Ending } from "@/lib/game";

export function EndingScreen({
  caseFile,
  ending,
  suspicionMax,
  contradictions,
  secretRevealed,
  onReplay,
  onHome,
}: {
  caseFile: CaseFile;
  ending: Ending;
  suspicionMax: number;
  contradictions: number;
  secretRevealed: boolean;
  onReplay: () => void;
  onHome: () => void;
}) {
  useEffect(() => playSfx("stamp"), []);

  const found = loadProgress()[caseFile.case_id]?.endings_found?.length ?? 1;
  const stats = [
    { label: "أعلى نسبة شك", value: `${suspicionMax}%` },
    { label: "عدد التناقضات", value: `${contradictions}` },
    { label: "سرّك", value: secretRevealed ? "انكشف" : "بقي آمنًا" },
    { label: "النهايات المكتشفة", value: `${found} / ${caseFile.endings.length}` },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="card-soft relative overflow-hidden px-6 py-10">
        <div className="anim-stamp pointer-events-none absolute -top-2 left-4 rounded-xl border-4 border-danger/70 px-4 py-2 text-lg font-extrabold text-danger/80 opacity-90 sm:text-2xl">
          {ending.stamp}
        </div>

        <p className="text-xs font-bold text-primary">
          نهاية القضية {caseFile.case_number} · {caseFile.case_title}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{ending.title}</h1>
        <p className="mt-4 text-base leading-9 text-foreground/90">{ending.text}</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-secondary/70 px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-lg font-extrabold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onReplay}
            className="min-h-[52px] flex-1 rounded-2xl bg-primary px-6 font-extrabold text-primary-foreground transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            أعد الاستجواب بمسار مختلف
          </button>
          <button
            onClick={onHome}
            className="min-h-[52px] flex-1 rounded-2xl border border-border bg-card px-6 font-bold transition-colors hover:bg-secondary"
          >
            العودة لقائمة القضايا
          </button>
        </div>
      </div>
    </div>
  );
}
