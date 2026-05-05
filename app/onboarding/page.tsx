"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "@/lib/storage";
import {
  UserProfile, HealthCondition, DietPreference,
  CuisinePreference, LifestyleType, MainGoal,
} from "@/lib/types";
import {
  CONDITION_LABELS, DIET_LABELS, CUISINE_LABELS,
  LIFESTYLE_LABELS, GOAL_LABELS,
} from "@/lib/constants";

const CONDITIONS = Object.keys(CONDITION_LABELS) as HealthCondition[];
const DIETS = Object.keys(DIET_LABELS) as DietPreference[];
const CUISINES = Object.keys(CUISINE_LABELS) as CuisinePreference[];
const LIFESTYLES = Object.keys(LIFESTYLE_LABELS) as LifestyleType[];
const GOALS = Object.keys(GOAL_LABELS) as MainGoal[];

const STEPS = ["basics", "conditions", "preferences", "goal"] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, { title: string; sub: string }> = {
  basics: { title: "Tell us about you", sub: "We'll personalise everything to your body and goals" },
  conditions: { title: "What are you managing?", sub: "Select all that apply — your advice adapts to each" },
  preferences: { title: "Your food world", sub: "So we suggest meals you'll actually enjoy" },
  goal: { title: "Your main focus", sub: "We'll build your plan around this" },
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("basics");
  const [form, setForm] = useState<Partial<UserProfile & { weight: string; height: string }>>({ conditions: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentIndex = STEPS.indexOf(step);
  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === "basics") {
      if (!form.name?.trim()) e.name = "Required";
      if (!form.age || form.age < 10 || form.age > 100) e.age = "Enter a valid age";
      if (!form.gender) e.gender = "Required";
    }
    if (step === "conditions" && !form.conditions?.length) e.conditions = "Pick at least one";
    if (step === "preferences") {
      if (!form.dietPreference) e.diet = "Required";
      if (!form.cuisinePreference) e.cuisine = "Required";
      if (!form.lifestyle) e.lifestyle = "Required";
    }
    if (step === "goal" && !form.mainGoal) e.goal = "Pick your focus";
    setErrors(e);
    return !Object.keys(e).length;
  }

  function next() {
    if (!validateStep()) return;
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
    else handleSubmit();
  }

  function handleSubmit() {
    const rawForm = form as any;
    const profile: UserProfile = {
      name: form.name!,
      age: form.age!,
      gender: form.gender!,
      weight: rawForm.weight ? parseFloat(rawForm.weight) : undefined,
      height: rawForm.height ? parseFloat(rawForm.height) : undefined,
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
    setForm(prev => {
      const cur = prev.conditions ?? [];
      return { ...prev, conditions: cur.includes(c) ? cur.filter(x => x !== c) : [...cur, c] };
    });
  }

  const { title, sub } = STEP_TITLES[step];

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full px-5 py-8">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg btn-neon flex items-center justify-center text-white text-sm font-bold">H</div>
          <span className="text-white/60 text-sm font-medium tracking-wider uppercase">Health Coach</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-white/30 mb-2">
            <span>Step {currentIndex + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-0.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff2d78, #7b2ff7)" }}
            />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-white/40 text-sm">{sub}</p>
        </div>

        {/* BASICS */}
        {step === "basics" && (
          <div className="space-y-4 flex-1">
            <Field label="Your name" error={errors.name}>
              <input
                type="text" placeholder="e.g. Priya"
                value={form.name ?? ""}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="input-dark"
              />
            </Field>
            <Field label="Age" error={errors.age}>
              <input
                type="number" placeholder="e.g. 27"
                value={form.age ?? ""}
                onChange={e => setForm({ ...form, age: parseInt(e.target.value) || undefined })}
                className="input-dark"
              />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <div className="grid grid-cols-3 gap-2">
                {(["female", "male", "other"] as const).map(g => (
                  <button key={g} type="button"
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                      form.gender === g
                        ? "border-pink-500/60 bg-pink-500/10 text-white"
                        : "border-white/8 glass text-white/50 hover:border-white/20"
                    }`}>
                    {g === "female" ? "👩 Female" : g === "male" ? "👨 Male" : "🧑 Other"}
                  </button>
                ))}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Weight (kg)" error="">
                <input
                  type="number" placeholder="e.g. 62"
                  value={(form as any).weight ?? ""}
                  onChange={e => setForm({ ...form, weight: e.target.value } as any)}
                  className="input-dark"
                />
              </Field>
              <Field label="Height (cm)" error="">
                <input
                  type="number" placeholder="e.g. 163"
                  value={(form as any).height ?? ""}
                  onChange={e => setForm({ ...form, height: e.target.value } as any)}
                  className="input-dark"
                />
              </Field>
            </div>
          </div>
        )}

        {/* CONDITIONS */}
        {step === "conditions" && (
          <div className="flex-1">
            {errors.conditions && <p className="text-pink-400 text-xs mb-3">{errors.conditions}</p>}
            <div className="space-y-2.5">
              {CONDITIONS.map(c => {
                const selected = form.conditions?.includes(c);
                const icons: Record<HealthCondition, string> = {
                  pcos: "🌸", insulin_resistance: "🩸", weight_loss: "⚖️",
                  high_cholesterol: "❤️", general_health: "✨",
                };
                return (
                  <button key={c} onClick={() => toggleCondition(c)}
                    className={`w-full text-left px-4 py-4 rounded-2xl border transition-all flex items-center justify-between ${
                      selected
                        ? "border-pink-500/60 bg-pink-500/10 text-white"
                        : "border-white/8 glass text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{icons[c]}</span>
                      <span className="font-medium text-sm">{CONDITION_LABELS[c]}</span>
                    </span>
                    {selected && (
                      <span className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {step === "preferences" && (
          <div className="space-y-5 flex-1">
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2.5">Diet</p>
              <div className="grid grid-cols-2 gap-2">
                {DIETS.map(d => (
                  <button key={d} onClick={() => setForm({ ...form, dietPreference: d })}
                    className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                      form.dietPreference === d
                        ? "border-violet-500/60 bg-violet-500/10 text-white"
                        : "border-white/8 glass text-white/50 hover:border-white/20"
                    }`}
                  >{DIET_LABELS[d]}</button>
                ))}
              </div>
              {errors.diet && <p className="text-pink-400 text-xs mt-1">{errors.diet}</p>}
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2.5">Cuisine</p>
              <div className="grid grid-cols-2 gap-2">
                {CUISINES.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, cuisinePreference: c })}
                    className={`py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                      form.cuisinePreference === c
                        ? "border-violet-500/60 bg-violet-500/10 text-white"
                        : "border-white/8 glass text-white/50 hover:border-white/20"
                    }`}
                  >{CUISINE_LABELS[c]}</button>
                ))}
              </div>
              {errors.cuisine && <p className="text-pink-400 text-xs mt-1">{errors.cuisine}</p>}
            </div>
            <div>
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2.5">Activity level</p>
              <div className="space-y-2">
                {LIFESTYLES.map(l => (
                  <button key={l} onClick={() => setForm({ ...form, lifestyle: l })}
                    className={`w-full text-left py-3 px-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-3 ${
                      form.lifestyle === l
                        ? "border-violet-500/60 bg-violet-500/10 text-white"
                        : "border-white/8 glass text-white/50 hover:border-white/20"
                    }`}
                  >
                    <span>{l === "sedentary" ? "🪑" : l === "lightly_active" ? "🚶" : "🏃"}</span>
                    {LIFESTYLE_LABELS[l]}
                  </button>
                ))}
              </div>
              {errors.lifestyle && <p className="text-pink-400 text-xs mt-1">{errors.lifestyle}</p>}
            </div>
          </div>
        )}

        {/* GOAL */}
        {step === "goal" && (
          <div className="flex-1">
            {errors.goal && <p className="text-pink-400 text-xs mb-3">{errors.goal}</p>}
            <div className="space-y-2.5">
              {GOALS.map(g => {
                const icons: Record<MainGoal, string> = {
                  better_periods: "🌸", weight_loss: "⚖️", better_energy: "⚡",
                  reduce_cravings: "🍫", improve_cholesterol: "❤️",
                  improve_insulin_sensitivity: "🩸", general_health: "✨",
                };
                return (
                  <button key={g} onClick={() => setForm({ ...form, mainGoal: g })}
                    className={`w-full text-left px-4 py-4 rounded-2xl border transition-all flex items-center gap-3 ${
                      form.mainGoal === g
                        ? "border-pink-500/60 bg-pink-500/10 text-white"
                        : "border-white/8 glass text-white/60 hover:border-white/20"
                    }`}
                  >
                    <span className="text-xl">{icons[g]}</span>
                    <span className="font-medium text-sm">{GOAL_LABELS[g]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex gap-3">
          {currentIndex > 0 && (
            <button
              onClick={() => setStep(STEPS[currentIndex - 1])}
              className="flex-1 h-13 rounded-2xl border border-white/10 text-white/50 text-sm font-medium hover:border-white/20 transition-all py-3.5"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 h-13 btn-neon rounded-2xl text-white font-semibold text-base py-3.5"
          >
            {currentIndex === STEPS.length - 1 ? "Let's go ✦" : "Continue →"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .input-dark {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: white;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-dark::placeholder { color: rgba(255,255,255,0.25); }
        .input-dark:focus { border-color: rgba(255,45,120,0.5); }
        .border-white\/8 { border-color: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">{label}</label>
      {children}
      {error && <p className="text-pink-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
