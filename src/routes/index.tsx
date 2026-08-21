import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import detectivesData from "@/data/detectives.json";
import { cases, loadProgress, type Detective, type Ending, type Progress } from "@/lib/game";
import { DetectivePortrait } from "@/components/DetectivePortrait";
import { MainMenu, type MenuAction } from "@/components/MainMenu";
import { Welcome } from "@/components/Welcome";
import { RoleCard } from "@/components/RoleCard";
import { Interrogation } from "@/components/Interrogation";
import { EndingScreen } from "@/components/EndingScreen";
import { EndingsGallery } from "@/components/EndingsGallery";

const detectives = detectivesData as unknown as Record<string, Detective>;
const detectiveList = Object.values(detectives);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الاستجواب — لعبة تحقيق نصية تفاعلية" },
      {
        name: "description",
        content:
          "لعبة استجواب عربية بأسلوب أنمي: ادخل في دور متهم، أجب على المحقق، تجنّب التناقضات قبل أن يرتفع مؤشر الشك، واجمع كل النهايات في معرض النهايات.",
      },
      { property: "og:title", content: "الاستجواب — لعبة تحقيق نصية تفاعلية" },
      {
        property: "og:description",
        content: "استجواب حيّ بشخصيات أنمي، تناقضات تُكتشف تلقائيًا، ونهايات متعددة تعتمد على أدائك.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Game,
});

type Screen =
  | { kind: "welcome" }
  | { kind: "menu" }
  | { kind: "cases" }
  | { kind: "detectives" }
  | { kind: "endings" }
  | { kind: "howto" }
  | { kind: "role"; caseId: string }
  | { kind: "play"; caseId: string; run: number }
  | {
      kind: "end";
      caseId: string;
      ending: Ending;
      suspicionMax: number;
      contradictions: number;
      secretRevealed: boolean;
    };

function Game() {
  const [screen, setScreen] = useState<Screen>({ kind: "welcome" });
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => setProgress(loadProgress()), [screen.kind]);

  const entries = Object.entries(progress);
  const lastCaseId = entries.sort((a, b) => b[1].at - a[1].at)[0]?.[0];

  function menuAction(a: MenuAction) {
    if (a === "cases") setScreen({ kind: "cases" });
    else if (a === "detectives") setScreen({ kind: "detectives" });
    else if (a === "endings") setScreen({ kind: "endings" });
    else if (a === "howto") setScreen({ kind: "howto" });
    else if (a === "continue" && lastCaseId) setScreen({ kind: "role", caseId: lastCaseId });
    else if (a === "reset") {
      window.localStorage.removeItem("estijwab_progress_v1");
      setProgress({});
    }
  }

  if (screen.kind === "welcome") {
    return <Welcome onEnter={() => setScreen({ kind: "menu" })} />;
  }

  if (screen.kind === "menu") {
    return (
      <MainMenu
        detectives={detectiveList}
        solved={entries.length}
        total={cases.length}
        hasProgress={entries.length > 0}
        onAction={menuAction}
      />
    );
  }

  if (screen.kind === "cases") {
    return (
      <Shell title="ملفات القضايا" subtitle="اختر ملفًا لتدخل غرفة الاستجواب" onBack={() => setScreen({ kind: "menu" })}>
        <div className="flex flex-col gap-4">
          {cases.map((c) => {
            const done = progress[c.case_id];
            const det = detectives[c.detectives[0]!]!;
            return (
              <button
                key={c.case_id}
                onClick={() => setScreen({ kind: "role", caseId: c.case_id })}
                className="card-soft anim-pop grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-4 text-right transition-transform duration-300 hover:scale-[1.01] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <DetectivePortrait id={det.detective_id} showMood={false} className="size-16 shrink-0 rounded-2xl sm:size-20" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gold">قضية رقم {c.case_number} · {det.name}</p>
                  <p className="truncate text-lg font-extrabold">{c.case_title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-6 text-muted-foreground">{c.briefing}</p>
                  <p className="mt-1 text-xs font-bold text-gold">
                    النهايات المكتشفة {done?.endings_found?.length ?? 0} / {c.endings.length}
                    {done ? ` · محاولات ${done.runs ?? 1}` : ""}
                  </p>
                  {done && (
                    <p className="mt-0.5 text-xs font-bold text-safe">
                      أُغلقت · أعلى شك {done.suspicionMax}% · تناقضات {done.contradictions}
                    </p>
                  )}
                </div>
                <span className="col-span-2 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-extrabold text-primary-foreground sm:col-span-1">
                  {done ? "أعد اللعب" : "ابدأ التحقيق"}
                </span>
              </button>
            );
          })}
        </div>
      </Shell>
    );
  }

  if (screen.kind === "endings") {
    return (
      <Shell
        title="معرض النهايات"
        subtitle="كل نهاية اكتشفتها… وكل نهاية ما زالت مقفلة"
        onBack={() => setScreen({ kind: "menu" })}
      >
        <EndingsGallery cases={cases} progress={progress} />
      </Shell>
    );
  }

  if (screen.kind === "detectives") {
    return (
      <Shell title="ملفات المحققين" subtitle="كل محقق يغيّر إيقاع الاستجواب ومقدار الشك" onBack={() => setScreen({ kind: "menu" })}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {detectiveList.map((d) => (
            <div key={d.detective_id} className="card-soft anim-pop overflow-hidden">
              <DetectivePortrait id={d.detective_id} showMood={false} className="h-56 w-full rounded-none" />
              <div className="space-y-2 p-4">
                <p className="text-lg font-extrabold">{d.name}</p>
                <p className="text-xs text-muted-foreground">{d.rank} · {d.personality_tone}</p>
                <p className="text-xs font-bold text-gold">نسب الشك {Math.round(d.suspicion_multiplier * 100)}%</p>
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                  style={{
                    backgroundColor:
                      d.difficulty === "easy"
                        ? "color-mix(in oklab, var(--safe) 20%, transparent)"
                        : d.difficulty === "medium"
                          ? "color-mix(in oklab, var(--warn) 28%, transparent)"
                          : "color-mix(in oklab, var(--danger) 18%, transparent)",
                    color: d.difficulty === "easy" ? "var(--safe)" : d.difficulty === "medium" ? "oklch(0.5 0.1 80)" : "var(--danger)",
                  }}
                >
                  {d.difficulty === "easy" ? "سهل" : d.difficulty === "medium" ? "متوسط" : "صعب"}
                </span>
                <p className="rounded-2xl bg-secondary/70 p-3 text-xs leading-6">
                  «{d.signature_lines["greeting"]}»
                </p>
              </div>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  if (screen.kind === "howto") {
    const rules = [
      ["اقرأ بطاقة دورك", "قبل كل قضية تعرف من أنت، ما سرّك، وما هدفك. المحقق لا يعرف شيئًا من ذلك."],
      ["كل جواب يُسجَّل", "إجاباتك تُخزَّن بوسوم (مكان، وقت، أشخاص). أي تعارض بينها يُكتشف تلقائيًا."],
      ["المواجهة", "عند التناقض يواجهك المحقق مباشرة، يرتفع مؤشر الشك، ويتغيّر تعبير وجهه."],
      ["مؤشر الشك", "أخضر آمن، أصفر حذر، أحمر خطر. الأعلى الذي تصله يؤثر على نهايتك."],
      ["سرّك", "يمكنك كشفه لتخفيف الشك بسرعة… لكن الثمن يظهر في النهاية."],
      ["النهايات", "لا توجد نهاية «صحيحة». مسارك كله يقرر أي نهاية تفتح."],
    ];
    return (
      <Shell title="كيف تلعب" subtitle="ست قواعد تكفي لتخرج من الغرفة" onBack={() => setScreen({ kind: "menu" })}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rules.map(([t, d], i) => (
            <div key={t} className="card-soft anim-pop p-5">
              <span className="text-xs font-black text-gold">0{i + 1}</span>
              <p className="mt-1 text-lg font-extrabold">{t}</p>
              <p className="mt-1 text-sm leading-7 text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Shell>
    );
  }

  const caseFile = cases.find((c) => c.case_id === screen.caseId)!;

  if (screen.kind === "role") {
    return (
      <RoleCard
        caseFile={caseFile}
        detective={detectives[caseFile.detectives[0]!]!}
        onStart={() => setScreen({ kind: "play", caseId: caseFile.case_id, run: Date.now() })}
      />
    );
  }

  if (screen.kind === "play") {
    return (
      <Interrogation
        key={screen.run}
        caseFile={caseFile}
        detectives={detectives}
        onFinish={(r) =>
          setScreen({
            kind: "end",
            caseId: caseFile.case_id,
            ending: r.ending,
            suspicionMax: r.suspicionMax,
            contradictions: r.contradictions,
            secretRevealed: r.secretRevealed,
          })
        }
      />
    );
  }

  return (
    <EndingScreen
      caseFile={caseFile}
      ending={screen.ending}
      suspicionMax={screen.suspicionMax}
      contradictions={screen.contradictions}
      secretRevealed={screen.secretRevealed}
      onReplay={() => setScreen({ kind: "role", caseId: caseFile.case_id })}
      onHome={() => setScreen({ kind: "menu" })}
    />
  );
}

function Shell({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="anim-pop mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black sm:text-4xl">{title}</h1>
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 rounded-2xl border border-border bg-card px-4 py-2.5 text-sm font-bold transition-colors hover:bg-secondary"
        >
          القائمة الرئيسية
        </button>
      </header>
      {children}
    </div>
  );
}
