"use client";

import { useState } from "react";
import { SymptomType, SymptomLog } from "@/lib/types";
import { saveSymptom } from "@/lib/storage";
import { Button } from "@/components/ui/button";

interface SymptomLoggerProps {
  onLogged: (symptom: SymptomLog) => void;
}

const SYMPTOMS: { key: SymptomType; label: string; emoji: string }[] = [
  { key: "bloating", label: "Bloating", emoji: "🫧" },
  { key: "fatigue", label: "Fatigue", emoji: "😴" },
  { key: "cramps", label: "Cramps", emoji: "⚡" },
  { key: "mood_swings", label: "Mood swings", emoji: "🌊" },
  { key: "cravings", label: "Cravings", emoji: "🍫" },
  { key: "acne", label: "Acne", emoji: "😣" },
  { key: "headache", label: "Headache", emoji: "🤕" },
  { key: "low_energy", label: "Low energy", emoji: "🔋" },
  { key: "brain_fog", label: "Brain fog", emoji: "🌫️" },
  { key: "nausea", label: "Nausea", emoji: "🤢" },
];

const SEVERITY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Mild", color: "bg-green-100 text-green-700 border-green-300" },
  2: { label: "Moderate", color: "bg-amber-100 text-amber-700 border-amber-300" },
  3: { label: "Severe", color: "bg-red-100 text-red-700 border-red-300" },
};

export default function SymptomLogger({ onLogged }: SymptomLoggerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SymptomType[]>([]);
  const [severity, setSeverity] = useState<1 | 2 | 3>(1);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  function toggle(s: SymptomType) {
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleSave() {
    if (selected.length === 0) return;
    const log: SymptomLog = {
      id: Date.now().toString(),
      symptoms: selected,
      severity,
      notes: notes.trim() || undefined,
      timestamp: Date.now(),
    };
    saveSymptom(log);
    onLogged(log);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
      setSelected([]);
      setSeverity(1);
      setNotes("");
    }, 1500);
  }

  if (saved) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 text-center">
        <p className="text-2xl mb-1">✅</p>
        <p className="text-sm font-medium text-gray-700">Symptoms logged!</p>
        <p className="text-xs text-gray-400 mt-0.5">We'll use this to find patterns over time</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5 text-left hover:border-rose-200 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800 text-sm">Log symptoms</p>
            <p className="text-xs text-gray-400 mt-0.5">Track how you're feeling today</p>
          </div>
          <span className="text-xl">🩺</span>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-gray-50 flex items-center justify-between">
        <p className="font-semibold text-gray-800 text-sm">How are you feeling?</p>
        <button onClick={() => setOpen(false)} className="text-gray-400 text-xl leading-none">×</button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Symptom grid */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Select all that apply
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SYMPTOMS.map(({ key, label, emoji }) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${
                  selected.includes(key)
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-rose-200"
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        {selected.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Overall severity
            </p>
            <div className="flex gap-2">
              {([1, 2, 3] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    severity === s
                      ? SEVERITY_LABELS[s].color + " border-current"
                      : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
                  }`}
                >
                  {SEVERITY_LABELS[s].label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Optional notes */}
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-2">
            Notes <span className="text-gray-400 normal-case">(optional)</span>
          </label>
          <textarea
            placeholder="e.g. cramps started after lunch, feeling very tired..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder-gray-400"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={selected.length === 0}
          className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white font-semibold text-sm"
        >
          Save symptoms
        </Button>
      </div>
    </div>
  );
}
