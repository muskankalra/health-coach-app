export type HealthCondition =
  | "pcos"
  | "insulin_resistance"
  | "weight_loss"
  | "high_cholesterol"
  | "general_health";

export type DietPreference =
  | "vegetarian"
  | "vegan"
  | "non_veg"
  | "eggetarian"
  | "no_preference";

export type CuisinePreference =
  | "indian"
  | "western"
  | "asian"
  | "mediterranean"
  | "mixed"
  | "no_preference";

export type LifestyleType = "sedentary" | "lightly_active" | "active";

export type MainGoal =
  | "better_periods"
  | "weight_loss"
  | "better_energy"
  | "reduce_cravings"
  | "improve_cholesterol"
  | "improve_insulin_sensitivity"
  | "general_health";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type MoodEnergy = "low" | "okay" | "good";

export interface UserProfile {
  name: string;
  age: number;
  conditions: HealthCondition[];
  dietPreference: DietPreference;
  cuisinePreference: CuisinePreference;
  lifestyle: LifestyleType;
  mainGoal: MainGoal;
  onboardingComplete: boolean;
}

export interface MealFeedback {
  summary: string;
  whatsGood: string[];
  improvements: string[];
  conditionAwareFeedback: string[];
  betterVersion: string;
  smallFix: string;
  gentleNote: string;
}

export interface MealLog {
  id: string;
  mealType: MealType;
  mealText: string;
  mood?: MoodEnergy;
  feedback: MealFeedback;
  timestamp: number;
}
