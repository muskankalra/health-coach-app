"use client";

import { useState } from "react";
import { DayLog } from "@/lib/types";
import DayFeedbackCard from "./DayFeedbackCard";

interface HistorySectionProps {
  dayLogs: DayLog[];
}

export default function HistorySection({ dayLogs }: HistorySectionProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (dayLogs.length === 0) {
    return (
      <div className="glass rounded-2xl px-5 py-10 text-center">
        <p className="text-4xl mb-3">🍽️</p>
        <p className="font-semibold text-white mb-1">No meals logged yet</p>
        <p className="text-sm text-white/35">Log your first day on the Today tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-white/30 uppercase tracking-wider px-1">
        {dayLogs.length} day{dayLogs.length !== 1 ? "s" : ""} logged
      </p>
      {dayLogs.map(day =>
        expanded === day.id ? (
          <div key={day.id}>
            <DayFeedbackCard day={day} />
            <button onClick={() => setExpanded(null)}
              className="w-full text-center text-xs text-white/25 mt-2 py-1 hover:text-white/40">
              Show less ↑
            </button>
          </div>
        ) : (
          <button key={day.id} onClick={() => setExpanded(day.id)}
            className="w-full text-left glass rounded-2xl px-4 py-3.5 hover:border-white/15 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-white/30">
                    {new Date(day.timestamp).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <span className="text-xs font-semibold" style={{ color: "#ff6ba8" }}>
                    {day.analysis.dayScore}
                  </span>
                </div>
                <p className="text-sm font-medium text-white truncate">
                  {day.meals.map(m => m.mealText).join(" · ")}
                </p>
                <p className="text-xs text-white/30 mt-0.5 truncate">{day.analysis.overallSummary}</p>
              </div>
              <p className="text-xs shrink-0" style={{ color: "rgba(255,45,120,0.5)" }}>Tap ↓</p>
            </div>
          </button>
        )
      )}
    </div>
  );
}
