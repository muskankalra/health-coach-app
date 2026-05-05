"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadProfile, loadDayLogs, loadCycleInfo, loadSymptoms,
  clearAll, saveCycleInfo,
} from "@/lib/storage";
import {
  UserProfile, HealthCondition, CycleInfo, SymptomLog, DayLog, MealLog,
} from "@/lib/types";
import { CONDITION_LABELS } from "@/lib/constants";
import MealLogger from "@/components/MealLogger";
import MealPlan from "@/components/MealPlan";
import HistorySection from "@/components/HistorySection";
import CycleTracker from "@/components/CycleTracker";
import SymptomLogger from "@/components/SymptomLogger";
import PatternsView from "@/components/PatternsView";

type Tab = "today" | "plan" | "history";

const CONDITION_ICONS: Record<HealthCondition, string> = {
  pcos: "🌸", insulin_resistance: "🩸", weight_loss: "⚖️",
  high_cholesterol: "❤️", general_health: "✨",
};

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayLogs, setDayLogs] = useState<DayLog[]>([]);
  const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
  const [cycleInfo, setCycleInfo] = useState<CycleInfo | null>(null);
  const [tab, setTab] = useState<Tab>("today");
  const [hydrated, setHydrated] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p?.onboardingComplete) { router.replace("/onboarding"); return; }
    setProfile(p);
    setDayLogs(loadDayLogs());
    setSymptoms(loadSymptoms());
    setCycleInfo(loadCycleInfo());
    setHydrated(true);
  }, [router]);

  if (!hydrated || !profile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4" style={{ animation: "pulse 1.5s infinite" }}>✦</div>
          <p className="text-white/40 text-sm">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const hasPcos = profile.conditions.includes("pcos");

  // Flatten day logs into meal logs for PatternsView + MealPlan compatibility
  const flatMeals: MealLog[] = dayLogs.flatMap(d =>
    d.meals.map((m, i) => ({
      id: `${d.id}-${i}`,
      mealType: m.mealType,
      mealText: m.mealText,
      feedback: d.analysis.meals[i]?.feedback ?? d.analysis.meals[0]?.feedback,
      timestamp: d.timestamp,
    }))
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "plan", label: "Plan Tomorrow" },
    { key: "history", label: `History${dayLogs.length ? ` (${dayLogs.length})` : ""}` },
  ];

  return (
    <div className="min-h-screen gradient-bg pb-16">
      <div className="max-w-lg mx-auto px-4">

        {/* Header */}
        <div className="pt-12 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest mb-1"
                style={{ color: "rgba(255,45,120,0.7)" }}>
                ✦ Health Coach
              </p>
              <h1 className="text-2xl font-bold text-white">{greeting}, {profile.name}</h1>
              <p className="text-sm text-white/30 mt-0.5">Here&apos;s your health dashboard</p>
            </div>
            <button
              onClick={() => { if (confirm("Reset all data?")) { clearAll(); router.replace("/onboarding"); } }}
              className="text-xs text-white/20 hover:text-white/40 mt-1"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {profile.conditions.map(c => (
              <span key={c} className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5"
                style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.2)", color: "#ff6ba8" }}>
                {CONDITION_ICONS[c]} {CONDITION_LABELS[c]}
              </span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key ? "text-white" : "text-white/30 hover:text-white/50"
              }`}
              style={tab === t.key ? { background: "linear-gradient(135deg, #ff2d78, #7b2ff7)" } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* TODAY */}
        {tab === "today" && (
          <div className="space-y-4">
            {hasPcos && (
              <CycleTracker cycleInfo={cycleInfo}
                onUpdate={info => { saveCycleInfo(info); setCycleInfo(info); }} />
            )}

            <MealLogger
              profile={profile}
              cycleInfo={cycleInfo}
              onDayLogged={day => setDayLogs(prev => [day, ...prev])}
            />

            <SymptomLogger onLogged={s => setSymptoms(prev => [s, ...prev])} />

            {(dayLogs.length >= 2 || symptoms.length >= 2) && (
              <button
                onClick={() => setShowPatterns(p => !p)}
                className="w-full glass rounded-2xl px-4 py-3.5 text-left transition-all"
                style={{ borderColor: showPatterns ? "rgba(139,92,246,0.3)" : undefined }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Pattern insights</p>
                    <p className="text-xs text-white/30 mt-0.5">AI analysis across your meals & symptoms</p>
                  </div>
                  <span className="text-lg">{showPatterns ? "▲" : "🔍"}</span>
                </div>
              </button>
            )}

            {showPatterns && <PatternsView profile={profile} meals={flatMeals} symptoms={symptoms} />}

            {dayLogs.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Recent</p>
                  <button onClick={() => setTab("history")} className="text-xs" style={{ color: "#ff6ba8" }}>
                    See all →
                  </button>
                </div>
                <div className="space-y-2">
                  {dayLogs.slice(0, 2).map(day => (
                    <button key={day.id} onClick={() => setTab("history")}
                      className="w-full glass rounded-xl px-4 py-3 text-left hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-white/30">
                          {new Date(day.timestamp).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                        </p>
                        <span className="text-xs font-semibold" style={{ color: "#ff6ba8" }}>{day.analysis.dayScore}</span>
                      </div>
                      <p className="text-sm font-medium text-white truncate">
                        {day.meals.map(m => m.mealText).join(" · ")}
                      </p>
                      <p className="text-xs text-white/30 mt-0.5 truncate">{day.analysis.overallSummary}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-white/20 text-center px-4 pb-2 leading-relaxed">
              General wellness guidance only — not medical advice.
            </p>
          </div>
        )}

        {tab === "plan" && <MealPlan profile={profile} recentMeals={flatMeals} />}
        {tab === "history" && <HistorySection dayLogs={dayLogs} />}
      </div>
    </div>
  );
}
