"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveProfile } from "@/lib/storage";
import {
  UserProfile,
  HealthCondition,
  DietPreference,
  CuisinePreference,
  LifestyleType,
  MainGoal,
} from "@/lib/types";
import {
  CONDITION_LABELS,
  DIET_LABELS,
  CUISINE_LABELS,
  LIFESTYLE_LABELS,
  GOAL_LABELS,
} from "@/lib/constants";

const CONDITIONS = Object.keys(CONDITION_LABELS) as HealthCondition[];
const DIETS = Object.keys(DIET_LABELS) as DietPreference[];
const CUISINES = Object.keys(CUISINE_LABELS) as CuisinePreference[];
const LIFESTYLES = Object.keys(LIFESTYLE_LABELS) as LifestyleType[];
const GOALS = Object.keys(GOAL_LABELS) as MainGoal[];

const STEPS = ["basics", "conditions", "preferences", "goal"] as const;
type Step = (typeof STEPS)[number];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<Partial<UserProfile>>({
    conditions: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentIndex = STEPS.indexOf(step);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  function validateStep(): boolean {
    const newErrors: Record<string, string> = {};
    if (step === "basics") {
      if (!form.name?.trim()) newErrors.name = "Please enter your name";
      if (!form.age || form.age < 10 || form.age > 100)
        newErrors.age = "Please enter a valid age";
    }
    if (step === "conditions") {
      if (!form.conditions?.length)
        newErrors.conditions = "Select at least one condition or goal";
    }
    if (step === "preferences") {
      if (!form.dietPreference) newErrors.diet = "Please select a diet";
      if (!form.cuisinePreference) newErrors.cuisine = "Please select a cuisine";
      if (!form.lifestyle) newErrors.lifestyle = "Please select your lifestyle";
    }
    if (step === "goal") {
      if (!form.mainGoal) newErrors.goal = "Please select your main goal";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
    } else {
      handleSubmit();
    }
  }

  function handleSubmit() {
    const profile: UserProfile = {
      name: form.name!,
      age: form.age!,
      conditions: form.conditions!,
      dietPreference: form.dietPreference!,
      cuisinePreference: form.cuisinePreference!,
      lifestyle: form.lifestyle!,
      mainGoal: form.mainGoal!,
      onboardingComplete: true,
    };
    saveProfile(profile);
    router.push("/");
  }

  function toggleCondition(c: HealthCondition) {
    setForm((prev) => {
      const current = prev.conditions ?? [];
      return {
        ...prev,
        conditions: current.includes(c)
          ? current.filter((x) => x !== c)
          : [...current, c],
      };
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🌿</span>
            <span className="text-sm font-medium text-rose-500 uppercase tracking-wider">
              Health Coach
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {step === "basics" && "Let's get to know you"}
            {step === "conditions" && "What are you managing?"}
            {step === "preferences" && "Your food preferences"}
            {step === "goal" && "Your main focus"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {step === "basics" && "This helps us personalize your experience."}
            {step === "conditions" &&
              "Select all that apply — we'll tailor advice to each."}
            {step === "preferences" &&
              "So we can give relevant meal suggestions."}
            {step === "goal" && "One thing you most want to work on right now."}
          </p>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 bg-rose-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Step {currentIndex + 1} of {STEPS.length}
          </p>
        </div>

        {/* Step: Basics */}
        {step === "basics" && (
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya"
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 text-base"
              />
              {errors.name && (
                <p className="text-rose-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                placeholder="e.g. 27"
                value={form.age ?? ""}
                onChange={(e) =>
                  setForm({ ...form, age: parseInt(e.target.value) || undefined })
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 text-base"
              />
              {errors.age && (
                <p className="text-rose-500 text-xs mt-1">{errors.age}</p>
              )}
            </div>
          </div>
        )}

        {/* Step: Conditions */}
        {step === "conditions" && (
          <div className="flex-1">
            {errors.conditions && (
              <p className="text-rose-500 text-xs mb-3">{errors.conditions}</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {CONDITIONS.map((c) => {
                const selected = form.conditions?.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => toggleCondition(c)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                      selected
                        ? "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                    }`}
                  >
                    <span className="mr-2">
                      {c === "pcos" && "🌸"}
                      {c === "insulin_resistance" && "🩸"}
                      {c === "weight_loss" && "⚖️"}
                      {c === "high_cholesterol" && "❤️"}
                      {c === "general_health" && "✨"}
                    </span>
                    {CONDITION_LABELS[c]}
                    {selected && (
                      <span className="float-right text-rose-400">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step: Preferences */}
        {step === "preferences" && (
          <div className="space-y-5 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diet preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIETS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setForm({ ...form, dietPreference: d })}
                    className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.dietPreference === d
                        ? "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                    }`}
                  >
                    {DIET_LABELS[d]}
                  </button>
                ))}
              </div>
              {errors.diet && (
                <p className="text-rose-500 text-xs mt-1">{errors.diet}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CUISINES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, cuisinePreference: c })}
                    className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.cuisinePreference === c
                        ? "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                    }`}
                  >
                    {CUISINE_LABELS[c]}
                  </button>
                ))}
              </div>
              {errors.cuisine && (
                <p className="text-rose-500 text-xs mt-1">{errors.cuisine}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activity level
              </label>
              <div className="grid grid-cols-1 gap-2">
                {LIFESTYLES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setForm({ ...form, lifestyle: l })}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                      form.lifestyle === l
                        ? "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                    }`}
                  >
                    {l === "sedentary" && "🪑 "}
                    {l === "lightly_active" && "🚶 "}
                    {l === "active" && "🏃 "}
                    {LIFESTYLE_LABELS[l]}
                  </button>
                ))}
              </div>
              {errors.lifestyle && (
                <p className="text-rose-500 text-xs mt-1">{errors.lifestyle}</p>
              )}
            </div>
          </div>
        )}

        {/* Step: Goal */}
        {step === "goal" && (
          <div className="flex-1">
            {errors.goal && (
              <p className="text-rose-500 text-xs mb-3">{errors.goal}</p>
            )}
            <div className="grid grid-cols-1 gap-3">
              {GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, mainGoal: g })}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all font-medium text-sm ${
                    form.mainGoal === g
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                  }`}
                >
                  {g === "better_periods" && "🌸 "}
                  {g === "weight_loss" && "⚖️ "}
                  {g === "better_energy" && "⚡ "}
                  {g === "reduce_cravings" && "🍫 "}
                  {g === "improve_cholesterol" && "❤️ "}
                  {g === "improve_insulin_sensitivity" && "🩸 "}
                  {g === "general_health" && "✨ "}
                  {GOAL_LABELS[g]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {currentIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setStep(STEPS[currentIndex - 1])}
              className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600"
            >
              Back
            </Button>
          )}
          <Button
            onClick={next}
            className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base"
          >
            {currentIndex === STEPS.length - 1 ? "Start my journey 🌿" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
