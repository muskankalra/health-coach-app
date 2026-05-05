"use client";

import { useState } from "react";
import { CycleInfo } from "@/lib/types";
import { calculatePhase, PhaseInfo } from "@/lib/cycle";
import { saveCycleInfo } from "@/lib/storage";
import { Button } from "@/components/ui/button";

interface CycleTrackerProps {
  cycleInfo: CycleInfo | null;
  onUpdate: (info: CycleInfo) => void;
}

const ENERGY_BAR: Record<PhaseInfo["energyLevel"], { width: string; color: string }> = {
  low: { width: "25%", color: "bg-blue-300" },
  rising: { width: "60%", color: "bg-amber-400" },
  peak: { width: "100%", color: "bg-emerald-400" },
  dropping: { width: "45%", color: "bg-rose-300" },
};

const PHASE_COLORS: Record<string, string> = {
  menstrual: "bg-red-50 border-red-200",
  follicular: "bg-green-50 border-green-200",
  ovulatory: "bg-yellow-50 border-yellow-200",
  luteal: "bg-purple-50 border-purple-200",
};

const PHASE_ACCENT: Record<string, string> = {
  menstrual: "text-red-600",
  follicular: "text-green-600",
  ovulatory: "text-yellow-600",
  luteal: "text-purple-600",
};

export default function CycleTracker({ cycleInfo, onUpdate }: CycleTrackerProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [lastPeriodDate, setLastPeriodDate] = useState(
    cycleInfo?.lastPeriodDate ?? new Date().toISOString().split("T")[0]
  );
  const [cycleLength, setCycleLength] = useState(cycleInfo?.cycleLength ?? 28);

  function handleSave() {
    const info: CycleInfo = { lastPeriodDate, cycleLength };
    saveCycleInfo(info);
    onUpdate(info);
    setShowSetup(false);
  }

  if (!cycleInfo || showSetup) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌙</span>
          <p className="font-semibold text-gray-800 text-sm">
            {cycleInfo ? "Update cycle info" : "Set up cycle tracking"}
          </p>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          This lets us tailor your meal advice to your current cycle phase — one of the most powerful things you can do for PCOS.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              First day of your last period
            </label>
            <input
              type="date"
              value={lastPeriodDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setLastPeriodDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Average cycle length: <span className="text-rose-500 font-semibold">{cycleLength} days</span>
            </label>
            <input
              type="range"
              min={21}
              max={45}
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full accent-rose-400"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>21 days</span>
              <span>45 days</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {cycleInfo && (
            <Button
              variant="outline"
              onClick={() => setShowSetup(false)}
              className="flex-1 h-10 rounded-xl text-sm border-gray-200"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSave}
            className="flex-1 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold"
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  const phaseInfo = calculatePhase(cycleInfo);
  const energyBar = ENERGY_BAR[phaseInfo.energyLevel];
  const phaseColor = PHASE_COLORS[phaseInfo.phase];
  const phaseAccent = PHASE_ACCENT[phaseInfo.phase];

  return (
    <div className={`rounded-2xl border shadow-sm px-4 py-4 ${phaseColor}`}>
      {/* Phase header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl">{phaseInfo.emoji}</span>
            <p className={`font-bold text-sm ${phaseAccent}`}>{phaseInfo.label}</p>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Day {phaseInfo.dayOfCycle} · {phaseInfo.daysUntilNextPhase} days until next phase
          </p>
        </div>
        <button
          onClick={() => setShowSetup(true)}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Edit
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{phaseInfo.description}</p>

      {/* Energy bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Energy level</span>
          <span className="capitalize">{phaseInfo.energyLevel}</span>
        </div>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${energyBar.color}`}
            style={{ width: energyBar.width }}
          />
        </div>
      </div>

      {/* Focus foods */}
      <div>
        <p className="text-xs font-semibold text-gray-600 mb-1.5">
          Focus on this phase:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {phaseInfo.nutritionFocus.slice(0, 3).map((item, i) => (
            <span
              key={i}
              className="text-xs bg-white/70 border border-white rounded-full px-2.5 py-1 text-gray-700"
            >
              {item.split(" — ")[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
