import { UserProfile, MealLog } from "./types";

const PROFILE_KEY = "pcos_coach_profile";
const MEALS_KEY = "pcos_coach_meals";

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

export function clearAll(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(MEALS_KEY);
}
