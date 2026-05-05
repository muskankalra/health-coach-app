import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { UserProfile, MealPlanItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { userProfile, mealKey, dislikedMeal, otherMeals, calorieTarget } = await req.json();

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });

    const profile = userProfile as UserProfile;
    const otherMealsList = Object.entries(otherMeals as Record<string, { meal: string }>)
      .map(([key, val]) => `- ${key}: ${val.meal}`)
      .join("\n");

    const calorieNote = calorieTarget
      ? `Target calories for this ${mealKey}: ~${calorieTarget} kcal`
      : "";

    const prompt = `You are an expert nutrition coach. The user doesn't like the suggested ${mealKey} and wants an alternative.

USER PROFILE:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Conditions: ${profile.conditions.join(", ")}
- Diet: ${profile.dietPreference}, Cuisine: ${profile.cuisinePreference}
- Lifestyle: ${profile.lifestyle}, Goal: ${profile.mainGoal}

MEAL THEY DIDN'T LIKE (${mealKey}): ${dislikedMeal}
${calorieNote}

OTHER MEALS ALREADY IN THEIR PLAN (don't repeat these):
${otherMealsList || "None"}

YOUR TASK:
Suggest a completely different ${mealKey} that:
- Is NOT similar to "${dislikedMeal}"
- Is appropriate for their health conditions
- Fits their diet and cuisine preference
- Is culinarily realistic — only real dishes people actually cook and eat
- Has realistic calorie estimate${calorieTarget ? ` close to ${calorieTarget} kcal` : ""}
- Comes with a short recipe (max 5 steps)

Respond with ONLY a valid JSON object — no markdown, no code fences:
{
  "meal": "Name of the alternative meal",
  "why": "Why this is a great ${mealKey} for their conditions (1-2 sentences)",
  "calories": "~XXX kcal",
  "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
  "recipe": ["Step 1: ...", "Step 2: ...", "Step 3: ..."]
}`;

    const groq = new Groq({ apiKey });
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "";
    const meal: MealPlanItem = JSON.parse(content);
    return NextResponse.json(meal);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Swap meal error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
