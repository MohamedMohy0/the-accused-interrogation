import { useEffect, useMemo, useRef, useState } from "react";
import { playSfx } from "@/lib/sound";
import { loadSeenEndings, saveSeenEndings, type CaseFile, type Progress } from "@/lib/game";

export function EndingsGallery({ cases, progress }: { cases: CaseFile[]; progress: Progress }) {
  const total = cases.reduce((n, c) => n + c.endings.length, 0);
  const found = cases.reduce(
    (n, c) => n + (progress[c.case_id]?.endings_found?.length ?? 0),
    0,
  );

  const foundKey = useMemo(
    () => cases.flatMap((c) => progress[c.case_id]?.endings_found ?? []).join(","),
    [cases, progress],
  );

  /** النهايات التي فُتحت ولم يشاهدها اللاعب في المعرض بعد */
  const [fresh, setFresh] = useState<string[]>([]);
  const [openCase, setOpenCase] = useState<string | null>(cases[0]?.case_id ?? null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current || !foundKey) return;
    handled.current = true;

    const seen = loadSeenEndings();
    const news = foundKey.split(",").filter((id) => id && !seen.includes(id));
    if (news.length === 0) return;
    setFresh(news);
    saveSeenEndings([...seen, ...news]);

    news.forEach((_id, i) =>
      window.setTimeout(() => {
        try {
          playSfx("unlock");
        } catch {
          /* تجاهل */
        }
      }, 320 + i * 620),
    );
  }, [foundKey]);

  return (
    <div className="flex flex-col gap-6">
      <div className="card-soft anim-pop flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="text-xs font-bold text-gold">اكتمال المعرض</p>
          <p className="text-2xl font-black">
            {found} / {total} نهاية
          </p>
        </div>
        <div className="h-3 w-full max-w-xs overflow-hidden rounded-full bg-secondary sm:w-64">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700"
            style={{ width: `${total ? (found / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {cases.map((c) => {
        const done = progress[c.case_id]?.endings_found ?? [];
        const open = openCase === c.case_id;
        return (
          <section key={c.case_id} className="anim-pop card-soft overflow-hidden p-0">
            <button
              onClick={() => setOpenCase(open ? null : c.case_id)}
              aria-expanded={open}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4 text-right transition-colors hover:bg-secondary/50"
            >
              <span className="min-w-0">
                <span className="block truncate text-lg font-extrabold">
                  قضية {c.case_number} · {c.case_title}
                </span>
                <span className="text-xs font-bold text-gold">
                  {done.length} / {c.endings.length} نهاية مكتشفة
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full bg-secondary px-3 py-1.5 text-xs font-black transition-transform duration-300 ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>

            {open && (
            <div className="grid grid-cols-1 gap-3 p-4 pt-0 sm:grid-cols-2">
              {c.endings.map((e, i) => {
                const unlocked = done.includes(e.ending_id);
                const isNew = unlocked && fresh.includes(e.ending_id);
                const delay = isNew ? fresh.indexOf(e.ending_id) * 620 + 320 : 0;
                return (
                  <article
                    key={e.ending_id}
                    style={isNew ? { animationDelay: `${delay}ms` } : undefined}
                    className={`card-soft relative overflow-hidden p-4 transition-colors ${
                      unlocked ? "" : "border-dashed opacity-70"
                    } ${isNew ? "anim-unlock border-gold/70" : ""}`}
                  >
                    {isNew && (
                      <>
                        <span className="anim-sheen pointer-events-none absolute inset-0" />
                      </>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-xs font-black text-gold">
                        نهاية 0{i + 1}
                        {isNew && (
                          <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-black text-background">
                            جديدة
                          </span>
                        )}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                          unlocked ? "bg-safe/15 text-safe" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {unlocked ? e.stamp : "مقفلة"}
                      </span>
                    </div>
                    <p className="mt-1 text-lg font-extrabold">
                      {unlocked ? e.title : "؟؟؟"}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {unlocked
                        ? e.text
                        : "لم تصل إلى هذه النهاية بعد. جرّب مسارًا مختلفًا في الاستجواب."}
                    </p>
                  </article>
                );
              })}
            </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
