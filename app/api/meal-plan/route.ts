import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { UserProfile, MealLog, TomorrowPlan } from "@/lib/types";

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  active: 1.55,
};

function calcBMR(profile: UserProfile): { tdee: number; target: number } | null {
  if (!profile.weight || !profile.height) return null;
  const { weight, height, age, gender, lifestyle } = profile;
  // Mifflin-St Jeor
  const base = 10 * weight + 6.25 * height - 5 * age;
  const bmr = gender === "male" ? base + 5 : gender === "female" ? base - 161 : base - 78;
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[lifestyle] ?? 1.2));
  const target = tdee - 450; // ~0.5 kg/week deficit
  return { tdee, target };
}

function buildMealPlanPrompt(profile: UserProfile, recentMeals: MealLog[]): string {
  const mealHistory = recentMeals
    .slice(0, 10)
    .map(m => `- ${m.mealType}: ${m.mealText}`)
    .join("\n");

  const isWeightLoss = profile.conditions.includes("weight_loss") || profile.mainGoal === "weight_loss";
  const bmrData = isWeightLoss ? calcBMR(profile) : null;
  const calorieInstruction = bmrData
    ? `CALORIE TARGET (calculated from BMR): The user's TDEE is ${bmrData.tdee} kcal/day. For safe weight loss (0.5 kg/week), their daily target is ${bmrData.target} kcal. Distribute across meals: breakfast ~${Math.round(bmrData.target * 0.28)} kcal, lunch ~${Math.round(bmrData.target * 0.35)} kcal, dinner ~${Math.round(bmrData.target * 0.27)} kcal, snack ~${Math.round(bmrData.target * 0.10)} kcal. Show the exact calorie number for each meal.`
    : `Calorie estimates should be realistic for their gender (${profile.gender}) and lifestyle (${profile.lifestyle}).`;

  return `You are an expert nutrition coach. Create a personalized full-day meal plan for tomorrow.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}, Gender: ${profile.gender}
- Weight: ${profile.weight ? `${profile.weight} kg` : "not provided"}, Height: ${profile.height ? `${profile.height} cm` : "not provided"}
- Conditions: ${profile.conditions.join(", ")}
- Diet: ${profile.dietPreference}
- Cuisine preference: ${profile.cuisinePreference}
- Lifestyle: ${profile.lifestyle}
- Main goal: ${profile.mainGoal}

RECENT MEALS (avoid too much repetition, ensure nutritional balance):
${mealHistory || "No recent meals logged"}

${calorieInstruction}

MEAL PLAN RULES:
- Tailor every meal specifically to their health conditions AND gender (male vs female nutritional needs differ significantly)
- For females: account for hormonal fluctuations, iron needs, PCOS considerations if relevant
- For males: higher protein requirements, different calorie targets
- For PCOS/insulin resistance: emphasize protein + fiber, avoid refined carbs alone
- For high cholesterol: emphasize soluble fiber, healthy fats, minimal saturated fat
- For weight loss: high satiety, protein-rich, fiber-rich meals that hit the calorie target above
- Keep meals realistic, culturally appropriate, and delicious
- Suggest Indian meals if cuisine preference is Indian
- Include a healthy snack option
- Do NOT repeat what they recently ate
- Every meal must have a clear "why" explaining the condition-specific benefit
- List actual ingredients so they know what to buy/prep
- Recipe steps must be practical, home-cook friendly, under 6 steps

CULINARY REALISM (strictly follow):
- Only suggest real dishes that people actually cook and eat
- Ingredients must belong together naturally
- Steps must reflect how the dish is actually made

Respond with ONLY a valid JSON object — no markdown, no code fences:
{
  "intro": "A warm 1-2 sentence intro personalizing the plan to their specific situation today",
  "breakfast": {
    "meal": "Name of the meal (e.g. Moong Dal Chilla with mint chutney)",
    "why": "Why this is great for their specific conditions (1-2 sentences)",
    "calories": "~350 kcal",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "recipe": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
  },
  "lunch": {
    "meal": "Name of the meal",
    "why": "Why this works for their conditions",
    "calories": "~500 kcal",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "recipe": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
  },
  "dinner": {
    "meal": "Name of the meal",
    "why": "Why this is a good dinner for their conditions",
    "calories": "~400 kcal",
    "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
    "recipe": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
  },
  "snack": {
    "meal": "A healthy snack option",
    "why": "Why this snack supports their goals",
    "calories": "~150 kcal",
    "ingredients": ["ingredient 1", "ingredient 2"],
    "recipe": ["Step 1: ...", "Step 2: ..."]
  },
  "generalTip": "One powerful nutrition tip for tomorrow specific to their conditions"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userProfile, recentMeals } = await req.json();

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    const prompt = buildMealPlanPrompt(userProfile as UserProfile, recentMeals as MealLog[]);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "";
    const plan: TomorrowPlan = JSON.parse(content);
    return NextResponse.json(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Meal plan error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
