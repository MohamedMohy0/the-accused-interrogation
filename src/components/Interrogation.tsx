import { useMemo, useState } from "react";
import roomBg from "@/assets/room-bg.jpg";
import { DetectivePortrait, type Expression } from "./DetectivePortrait";
import { SuspicionMeter } from "./SuspicionMeter";
import { Typewriter } from "./Typewriter";
import { playSfx } from "@/lib/sound";
import {
  clamp,
  findContradiction,
  resolveEnding,
  saveProgress,
  type CaseFile,
  type Detective,
  type Ending,
  type Option,
} from "@/lib/game";

type Bubble = { who: "detective" | "player"; text: string; kind?: "confront" };

export function Interrogation({
  caseFile,
  detectives,
  onFinish,
}: {
  caseFile: CaseFile;
  detectives: Record<string, Detective>;
  onFinish: (result: { ending: Ending; suspicionMax: number; contradictions: number; secretRevealed: boolean }) => void;
}) {
  const first = caseFile.detectives[0]!;
  const startDet = detectives[first]!;

  const [questionId, setQuestionId] = useState<string>(caseFile.questions[0]!.id);
  const [step, setStep] = useState(1);
  const [suspicion, setSuspicion] = useState(20);
  const [suspicionMax, setSuspicionMax] = useState(20);
  const [tags, setTags] = useState<string[]>([]);
  const [fired, setFired] = useState<string[]>([]);
  const [contradictions, setContradictions] = useState(0);
  const [expression, setExpression] = useState<Expression>("neutral");
  const [shake, setShake] = useState(false);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [say, setSay] = useState<Bubble>({
    who: "detective",
    text: startDet.signature_lines["greeting"] ?? "لنبدأ.",
  });
  const [showQuestion, setShowQuestion] = useState(true);

  const question = caseFile.questions.find((q) => q.id === questionId);
  const detective = detectives[question?.detective ?? first] ?? startDet;
  const secretRevealed = tags.includes("reveal:secret");

  const options = useMemo(
    () => (question?.options ?? []).filter((o) => !o.requires || o.requires.every((t) => tags.includes(t))),
    [question, tags],
  );

  function finish(finalTags: string[], maxSusp: number, contr: number) {
    const ending = resolveEnding(caseFile.endings, {
      suspicionMax: maxSusp,
      contradictions: contr,
      secretRevealed: finalTags.includes("reveal:secret"),
      tags: finalTags,
    });
    saveProgress(caseFile.case_id, {
      ending_id: ending.ending_id,
      suspicionMax: Math.round(maxSusp),
      contradictions: contr,
      secretRevealed: finalTags.includes("reveal:secret"),
      at: Date.now(),
    });
    onFinish({
      ending,
      suspicionMax: Math.round(maxSusp),
      contradictions: contr,
      secretRevealed: finalTags.includes("reveal:secret"),
    });
  }

  function choose(option: Option) {
    if (locked || !question) return;
    setLocked(true);
    setPicked(option.id);
    playSfx("select");
    setShowQuestion(false);

    const newTags = [...tags, ...option.tags];
    const rule = findContradiction(caseFile.contradiction_rules, tags, option.tags, fired);
    const sensitivity = detective.contradiction_sensitivity;
    const hit = rule && Math.random() < Math.min(1, 0.35 + sensitivity * 0.5);

    let delta = option.suspicion * (option.suspicion > 0 ? detective.suspicion_multiplier : 1);
    let contr = contradictions;

    if (rule && hit) {
      delta += rule.suspicion_change * detective.suspicion_multiplier;
      contr += 1;
      setFired((f) => [...f, rule.tag_conflict.join("|")]);
      setContradictions(contr);
      playSfx("confront");
      setShake(true);
      window.setTimeout(() => setShake(false), 600);
    }

    const next = clamp(suspicion + delta);
    if (delta > 6) window.setTimeout(() => playSfx("suspicion"), 240);
    const nextMax = Math.max(suspicionMax, next);
    setSuspicion(next);
    setSuspicionMax(nextMax);
    setTags(newTags);
    setExpression(
      rule && hit ? (next > 65 ? "angry" : "suspicious") : delta < 0 ? "convinced" : next > 70 ? "suspicious" : "neutral",
    );

    setSay({ who: "player", text: option.text });

    window.setTimeout(() => {
      if (rule && hit) {
        setSay({ who: "detective", text: rule.confrontation_line, kind: "confront" });
      } else if (option.reply) {
        setSay({ who: "detective", text: option.reply });
      }
    }, 700);

    window.setTimeout(
      () => {
        const target = option.next;
        if (!target || target === "END") {
          finish(newTags, nextMax, contr);
          return;
        }
        const exists = caseFile.questions.some((q) => q.id === target);
        if (!exists) {
          finish(newTags, nextMax, contr);
          return;
        }
        setQuestionId(target);
        setStep((s) => s + 1);
        setPicked(null);
        setShowQuestion(true);
        setLocked(false);
      },
      rule && hit ? 2800 : 1700,
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* الخلفية: غرفة الاستجواب */}
      <img
        src={roomBg}
        alt=""
        aria-hidden
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full scale-105 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/55 to-background/95" />

      <div className="relative z-10">
        <SuspicionMeter value={suspicion} flash={shake} />
      </div>

      {/* شريط الحالة */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-wrap items-center gap-2 px-4 pt-3 text-[11px] font-bold">
        <span className="rounded-full bg-card/85 px-3 py-1.5 backdrop-blur">
          جولة {step} · {caseFile.case_title}
        </span>
        {contradictions > 0 && (
          <span className="rounded-full bg-danger/12 px-3 py-1.5 text-danger backdrop-blur">
            تناقضات: {contradictions}
          </span>
        )}
        {secretRevealed && (
          <span className="rounded-full bg-gold/20 px-3 py-1.5 text-gold backdrop-blur">سرّك انكشف</span>
        )}
      </div>

      {/* المسرح: المحقق أمامك */}
      <div className="relative z-10 flex flex-1 items-end justify-center px-4">
        <div className="pointer-events-none relative flex h-[34vh] w-full max-w-md items-end justify-center sm:h-[42vh]">
          <div className="absolute bottom-2 h-8 w-3/5 rounded-[100%] bg-foreground/15 blur-xl" />
          <DetectivePortrait
            id={detective.detective_id}
            expression={expression}
            className={`h-full w-auto max-w-full rounded-[2rem] transition-transform duration-500 ${
              shake ? "anim-shake" : ""
            }`}
          />
        </div>
      </div>

      {/* صندوق المحادثة */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-4">
        <div
          className={`card-soft relative bg-card/95 px-4 pb-4 pt-5 backdrop-blur-md ${
            say.kind === "confront" ? "border-danger/50" : ""
          } ${say.kind === "confront" && shake ? "anim-shake" : ""}`}
        >
          <span
            className={`absolute -top-3 right-4 rounded-full px-3 py-1 text-xs font-extrabold shadow-[var(--shadow-soft)] ${
              say.who === "detective" ? "bg-primary text-primary-foreground" : "bg-gold text-background"
            }`}
          >
            {say.who === "detective" ? `${detective.rank} ${detective.name}` : "أنت"}
          </span>

          <p
            className={`min-h-[56px] text-sm leading-8 sm:text-base ${
              say.kind === "confront" ? "font-bold text-danger" : ""
            }`}
          >
            {say.text}
          </p>

          {question && showQuestion && (
            <p key={question.id} className="anim-pop mt-3 border-t border-border/70 pt-3 text-base font-extrabold leading-8 sm:text-lg">
              <Typewriter text={question.text} />
            </p>
          )}

          {/* الاختيارات */}
          <div className="mt-4 flex flex-col gap-2">
            {options.map((o) => (
              <button
                key={o.id}
                disabled={locked}
                onClick={() => choose(o)}
                className={`min-h-[52px] rounded-2xl border border-border bg-secondary/60 px-4 py-3 text-right text-sm leading-7 transition-all duration-300 hover:border-primary/60 hover:bg-primary/8 active:scale-[0.99] ${
                  picked === o.id ? "scale-[1.01] border-primary bg-primary/12 font-bold" : ""
                } ${locked && picked !== o.id ? "pointer-events-none opacity-25" : ""}`}
              >
                {o.text}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
