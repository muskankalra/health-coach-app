"use client";

import { useState } from "react";
import { UserProfile, MealLog, SymptomLog, PatternAnalysis } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface PatternsViewProps {
  profile: UserProfile;
  meals: MealLog[];
  symptoms: SymptomLog[];
}

export default function PatternsView({ profile, meals, symptoms }: PatternsViewProps) {
  const [analysis, setAnalysis] = useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasEnoughData = meals.length >= 3 || symptoms.length >= 2;

  async function runAnalysis() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze-patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile: profile, meals, symptoms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3 animate-pulse">🔍</div>
        <p className="font-semibold text-gray-700">Analysing your patterns...</p>
        <p className="text-sm text-gray-400 mt-1">Looking across your meals and symptoms</p>
      </div>
    );
  }

  if (!hasEnoughData) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-6 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-semibold text-gray-800 mb-1">Not enough data yet</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Log at least 3 meals and a few symptoms to unlock pattern insights. The more you log, the smarter this gets.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-rose-50 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-rose-500">{meals.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Meals logged</p>
            <p className="text-xs text-rose-400">{Math.max(0, 3 - meals.length)} more needed</p>
          </div>
          <div className="bg-purple-50 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-purple-500">{symptoms.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Symptom logs</p>
            <p className="text-xs text-purple-400">{Math.max(0, 2 - symptoms.length)} more needed</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-semibold text-gray-800">Pattern analysis ready</p>
              <p className="text-xs text-gray-400">{meals.length} meals · {symptoms.length} symptom logs</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">
            Our AI will look across your meal history and symptom logs to surface patterns specific to your conditions — like which foods trigger fatigue or bloating.
          </p>
          {error && <p className="text-rose-500 text-xs mb-3">{error}</p>}
          <Button
            onClick={runAnalysis}
            className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold"
          >
            Analyse my patterns ✨
          </Button>
        </div>

        {/* Data summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-rose-50 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-rose-500">{meals.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Meals logged</p>
          </div>
          <div className="bg-purple-50 rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-purple-500">{symptoms.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Symptom logs</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Overview</p>
        <p className="text-sm text-gray-700 leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Positive pattern */}
      {analysis.positivePattern && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 px-4 py-4">
          <div className="flex gap-2">
            <span className="text-lg shrink-0">🌟</span>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                Something you're doing well
              </p>
              <p className="text-sm text-emerald-800">{analysis.positivePattern}</p>
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Patterns found
        </p>
        <div className="space-y-3">
          {analysis.insights.map((insight, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4">
              <p className="font-semibold text-gray-800 text-sm mb-1">{insight.pattern}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">{insight.explanation}</p>
              <div className="bg-amber-50 rounded-xl px-3 py-2">
                <p className="text-xs font-semibold text-amber-700 mb-0.5">💡 Suggestion</p>
                <p className="text-sm text-amber-900">{insight.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Focus for next week */}
      {analysis.focusForNextWeek && (
        <div className="bg-rose-50 rounded-2xl border border-rose-100 px-4 py-4">
          <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1.5">
            🎯 Focus for next week
          </p>
          <p className="text-sm text-rose-900">{analysis.focusForNextWeek}</p>
        </div>
      )}

      {/* Re-analyze */}
      <Button
        onClick={() => { setAnalysis(null); runAnalysis(); }}
        variant="outline"
        className="w-full h-10 rounded-xl border-gray-200 text-gray-500 text-sm"
      >
        Re-analyse
      </Button>

      <p className="text-xs text-gray-400 text-center">
        Based on {meals.length} meals and {symptoms.length} symptom logs
      </p>
    </div>
  );
}
