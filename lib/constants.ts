import {
  HealthCondition,
  DietPreference,
  CuisinePreference,
  LifestyleType,
  MainGoal,
  MealType,
  MoodEnergy,
} from "./types";

export const CONDITION_LABELS: Record<HealthCondition, string> = {
  pcos: "PCOS",
  insulin_resistance: "Insulin Resistance",
  weight_loss: "Weight Loss",
  high_cholesterol: "High Cholesterol",
  general_health: "General Health",
};

export const DIET_LABELS: Record<DietPreference, string> = {
  vegetarian: "Vegetarian",
  vegan: "Vegan",
  non_veg: "Non-Vegetarian",
  eggetarian: "Eggetarian",
  no_preference: "No Preference",
};

export const CUISINE_LABELS: Record<CuisinePreference, string> = {
  indian: "Indian",
  western: "Western",
  asian: "Asian",
  mediterranean: "Mediterranean",
  mixed: "Mixed",
  no_preference: "No Preference",
};

export const LIFESTYLE_LABELS: Record<LifestyleType, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  active: "Active",
};

export const GOAL_LABELS: Record<MainGoal, string> = {
  better_periods: "Better Periods",
  weight_loss: "Weight Loss",
  better_energy: "Better Energy",
  reduce_cravings: "Reduce Cravings",
  improve_cholesterol: "Improve Cholesterol",
  improve_insulin_sensitivity: "Improve Insulin Sensitivity",
  general_health: "General Health",
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const MOOD_LABELS: Record<MoodEnergy, string> = {
  low: "Low energy",
  okay: "Okay",
  good: "Feeling good",
};

export const HEALTH_FOCUS: Record<HealthCondition, string[]> = {
  pcos: [
    "Focus on protein + fiber at every meal today",
    "Keep blood sugar steady — eat every 3-4 hours",
    "Anti-inflammatory foods are your best friend",
    "Stay hydrated — aim for 8 glasses today",
  ],
  insulin_resistance: [
    "Pair carbs with protein or fat to slow sugar spikes",
    "Avoid eating carbs alone today",
    "A 10-minute walk after meals can help your insulin",
    "Choose whole grains over refined ones today",
  ],
  weight_loss: [
    "Prioritize protein — it keeps you full longer",
    "Fill half your plate with vegetables today",
    "Eat slowly and mindfully",
    "Hydrate before meals to avoid false hunger",
  ],
  high_cholesterol: [
    "Add fiber-rich foods — oats, lentils, vegetables",
    "Choose healthy fats today — avocado, nuts, olive oil",
    "Limit fried and processed foods",
    "Seeds and nuts are great heart-healthy snacks",
  ],
  general_health: [
    "Eat the rainbow — try 3 different colored vegetables today",
    "Balance your plate: protein, carbs, and healthy fat",
    "Stay hydrated throughout the day",
    "A nourishing meal is self-care",
  ],
};
