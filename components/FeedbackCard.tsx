"use client";

import { MealFeedback, MealLog } from "@/lib/types";
import { MEAL_TYPE_LABELS, CONDITION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="secondary" className="text-xs bg-rose-100 text-rose-700 border-0">
                {MEAL_TYPE_LABELS[meal.mealType]}
              </Badge>
              {meal.mood && (
                <span className="text-xs text-gray-400">
                  {meal.mood === "low" && "😔 Low energy"}
                  {meal.mood === "okay" && "😐 Okay"}
                  {meal.mood === "good" && "😊 Feeling good"}
                </span>
              )}
            </div>
            <p className="font-semibold text-gray-800 text-sm leading-snug">
              {meal.mealText}
            </p>
          </div>
          <div className="text-right text-xs text-gray-400 shrink-0">
            <div>{timeStr}</div>
            <div>{dateStr}</div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{feedback.summary}</p>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* What's good */}
        {feedback.whatsGood.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1.5">
              ✅ What's working
            </p>
            <ul className="space-y-1">
              {feedback.whatsGood.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-emerald-400 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {feedback.improvements.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1.5">
              💡 Could be better
            </p>
            <ul className="space-y-1">
              {feedback.improvements.map((item, i) => (
                <li key={i} className="text-sm text-gray-700 flex gap-2">
                  <span className="text-amber-400 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Condition-aware feedback */}
        {feedback.conditionAwareFeedback.length > 0 && (
          <div className="bg-rose-50 rounded-xl px-3 py-2.5">
            <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1.5">
              🌸 For your health goals
            </p>
            <ul className="space-y-1">
              {feedback.conditionAwareFeedback.map((item, i) => (
                <li key={i} className="text-sm text-rose-800 flex gap-2">
                  <span className="text-rose-400 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Better version */}
        {feedback.betterVersion && (
          <div className="bg-amber-50 rounded-xl px-3 py-2.5">
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
              🍽️ A better version
            </p>
            <p className="text-sm text-amber-900">{feedback.betterVersion}</p>
          </div>
        )}

        {/* Small fix */}
        {feedback.smallFix && (
          <div className="flex gap-2 items-start bg-blue-50 rounded-xl px-3 py-2.5">
            <span className="text-base shrink-0">🎯</span>
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-0.5">One small fix</p>
              <p className="text-sm text-blue-900">{feedback.smallFix}</p>
            </div>
          </div>
        )}

        {/* Gentle note */}
        {feedback.gentleNote && (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm text-gray-500 italic text-center">{feedback.gentleNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
