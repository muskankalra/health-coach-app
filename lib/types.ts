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

export type Gender = "male" | "female" | "other";

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

export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export interface CycleInfo {
  lastPeriodDate: string; // ISO date string YYYY-MM-DD
  cycleLength: number;    // average cycle length in days
}

export type SymptomType =
  | "bloating"
  | "fatigue"
  | "cramps"
  | "mood_swings"
  | "cravings"
  | "acne"
  | "headache"
  | "low_energy"
  | "brain_fog"
  | "nausea";

export interface SymptomLog {
  id: string;
  symptoms: SymptomType[];
  notes?: string;
  severity: 1 | 2 | 3; // 1=mild, 2=moderate, 3=severe
  timestamp: number;
}

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  weight?: number; // kg
  height?: number; // cm
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
  tomorrowTip: string;
  gentleNote: string;
}

export interface MealPlanItem {
  meal: string;
  why: string;
  calories: string;
  ingredients: string[];
  recipe: string[];
}

export interface TomorrowPlan {
  intro: string;
  breakfast: MealPlanItem;
  lunch: MealPlanItem;
  dinner: MealPlanItem;
  snack: MealPlanItem;
  generalTip: string;
}

export interface MealLog {
  id: string;
  mealType: MealType;
  mealText: string;
  mood?: MoodEnergy;
  feedback: MealFeedback;
  timestamp: number;
}

export interface DayMealEntry {
  mealType: MealType;
  mealText: string;
}

export interface DayMealFeedback {
  mealType: MealType;
  mealText: string;
  feedback: MealFeedback;
}

export interface DayAnalysis {
  overallSummary: string;
  dayScore: string;
  meals: DayMealFeedback[];
  dayPatterns: string[];
  tomorrowPlan: string;
  gentleNote: string;
}

export interface DayLog {
  id: string;
  meals: DayMealEntry[];
  analysis: DayAnalysis;
  timestamp: number;
}

export interface PatternInsight {
  pattern: string;
  explanation: string;
  suggestion: string;
}

export interface PatternAnalysis {
  summary: string;
  insights: PatternInsight[];
  positivePattern: string;
  focusForNextWeek: string;
}
