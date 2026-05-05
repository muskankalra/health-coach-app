"use client";

import { useState } from "react";
import { UserProfile, MealType, DayMealEntry, DayAnalysis, DayLog, CycleInfo } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/constants";
import { saveDayLog } from "@/lib/storage";
import { getPhaseContext } from "@/lib/cycle";
import DayFeedbackCard from "./DayFeedbackCard";

interface MealLoggerProps {
  profile: UserProfile;
  cycleInfo?: CycleInfo | null;
  onDayLogged: (day: DayLog) => void;
}

type State = "idle" | "logging" | "analyzing" | "result";

const MEAL_TYPES: { key: MealType; emoji: string }[] = [
  { key: "breakfast", emoji: "☀️" },
  { key: "lunch", emoji: "🌤️" },
  { key: "dinner", emoji: "🌙" },
  { key: "snack", emoji: "⚡" },
];

export default function MealLogger({ profile, cycleInfo, onDayLogged }: MealLoggerProps) {
  const [state, setState] = useState<State>("idle");
  const [entries, setEntries] = useState<Partial<Record<MealType, string>>>({});
  const [result, setResult] = useState<DayLog | null>(null);
  const [error, setError] = useState("");

  const filledEntries = MEAL_TYPES.filter(m => entries[m.key]?.trim());
  const hasAny = filledEntries.length > 0;

  async function analyze() {
    if (!hasAny) { setError("Add at least one meal to analyse"); return; }
    setError("");
    setState("analyzing");

    const meals: DayMealEntry[] = filledEntries.map(m => ({
      mealType: m.key,
      mealText: entries[m.key]!.trim(),
    }));

    try {
      const res = await fetch("/api/analyze-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          meals,
          cycleContext: cycleInfo ? getPhaseContext(cycleInfo) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Analysis failed");

      const day: DayLog = {
        id: Date.now().toString(),
        meals,
        analysis: data as DayAnalysis,
        timestamp: Date.now(),
      };
      saveDayLog(day);
      setResult(day);
      onDayLogged(day);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("logging");
    }
  }

  function reset() {
    setState("idle");
    setEntries({});
    setResult(null);
    setError("");
  }

  if (state === "idle") {
    return (
      <button onClick={() => setState("logging")} className="w-full btn-neon rounded-2xl px-5 py-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-base">Log today&apos;s meals</p>
            <p className="text-white/50 text-sm mt-0.5">Add all meals → analyse your full day</p>
          </div>
          <span className="text-3xl">🍽️</span>
        </div>
      </button>
    );
  }

  if (state === "analyzing") {
    return (
      <div className="glass rounded-2xl px-5 py-10 text-center">
        <div className="text-4xl mb-3" style={{ animation: "pulse 1.5s infinite" }}>✨</div>
        <p className="font-semibold text-white">Analysing your day...</p>
        <p className="text-sm text-white/40 mt-1">Looking at all your meals together</p>
      </div>
    );
  }

  if (state === "result" && result) {
    return (
      <div className="space-y-3">
        <DayFeedbackCard day={result} />
        <button onClick={reset} className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-sm hover:border-white/20 transition-all">
          Log another day
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-white/6 flex items-center justify-between">
        <p className="font-semibold text-white text-sm">What did you eat today?</p>
        <button onClick={reset} className="text-white/30 hover:text-white/60 text-2xl leading-none">×</button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {MEAL_TYPES.map(({ key, emoji }) => (
          <div key={key}>
            <label className="flex items-center gap-2 text-xs font-medium text-white/35 uppercase tracking-wider mb-1.5">
              <span>{emoji}</span>
              <span>{MEAL_TYPE_LABELS[key]}</span>
              <span className="text-white/20 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              placeholder={PLACEHOLDERS[key]}
              value={entries[key] ?? ""}
              onChange={e => setEntries(prev => ({ ...prev, [key]: e.target.value }))}
              rows={2}
              className="w-full px-4 py-3 rounded-xl text-white placeholder-white/20 text-sm resize-none focus:outline-none transition-all"
              style={{
                background: entries[key]?.trim()
                  ? "rgba(255,45,120,0.07)"
                  : "rgba(255,255,255,0.04)",
                border: entries[key]?.trim()
                  ? "1px solid rgba(255,45,120,0.25)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}
            />
          </div>
        ))}

        {/* Summary of filled meals */}
        {hasAny && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {filledEntries.map(m => (
              <span key={m.key} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: "rgba(255,45,120,0.12)", color: "#ff6ba8", border: "1px solid rgba(255,45,120,0.2)" }}>
                {m.emoji} {MEAL_TYPE_LABELS[m.key]}
              </span>
            ))}
            <span className="text-xs px-2.5 py-1 rounded-full text-white/30" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {filledEntries.length} meal{filledEntries.length > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {error && <p className="text-pink-400 text-xs">{error}</p>}

        <button
          onClick={analyze}
          disabled={!hasAny}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-base btn-neon disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Analyse my day ✨
        </button>
      </div>
    </div>
  );
}

const PLACEHOLDERS: Record<MealType, string> = {
  breakfast: "e.g. poha and chai, eggs on toast...",
  lunch: "e.g. dal rice with salad, paneer sabji with chapati...",
  dinner: "e.g. khichdi, grilled chicken with vegetables...",
  snack: "e.g. handful of almonds, fruit, chai and biscuits...",
};
