import { DetectivePortrait } from "./DetectivePortrait";
import type { CaseFile, Detective } from "@/lib/game";

export function RoleCard({
  caseFile,
  detective,
  onStart,
}: {
  caseFile: CaseFile;
  detective: Detective;
  onStart: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <div className="anim-flip card-soft overflow-hidden">
        <div className="flex items-center justify-between gap-4 bg-primary/8 px-6 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold tracking-wide text-primary">
              ملف القضية رقم {caseFile.case_number}
            </p>
            <h1 className="truncate text-xl font-extrabold text-foreground sm:text-2xl">
              {caseFile.case_title}
            </h1>
          </div>
          <span className="shrink-0 rounded-full border border-danger/40 px-3 py-1 text-xs font-bold text-danger">
            سرّي
          </span>
        </div>

        <div className="space-y-6 px-6 py-6">
          <p className="rounded-2xl bg-muted/70 p-4 text-sm leading-7 text-muted-foreground">
            {caseFile.briefing}
          </p>

          <section>
            <h2 className="mb-2 text-sm font-bold text-primary">دورك في هذه القضية</h2>
            <p className="text-lg font-extrabold leading-8">{caseFile.role_card.role_name}</p>
          </section>

          <section className="rounded-2xl border border-accent/60 bg-accent/25 p-4">
            <h2 className="mb-1 text-sm font-bold text-accent-foreground">سرّك (لا يعرفه المحقق)</h2>
            <p className="text-sm leading-7">{caseFile.role_card.secret_truth}</p>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-primary">حقائق تعرفها أنت فقط</h2>
            <ul className="space-y-2">
              {caseFile.role_card.known_facts.map((f) => (
                <li key={f} className="flex gap-2 text-sm leading-7">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-bold text-primary">هدفك</h2>
            <p className="text-sm leading-7">{caseFile.role_card.objective}</p>
          </section>

          <section className="flex items-center gap-4 rounded-2xl bg-secondary/70 p-4">
            <DetectivePortrait id={detective.detective_id} showMood={false} className="size-16 shrink-0 rounded-2xl" />
            <div className="min-w-0">
              <p className="font-extrabold">{detective.name}</p>
              <p className="text-xs text-muted-foreground">
                {detective.rank} · {detective.personality_tone} ·{" "}
                {detective.difficulty === "easy" ? "صعوبة سهلة" : detective.difficulty === "medium" ? "صعوبة متوسطة" : "صعوبة عالية"}
              </p>
            </div>
          </section>

          <button
            onClick={onStart}
            className="w-full rounded-2xl bg-primary px-6 py-4 text-base font-extrabold text-primary-foreground shadow-[var(--shadow-soft)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            ابدأ الاستجواب
          </button>
        </div>
      </div>
    </div>
  );
}
