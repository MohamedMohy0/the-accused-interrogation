import roomBg from "@/assets/room-bg.jpg";
import { DetectivePortrait } from "./DetectivePortrait";
import type { Detective } from "@/lib/game";

export type MenuAction = "cases" | "continue" | "detectives" | "endings" | "howto" | "reset";

export function MainMenu({
  detectives,
  solved,
  total,
  hasProgress,
  onAction,
}: {
  detectives: Detective[];
  solved: number;
  total: number;
  hasProgress: boolean;
  onAction: (a: MenuAction) => void;
}) {
  const items: { id: MenuAction; label: string; hint: string; primary?: boolean; show?: boolean }[] = [
    { id: "cases", label: "تحقيق جديد", hint: "اختر قضية وادخل غرفة الاستجواب", primary: true, show: true },
    { id: "continue", label: "متابعة آخر قضية", hint: "استكمل من حيث توقفت", show: hasProgress },
    { id: "endings", label: "معرض النهايات", hint: "كل النهايات المكتشفة والمقفلة", show: true },
    { id: "detectives", label: "ملفات المحققين", hint: "تعرّف على أساليبهم ومستوى صعوبتهم", show: true },
    { id: "howto", label: "كيف تلعب", hint: "قواعد الشك والتناقضات والنهايات", show: true },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src={roomBg}
        alt=""
        aria-hidden
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 items-center gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="anim-pop">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-card/70 px-3 py-1 text-[11px] font-bold tracking-[0.25em] text-gold backdrop-blur">
            ملفات الجرائم · الموسم الأول
          </div>
          <h1 className="mt-4 text-6xl font-black leading-[1.05] tracking-tight sm:text-8xl">
            الاستجـواب
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-8 text-muted-foreground sm:text-base">
            غرفة واحدة، محقق يحفظ كل كلمة، وسرّ لا يجب أن يخرج منك. كل جواب يُسجَّل، وكل تناقض يُواجَه.
            النهاية تُكتب بأدائك أنت.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded-full bg-secondary px-3 py-1.5">
              القضايا المغلقة: {solved} / {total}
            </span>
            <span className="rounded-full bg-secondary px-3 py-1.5">محققون: {detectives.length}</span>
            <span className="rounded-full bg-secondary px-3 py-1.5">نهايات متشعبة</span>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 lg:hidden">
            {detectives.slice(0, 3).map((d) => (
              <div key={d.detective_id} className="card-soft overflow-hidden">
                <DetectivePortrait id={d.detective_id} showMood={false} className="h-32 w-full rounded-none" />
                <p className="truncate px-2 py-2 text-center text-[11px] font-extrabold">{d.name}</p>
              </div>
            ))}
          </div>

          <nav className="mt-6 flex max-w-md flex-col gap-3">
            {items
              .filter((i) => i.show)
              .map((i) => (
                <button
                  key={i.id}
                  onClick={() => onAction(i.id)}
                  className={`group grid min-h-[64px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl px-5 py-3 text-right transition-all duration-300 hover:translate-x-[-4px] active:scale-[0.99] ${
                    i.primary
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                      : "border border-border bg-card/85 backdrop-blur hover:border-primary/50"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-extrabold">{i.label}</span>
                    <span
                      className={`block truncate text-xs ${i.primary ? "text-primary-foreground/75" : "text-muted-foreground"}`}
                    >
                      {i.hint}
                    </span>
                  </span>
                  <span className="shrink-0 text-2xl opacity-60 transition-transform duration-300 group-hover:-translate-x-1">
                    ←
                  </span>
                </button>
              ))}
            {hasProgress && (
              <button
                onClick={() => onAction("reset")}
                className="self-start px-2 text-xs font-bold text-muted-foreground underline-offset-4 hover:text-danger hover:underline"
              >
                مسح كل التقدّم المحفوظ
              </button>
            )}
          </nav>
        </div>

        <div className="anim-pop relative hidden h-[520px] lg:block">
          {detectives.slice(0, 3).map((d, i) => (
            <div
              key={d.detective_id}
              className="absolute bottom-0 overflow-hidden rounded-[2rem] border border-border/70 shadow-[var(--shadow-card)]"
              style={{
                right: `${i * 108}px`,
                width: "230px",
                height: `${430 - i * 24}px`,
                zIndex: 3 - i,
                opacity: 1 - i * 0.12,
              }}
            >
              <DetectivePortrait id={d.detective_id} showMood={false} className="h-full w-full" />
              {i === 0 && (
                <span className="absolute bottom-3 right-3 rounded-full bg-card/90 px-3 py-1 text-xs font-extrabold backdrop-blur">
                  {d.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
