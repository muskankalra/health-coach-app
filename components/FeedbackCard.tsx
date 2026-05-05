"use client";

import { MealLog } from "@/lib/types";
import { MEAL_TYPE_LABELS } from "@/lib/constants";

interface FeedbackCardProps {
  meal: MealLog;
  expanded?: boolean;
}

export default function FeedbackCard({ meal, expanded = false }: FeedbackCardProps) {
  const { feedback } = meal;
  const date = new Date(meal.timestamp);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="glass rounded-2xl overflow-hidden border border-white/8">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/6">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,45,120,0.15)", color: "#ff6ba8", border: "1px solid rgba(255,45,120,0.25)" }}>
                {MEAL_TYPE_LABELS[meal.mealType]}
              </span>
              {meal.mood && (
                <span className="text-xs text-white/30">
                  {meal.mood === "low" ? "😔 Low" : meal.mood === "okay" ? "😐 Okay" : "😊 Good"}
                </span>
              )}
            </div>
            <p className="font-semibold text-white text-sm">{meal.mealText}</p>
          </div>
          <div className="text-right text-xs text-white/25 shrink-0">
            <div>{timeStr}</div>
            <div>{dateStr}</div>
          </div>
        </div>
        <p className="text-sm text-white/50 mt-2 leading-relaxed">{feedback.summary}</p>
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* What's good */}
        {feedback.whatsGood.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#4ade80" }}>
              ✅ What&apos;s working
            </p>
            <ul className="space-y-1">
              {feedback.whatsGood.map((item, i) => (
                <li key={i} className="text-sm text-white/60 flex gap-2">
                  <span style={{ color: "#4ade80" }} className="shrink-0">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {feedback.improvements.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#fbbf24" }}>
              💡 Could be better
            </p>
            <ul className="space-y-1">
              {feedback.improvements.map((item, i) => (
                <li key={i} className="text-sm text-white/60 flex gap-2">
                  <span style={{ color: "#fbbf24" }} className="shrink-0">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Condition feedback */}
        {feedback.conditionAwareFeedback.length > 0 && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(255,45,120,0.08)", border: "1px solid rgba(255,45,120,0.15)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#ff6ba8" }}>
              🌸 For your health goals
            </p>
            <ul className="space-y-1">
              {feedback.conditionAwareFeedback.map((item, i) => (
                <li key={i} className="text-sm flex gap-2" style={{ color: "rgba(255,107,168,0.8)" }}>
                  <span className="shrink-0">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Better version */}
        {feedback.betterVersion && (
          <div className="rounded-xl px-3 py-2.5" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#a78bfa" }}>🍽️ Better version</p>
            <p className="text-sm" style={{ color: "rgba(167,139,250,0.85)" }}>{feedback.betterVersion}</p>
          </div>
        )}

        {/* Small fix */}
        {feedback.smallFix && (
          <div className="rounded-xl px-3 py-2.5 flex gap-2" style={{ background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.12)" }}>
            <span className="text-base shrink-0">🎯</span>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#67e8f9" }}>One small fix</p>
              <p className="text-sm" style={{ color: "rgba(103,232,249,0.8)" }}>{feedback.smallFix}</p>
            </div>
          </div>
        )}

        {/* Tomorrow tip */}
        {feedback.tomorrowTip && (
          <div className="rounded-xl px-3 py-2.5 flex gap-2" style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
            <span className="text-base shrink-0">🌅</span>
            <div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#fbbf24" }}>Tomorrow&apos;s tip</p>
              <p className="text-sm" style={{ color: "rgba(251,191,36,0.8)" }}>{feedback.tomorrowTip}</p>
            </div>
          </div>
        )}

        {/* Gentle note */}
        {feedback.gentleNote && (
          <div className="border-t border-white/6 pt-3">
            <p className="text-sm text-white/30 italic text-center">{feedback.gentleNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
