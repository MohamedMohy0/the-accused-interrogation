import ahmed from "@/assets/det-ahmed.png";
import ahmedSus from "@/assets/det-ahmed-suspicious.png";
import ahmedAngry from "@/assets/det-ahmed-angry.png";
import sara from "@/assets/det-sara.png";
import saraSus from "@/assets/det-sara-suspicious.png";
import saraAngry from "@/assets/det-sara-angry.png";
import omar from "@/assets/det-omar.png";
import omarSus from "@/assets/det-omar-suspicious.png";
import omarAngry from "@/assets/det-omar-angry.png";

export type Expression = "neutral" | "suspicious" | "angry" | "convinced";

const art: Record<string, Record<Expression, string>> = {
  ahmed: { neutral: ahmed, suspicious: ahmedSus, angry: ahmedAngry, convinced: ahmed },
  sara: { neutral: sara, suspicious: saraSus, angry: saraAngry, convinced: sara },
  omar: { neutral: omar, suspicious: omarSus, angry: omarAngry, convinced: omar },
};

const moodStyle: Record<Expression, { filter: string; glow: string; emoji: string; label: string }> = {
  neutral: { filter: "saturate(1) contrast(1)", glow: "transparent", emoji: "", label: "" },
  suspicious: {
    filter: "saturate(0.9) contrast(1.08) hue-rotate(-8deg)",
    glow: "color-mix(in oklab, var(--warn) 55%, transparent)",
    emoji: "؟",
    label: "مرتاب",
  },
  angry: {
    filter: "saturate(1.15) contrast(1.18)",
    glow: "color-mix(in oklab, var(--danger) 60%, transparent)",
    emoji: "!",
    label: "غاضب",
  },
  convinced: {
    filter: "saturate(1.05) brightness(1.05)",
    glow: "color-mix(in oklab, var(--safe) 55%, transparent)",
    emoji: "✓",
    label: "مقتنع",
  },
};

export function DetectivePortrait({
  id,
  expression = "neutral",
  className,
  showMood = true,
}: {
  id: string;
  expression?: Expression;
  className?: string;
  showMood?: boolean;
}) {
  const set = art[id] ?? art["ahmed"]!;
  const src = set[expression] ?? set.neutral;
  const mood = moodStyle[expression];

  return (
    <div className={`relative overflow-hidden rounded-[inherit] ${className ?? ""}`}>
      <img
        key={src}
        src={src}
        alt={`رسمة المحقق ${id}`}
        width={768}
        height={1024}
        loading="lazy"
        className="anim-pop h-full w-full object-cover object-top transition-[filter,transform] duration-500"
        style={{ filter: mood.filter }}
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 60px 6px ${mood.glow}` }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-card to-transparent" />
      {showMood && mood.emoji && (
        <span className="anim-pop absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-card/90 text-base font-extrabold shadow-[var(--shadow-soft)]">
          {mood.emoji}
        </span>
      )}
    </div>
  );
}
