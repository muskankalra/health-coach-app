"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile, MealType, MoodEnergy, MealLog, MealFeedback } from "@/lib/types";
import { MEAL_TYPE_LABELS, MOOD_LABELS } from "@/lib/constants";
import { saveMeal } from "@/lib/storage";
import FeedbackCard from "./FeedbackCard";

interface MealLoggerProps {
  profile: UserProfile;
  onMealLogged: (meal: MealLog) => void;
}

type LoggerState = "idle" | "logging" | "analyzing" | "result";

export default function MealLogger({ profile, onMealLogged }: MealLoggerProps) {
  const [state, setState] = useState<LoggerState>("idle");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [mealText, setMealText] = useState("");
  const [mood, setMood] = useState<MoodEnergy | undefined>();
  const [result, setResult] = useState<MealLog | null>(null);
  const [error, setError] = useState("");

  const MEAL_TYPES = Object.keys(MEAL_TYPE_LABELS) as MealType[];
  const MOODS = Object.keys(MOOD_LABELS) as MoodEnergy[];

  async function analyzeMeal() {
    if (!mealText.trim()) {
      setError("Please describe what you ate.");
      return;
    }
    setError("");
    setState("analyzing");

    try {
      const res = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userProfile: profile,
          mealType,
          mealText: mealText.trim(),
          mood,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Analysis failed");
      const feedback: MealFeedback = data;

      const meal: MealLog = {
        id: Date.now().toString(),
        mealType,
        mealText: mealText.trim(),
        mood,
        feedback,
        timestamp: Date.now(),
      };

      saveMeal(meal);
      setResult(meal);
      onMealLogged(meal);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("logging");
    }
  }

  function reset() {
    setState("idle");
    setMealText("");
    setMood(undefined);
    setResult(null);
    setError("");
  }

  if (state === "idle") {
    return (
      <button
        onClick={() => setState("logging")}
        className="w-full bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white rounded-2xl px-5 py-4 text-left transition-colors shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-base">Log a meal</p>
            <p className="text-rose-200 text-sm mt-0.5">Tell me what you ate</p>
          </div>
          <span className="text-2xl">🍽️</span>
        </div>
      </button>
    );
  }

  if (state === "analyzing") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-8 text-center">
        <div className="text-4xl mb-3 animate-bounce">🌿</div>
        <p className="font-semibold text-gray-800">Analyzing your meal...</p>
        <p className="text-sm text-gray-500 mt-1">Getting personalized feedback for you</p>
      </div>
    );
  }

  if (state === "result" && result) {
    return (
      <div className="space-y-3">
        <FeedbackCard meal={result} expanded />
        <Button
          onClick={reset}
          variant="outline"
          className="w-full h-11 rounded-xl border-gray-200 text-gray-600"
        >
          Log another meal
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center justify-between mb-1">
          <p className="font-semibold text-gray-800">What did you eat?</p>
          <button
            onClick={reset}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Meal type */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            Meal type
          </label>
          <div className="flex gap-2 flex-wrap">
            {MEAL_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setMealType(t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  mealType === t
                    ? "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-rose-300"
                }`}
              >
                {MEAL_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Meal text */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            What you ate
          </label>
          <Textarea
            placeholder="e.g. poha and chai, pasta with chicken, dal rice and salad..."
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            className="resize-none rounded-xl border-gray-200 focus:ring-rose-300 text-base min-h-[90px]"
            rows={3}
          />
          {error && <p className="text-rose-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Mood */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            How are you feeling? <span className="text-gray-400">(optional)</span>
          </label>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(mood === m ? undefined : m)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${
                  mood === m
                    ? "bg-rose-50 text-rose-700 border-rose-300"
                    : "bg-white text-gray-500 border-gray-200 hover:border-rose-200"
                }`}
              >
                {m === "low" && "😔 Low"}
                {m === "okay" && "😐 Okay"}
                {m === "good" && "😊 Good"}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={analyzeMeal}
          className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base"
        >
          Analyze meal ✨
        </Button>
      </div>
    </div>
  );
}
