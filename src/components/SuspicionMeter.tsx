type Props = { value: number; flash?: boolean };

export function SuspicionMeter({ value, flash }: Props) {
  const color = value < 35 ? "var(--safe)" : value < 70 ? "var(--warn)" : "var(--danger)";
  const label = value < 35 ? "آمن" : value < 70 ? "حذر" : "خطر";

  return (
    <div className="sticky top-0 z-30 w-full border-b border-border/60 bg-card/85 px-4 py-2 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <span className="shrink-0 text-xs font-bold text-muted-foreground sm:text-sm">مؤشر الشك</span>
        <div
          className={`relative h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary sm:h-3 ${flash ? "anim-ring" : ""}`}
          style={{ ["--danger" as string]: "var(--danger)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${value}%`, backgroundColor: color }}
          />
        </div>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums"
          style={{ backgroundColor: `color-mix(in oklab, ${color} 22%, transparent)`, color }}
        >
          {Math.round(value)}% · {label}
        </span>
      </div>
    </div>
  );
}
