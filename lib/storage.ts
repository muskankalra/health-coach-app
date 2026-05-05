import { UserProfile, MealLog, CycleInfo, SymptomLog, DayLog } from "./types";

const PROFILE_KEY = "pcos_coach_profile";
const MEALS_KEY = "pcos_coach_meals";
const CYCLE_KEY = "pcos_coach_cycle";
const SYMPTOMS_KEY = "pcos_coach_symptoms";
const DAYS_KEY = "pcos_coach_days";

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveMeal(meal: MealLog): void {
  const meals = loadMeals();
  meals.unshift(meal);
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals.slice(0, 50)));
}

export function loadMeals(): MealLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(MEALS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as MealLog[];
  } catch {
    return [];
  }
}

export function saveCycleInfo(info: CycleInfo): void {
  localStorage.setItem(CYCLE_KEY, JSON.stringify(info));
}

export function loadCycleInfo(): CycleInfo | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CYCLE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CycleInfo;
  } catch {
    return null;
  }
}

export function saveSymptom(symptom: SymptomLog): void {
  const symptoms = loadSymptoms();
  symptoms.unshift(symptom);
  localStorage.setItem(SYMPTOMS_KEY, JSON.stringify(symptoms.slice(0, 100)));
}

export function loadSymptoms(): SymptomLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(SYMPTOMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SymptomLog[];
  } catch {
    return [];
  }
}

export function saveDayLog(day: DayLog): void {
  const days = loadDayLogs();
  days.unshift(day);
  localStorage.setItem(DAYS_KEY, JSON.stringify(days.slice(0, 30)));
}

export function loadDayLogs(): DayLog[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(DAYS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DayLog[];
  } catch {
    return [];
  }
}

export function clearAll(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MEALS_KEY);
  localStorage.removeItem(CYCLE_KEY);
  localStorage.removeItem(SYMPTOMS_KEY);
  localStorage.removeItem(DAYS_KEY);
}
