"use client";

import { useState } from "react";
import { DayLog } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/constants";

interface DayFeedbackCardProps {
  day: DayLog;
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: "☀️", lunch: "🌤️", dinner: "🌙", snack: "⚡",
};

export default function DayFeedbackCard({ day }: DayFeedbackCardProps) {
  const { analysis } = day;
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const date = new Date(day.timestamp);
  const dateStr = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="space-y-3">
      {/* Day overview */}
      <div className="glass rounded-2xl px-4 py-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-white/30 mb-1">{dateStr}</p>
            <p className="font-bold text-white">Day Review</p>
          </div>
          <span className="text-lg px-3 py-1 rounded-full font-bold"
            style={{ background: "rgba(255,45,120,0.12)", color: "#ff6ba8", border: "1px solid rgba(255,45,120,0.2)" }}>
            {analysis.dayScore}
          </span>
        </div>
        <p className="text-sm text-white/55 leading-relaxed">{analysis.overallSummary}</p>

        {/* Day patterns */}
        {analysis.dayPatterns?.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {analysis.dayPatterns.map((p, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-xs mt-0.5" style={{ color: "#fbbf24" }}>◆</span>
                <p className="text-xs text-white/45">{p}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-meal breakdown */}
      <div>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-2 px-1">Meal breakdown</p>
        <div className="space-y-2">
          {analysis.meals.map((m, i) => {
            const isOpen = expandedMeal === `${i}`;
            return (
              <div key={i} className="glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedMeal(isOpen ? null : `${i}`)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{MEAL_ICONS[m.mealType] ?? "🍽️"}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-white/30 font-medium">{MEAL_TYPE_LABELS[m.mealType]}</p>
                      <p className="text-sm font-semibold text-white truncate">{m.mealText}</p>
                    </div>
                  </div>
                  <span className="text-white/25 text-sm shrink-0 ml-2">{isOpen ? "▲" : "▼"}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/6 pt-3">
                    <p className="text-sm text-white/50 leading-relaxed">{m.feedback.summary}</p>

                    {m.feedback.whatsGood?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#4ade80" }}>✅ What&apos;s working</p>
                        <ul className="space-y-1">
                          {m.feedback.whatsGood.map((item, j) => (
                            <li key={j} className="text-sm text-white/50 flex gap-2">
                              <span style={{ color: "#4ade80" }} className="shrink-0">•</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.feedback.improvements?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#fbbf24" }}>💡 Could be better</p>
                        <ul className="space-y-1">
                          {m.feedback.improvements.map((item, j) => (
                            <li key={j} className="text-sm text-white/50 flex gap-2">
                              <span style={{ color: "#fbbf24" }} className="shrink-0">•</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.feedback.conditionAwareFeedback?.length > 0 && (
                      <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.15)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#ff6ba8" }}>🌸 For your conditions</p>
                        <ul className="space-y-1">
                          {m.feedback.conditionAwareFeedback.map((item, j) => (
                            <li key={j} className="text-sm flex gap-2" style={{ color: "rgba(255,107,168,0.75)" }}>
                              <span className="shrink-0">•</span>{item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.feedback.betterVersion && (
                      <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#a78bfa" }}>🍽️ Better version</p>
                        <p className="text-sm" style={{ color: "rgba(167,139,250,0.8)" }}>{m.feedback.betterVersion}</p>
                      </div>
                    )}

                    {m.feedback.smallFix && (
                      <div className="rounded-xl px-3 py-2.5 flex gap-2" style={{ background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.1)" }}>
                        <span className="shrink-0">🎯</span>
                        <div>
                          <p className="text-xs font-semibold mb-0.5" style={{ color: "#67e8f9" }}>One small fix</p>
                          <p className="text-sm" style={{ color: "rgba(103,232,249,0.75)" }}>{m.feedback.smallFix}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tomorrow plan */}
      {analysis.tomorrowPlan && (
        <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#fbbf24" }}>
            🌅 Tomorrow&apos;s plan
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(251,191,36,0.8)" }}>{analysis.tomorrowPlan}</p>
        </div>
      )}

      {/* Gentle note */}
      {analysis.gentleNote && (
        <p className="text-sm text-white/25 italic text-center px-4">{analysis.gentleNote}</p>
      )}
    </div>
  );
}
