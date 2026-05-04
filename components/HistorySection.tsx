"use client";

import { useState } from "react";
import { MealLog } from "@/lib/types";
import FeedbackCard from "./FeedbackCard";

interface HistorySectionProps {
  meals: MealLog[];
}

export default function HistorySection({ meals }: HistorySectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (meals.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-3xl mb-2">🍽️</p>
        <p className="text-sm">No meals logged yet. Start by logging your first meal!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {meals.map((meal) =>
        expanded === meal.id ? (
          <div key={meal.id}>
            <FeedbackCard meal={meal} expanded />
            <button
              onClick={() => setExpanded(null)}
              className="w-full text-center text-xs text-gray-400 mt-2 py-1"
            >
              Show less ↑
            </button>
          </div>
        ) : (
          <button
            key={meal.id}
            onClick={() => setExpanded(meal.id)}
            className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 hover:border-rose-200 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{meal.mealText}</p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{meal.feedback.summary}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">
                  {new Date(meal.timestamp).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-rose-400 mt-0.5">Tap to expand</p>
              </div>
            </div>
          </button>
        )
      )}
    </div>
  );
}
