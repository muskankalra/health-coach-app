"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadProfile, loadMeals, clearAll } from "@/lib/storage";
import { UserProfile, MealLog, HealthCondition } from "@/lib/types";
import { CONDITION_LABELS, HEALTH_FOCUS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import MealLogger from "@/components/MealLogger";
import HistorySection from "@/components/HistorySection";

type Tab = "home" | "history";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [tab, setTab] = useState<Tab>("home");
  const [focusTip, setFocusTip] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const p = loadProfile();
    if (!p?.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setProfile(p);
    setMeals(loadMeals());

    const primaryCondition = p.conditions[0] as HealthCondition;
    const tips = HEALTH_FOCUS[primaryCondition] ?? HEALTH_FOCUS.general_health;
    const tipIndex = new Date().getDate() % tips.length;
    setFocusTip(tips[tipIndex]);

    setHydrated(true);
  }, [router]);

  function handleMealLogged(meal: MealLog) {
    setMeals((prev) => [meal, ...prev]);
  }

  function handleReset() {
    if (confirm("This will clear all your data. Are you sure?")) {
      clearAll();
      router.replace("/onboarding");
    }
  }

  if (!hydrated || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🌿</div>
          <p className="text-gray-500 text-sm">Loading your plan...</p>
        </div>
      </div>
    );
  }

  const greeting = getGreeting(profile.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 pb-24">
      <div className="max-w-lg mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between pt-12 pb-6">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
              🌿 Health Coach
            </p>
            <h1 className="text-xl font-bold text-gray-800 mt-0.5">{greeting}</h1>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
          >
            Reset
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm mb-5">
          <button
            onClick={() => setTab("home")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "home"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "history"
                ? "bg-rose-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            History {meals.length > 0 && `(${meals.length})`}
          </button>
        </div>

        {tab === "home" && (
          <div className="space-y-4">
            {/* Condition badges */}
            <div className="flex flex-wrap gap-2">
              {profile.conditions.map((c) => (
                <Badge
                  key={c}
                  className="bg-rose-100 text-rose-700 border-0 text-xs font-medium px-2.5 py-1"
                >
                  {c === "pcos" && "🌸 "}
                  {c === "insulin_resistance" && "🩸 "}
                  {c === "weight_loss" && "⚖️ "}
                  {c === "high_cholesterol" && "❤️ "}
                  {c === "general_health" && "✨ "}
                  {CONDITION_LABELS[c]}
                </Badge>
              ))}
            </div>

            {/* Daily focus card */}
            {focusTip && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3.5">
                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide mb-1">
                  Today&apos;s focus
                </p>
                <p className="text-sm text-gray-700 font-medium">{focusTip}</p>
              </div>
            )}

            {/* Meal logger */}
            <MealLogger profile={profile} onMealLogged={handleMealLogged} />

            {/* Recent meals preview */}
            {meals.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Recent meals</p>
                  <button
                    onClick={() => setTab("history")}
                    className="text-xs text-rose-500"
                  >
                    See all →
                  </button>
                </div>
                <div className="space-y-2">
                  {meals.slice(0, 2).map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 cursor-pointer hover:border-rose-200 transition-colors"
                      onClick={() => setTab("history")}
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {meal.mealText}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {meal.feedback.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center px-4 pb-2 leading-relaxed">
              This app provides general wellness guidance, not medical advice.
              Always consult a healthcare provider for medical decisions.
            </p>
          </div>
        )}

        {tab === "history" && <HistorySection meals={meals} />}
      </div>
    </div>
  );
}

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name} ☀️`;
  if (hour < 17) return `Good afternoon, ${name} 🌤️`;
  return `Good evening, ${name} 🌙`;
}
