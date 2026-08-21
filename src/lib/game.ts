export type Detective = {
  detective_id: string;
  name: string;
  difficulty: "easy" | "medium" | "hard";
  rank: string;
  personality_tone: string;
  contradiction_sensitivity: number;
  suspicion_multiplier: number;
  signature_lines: Record<string, string>;
};

export type Option = {
  id: string;
  text: string;
  tags: string[];
  suspicion: number;
  reply?: string;
  requires?: string[];
  /** معرّف السؤال التالي؛ "END" أو غياب القيمة يعني نهاية المسار */
  next?: string;
};

export type Question = {
  id: string;
  detective?: string;
  text: string;
  options: Option[];
};

export type ContradictionRule = {
  tag_conflict: string[];
  confrontation_line: string;
  suspicion_change: number;
};

export type Ending = {
  ending_id: string;
  title: string;
  stamp: string;
  text: string;
  condition: {
    suspicion_max?: number;
    contradictions_max?: number;
    secret_revealed?: boolean;
    required_tags?: string[];
  };
};

export type CaseFile = {
  case_id: string;
  case_number: number;
  case_title: string;
  fixed_role: string;
  detectives: string[];
  briefing: string;
  role_card: {
    role_name: string;
    secret_truth: string;
    objective: string;
    known_facts: string[];
  };
  questions: Question[];
  contradiction_rules: ContradictionRule[];
  endings: Ending[];
};

const caseModules = import.meta.glob<CaseFile>("../data/cases/*.json", {
  eager: true,
  import: "default",
});

export const cases: CaseFile[] = Object.values(caseModules).sort(
  (a, b) => a.case_number - b.case_number,
);

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

export function findContradiction(
  rules: ContradictionRule[],
  previousTags: string[],
  newTags: string[],
  firedRules: string[],
): ContradictionRule | null {
  for (const rule of rules) {
    const key = rule.tag_conflict.join("|");
    if (firedRules.includes(key)) continue;
    const hitsNew = rule.tag_conflict.some((t) => newTags.includes(t));
    const allPresent = rule.tag_conflict.every(
      (t) => newTags.includes(t) || previousTags.includes(t),
    );
    if (hitsNew && allPresent) return rule;
  }
  return null;
}

export function resolveEnding(
  endings: Ending[],
  state: { suspicionMax: number; contradictions: number; secretRevealed: boolean; tags: string[] },
): Ending {
  const match = endings.find((e) => {
    const c = e.condition;
    if (c.suspicion_max !== undefined && state.suspicionMax > c.suspicion_max) return false;
    if (c.contradictions_max !== undefined && state.contradictions > c.contradictions_max) return false;
    if (c.secret_revealed !== undefined && c.secret_revealed !== state.secretRevealed) return false;
    if (c.required_tags && !c.required_tags.every((t) => state.tags.includes(t))) return false;
    return true;
  });
  return match ?? endings[endings.length - 1]!;
}

const STORAGE_KEY = "estijwab_progress_v1";

export type CaseProgress = {
  ending_id: string;
  suspicionMax: number;
  contradictions: number;
  secretRevealed: boolean;
  at: number;
  /** كل النهايات التي اكتشفها اللاعب في هذه القضية */
  endings_found?: string[];
  runs?: number;
};

export type Progress = Record<string, CaseProgress>;

export function loadProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Progress;
  } catch {
    return {};
  }
}

export function saveProgress(caseId: string, entry: Omit<CaseProgress, "endings_found" | "runs">) {
  if (typeof window === "undefined") return;
  const all = loadProgress();
  const prev = all[caseId];
  const found = new Set(prev?.endings_found ?? []);
  found.add(entry.ending_id);
  all[caseId] = { ...entry, endings_found: [...found], runs: (prev?.runs ?? 0) + 1 };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

const SEEN_ENDINGS_KEY = "estijwab_seen_endings_v1";

/** النهايات التي شاهدها اللاعب داخل معرض النهايات (لتشغيل أنيميشن الفتح مرة واحدة) */
export function loadSeenEndings(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(SEEN_ENDINGS_KEY) ?? "[]") as unknown;
    return Array.isArray(raw) ? (raw as string[]) : [];
  } catch {
    return [];
  }
}

export function saveSeenEndings(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SEEN_ENDINGS_KEY, JSON.stringify([...new Set(ids)]));
  } catch {
    /* تجاهل */
  }
}
