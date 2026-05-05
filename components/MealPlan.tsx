"use client";

import { useState } from "react";
import { UserProfile, MealLog, TomorrowPlan, MealPlanItem } from "@/lib/types";

interface MealPlanProps {
  profile: UserProfile;
  recentMeals: MealLog[];
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: "☀️",
  lunch: "🌤️",
  dinner: "🌙",
  snack: "⚡",
};

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
};

function calcBMRInfo(profile: UserProfile) {
  if (!profile.weight || !profile.height) return null;
  const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  const bmr = profile.gender === "male" ? base + 5 : profile.gender === "female" ? base - 161 : base - 78;
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[profile.lifestyle] ?? 1.2));
  const target = tdee - 450;
  return { tdee, target };
}

const MEAL_KEYS = ["breakfast", "lunch", "dinner", "snack"] as const;
type MealKey = typeof MEAL_KEYS[number];

export default function MealPlan({ profile, recentMeals }: MealPlanProps) {
  const [plan, setPlan] = useState<TomorrowPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openRecipe, setOpenRecipe] = useState<MealKey | null>(null);
  const [swapping, setSwapping] = useState<MealKey | null>(null);

  const isWeightLoss = profile.conditions.includes("weight_loss") || profile.mainGoal === "weight_loss";
  const bmrInfo = isWeightLoss ? calcBMRInfo(profile) : null;

  async function generatePlan() {
    setLoading(true);
    setError("");
    setOpenRecipe(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: profile, recentMeals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate plan");
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function swapMeal(mealKey: MealKey) {
    if (!plan) return;
    setSwapping(mealKey);
    setOpenRecipe(null);
    try {
      const otherMeals = Object.fromEntries(
        MEAL_KEYS.filter(k => k !== mealKey).map(k => [k, plan[k]])
      );
      const mealCalorieTargets: Record<MealKey, number | null> = bmrInfo
        ? {
            breakfast: Math.round(bmrInfo.target * 0.28),
            lunch: Math.round(bmrInfo.target * 0.35),
            dinner: Math.round(bmrInfo.target * 0.27),
            snack: Math.round(bmrInfo.target * 0.10),
          }
        : { breakfast: null, lunch: null, dinner: null, snack: null };

      const res = await fetch("/api/swap-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          mealKey,
          dislikedMeal: plan[mealKey].meal,
          otherMeals,
          calorieTarget: mealCalorieTargets[mealKey],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to swap meal");
      setPlan(prev => prev ? { ...prev, [mealKey]: data as MealPlanItem } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setSwapping(null);
    }
  }

  if (loading) {
    return (
      <div className="glass rounded-2xl px-5 py-10 text-center">
        <div className="text-4xl mb-3" style={{ animation: "pulse 1.5s infinite" }}>🗓️</div>
        <p className="font-semibold text-white">Building your meal plan...</p>
        <p className="text-sm text-white/40 mt-1">Personalising to your conditions and recent meals</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="space-y-3">
        {/* BMR banner shown before generating */}
        {bmrInfo && (
          <div className="rounded-2xl px-4 py-3.5"
            style={{ background: "rgba(255,45,120,0.07)", border: "1px solid rgba(255,45,120,0.18)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#ff6ba8" }}>
              ⚖️ Your calorie target
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-xl font-bold text-white">{bmrInfo.target} kcal/day</span>
              <span className="text-xs text-white/40">TDEE {bmrInfo.tdee} kcal − 450 deficit</span>
            </div>
            <p className="text-xs text-white/35 mt-1">Meals below are portioned to this target for safe 0.5 kg/week loss.</p>
          </div>
        )}

        <div className="glass rounded-2xl px-5 py-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
              🗓️
            </div>
            <div>
              <p className="font-bold text-white text-sm">Plan tomorrow&apos;s meals</p>
              <p className="text-xs text-white/35 mt-0.5">Breakfast, lunch, dinner + snack — built for your conditions</p>
            </div>
          </div>
          {error && <p className="text-pink-400 text-xs mb-3">{error}</p>}
          <button
            onClick={generatePlan}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(139,92,246,0.3), rgba(123,47,247,0.2))",
              border: "1px solid rgba(139,92,246,0.3)",
            }}
          >
            Generate tomorrow&apos;s plan ✦
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Intro */}
      <div className="glass rounded-2xl px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🗓️</span>
            <p className="font-bold text-white text-sm">Tomorrow&apos;s meal plan</p>
          </div>
          {bmrInfo && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.2)", color: "#ff6ba8" }}>
              ⚖️ {bmrInfo.target} kcal target
            </span>
          )}
        </div>
        <p className="text-sm text-white/50 leading-relaxed">{plan.intro}</p>
      </div>

      {/* Meals */}
      {MEAL_KEYS.map((key) => {
        const data = plan[key];
        const isRecipeOpen = openRecipe === key;
        const isSwappingThis = swapping === key;

        return (
          <div key={key} className="glass rounded-2xl overflow-hidden">
            <div className="px-4 py-4">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0">{MEAL_ICONS[key]}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/30">{key}</p>
                    <p className="font-semibold text-white text-sm leading-snug">{data.meal}</p>
                  </div>
                </div>
                {data.calories && (
                  <span className="text-xs font-semibold shrink-0 px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}>
                    {data.calories}
                  </span>
                )}
              </div>

              {/* Why */}
              <p className="text-xs text-white/45 leading-relaxed mb-3">{data.why}</p>

              {/* Ingredients */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {data.ingredients.map((ing, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                    {ing}
                  </span>
                ))}
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between gap-2">
                {data.recipe?.length > 0 && (
                  <button
                    onClick={() => setOpenRecipe(isRecipeOpen ? null : key)}
                    className="flex items-center gap-1.5 text-xs font-semibold transition-all"
                    style={{ color: isRecipeOpen ? "#a78bfa" : "rgba(167,139,250,0.5)" }}
                  >
                    <span>📋</span>
                    <span>{isRecipeOpen ? "Hide recipe" : "See recipe"}</span>
                    <span>{isRecipeOpen ? "▲" : "▼"}</span>
                  </button>
                )}

                <button
                  onClick={() => swapMeal(key)}
                  disabled={isSwappingThis || swapping !== null}
                  className="flex items-center gap-1 text-xs font-medium transition-all disabled:opacity-40 ml-auto"
                  style={{ color: "rgba(251,191,36,0.6)" }}
                >
                  {isSwappingThis ? (
                    <span>Finding alternative...</span>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Don&apos;t like this</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recipe steps */}
            {isRecipeOpen && data.recipe?.length > 0 && (
              <div className="px-4 pb-4 border-t border-white/6 pt-3 space-y-2">
                {data.recipe.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/55 leading-relaxed">
                      {step.replace(/^Step \d+:\s*/i, "")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {error && <p className="text-pink-400 text-xs px-1">{error}</p>}

      {/* General tip */}
      {plan.generalTip && (
        <div className="rounded-2xl px-4 py-3.5 flex gap-3"
          style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
          <span className="text-lg shrink-0">💡</span>
          <p className="text-sm" style={{ color: "rgba(251,191,36,0.8)" }}>{plan.generalTip}</p>
        </div>
      )}

      <button
        onClick={() => { setPlan(null); setOpenRecipe(null); }}
        className="w-full py-2.5 rounded-xl border border-white/8 text-white/30 text-sm hover:border-white/15 transition-all"
      >
        Regenerate plan
      </button>
    </div>
  );
}
