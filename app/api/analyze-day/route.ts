import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { UserProfile, DayMealEntry, DayAnalysis, HealthCondition } from "@/lib/types";

const CONDITION_CONTEXT: Record<HealthCondition, string> = {
  pcos: `PCOS: Prioritize blood sugar stability throughout the day. Look for: protein+fiber pairing at each meal, anti-inflammatory foods, avoiding refined carbs alone. Flag anything that could spike insulin. Use language like "PCOS-supportive", "blood-sugar-friendly".`,
  insulin_resistance: `Insulin Resistance: Glycemic load is critical. Every carb meal must be paired with protein/fat/fiber. Flag high-GI foods eaten alone. Note portion sizes of starchy foods. Use "blood-sugar-friendly", "helps insulin sensitivity".`,
  weight_loss: `Weight Loss: Assess satiety — protein and fiber keep hunger low. Flag low-protein or low-fiber meals. Note calorie density vs nutrient density. Encourage sustainable choices, not restriction.`,
  high_cholesterol: `High Cholesterol: Look for saturated fat (fried foods, full-fat dairy, processed meat) and flag it. Celebrate fiber, healthy fats (nuts, olive oil), whole grains. Use "heart-friendly", "cholesterol-conscious".`,
  general_health: `General Health: Look for overall balance — variety, protein, fiber, healthy fats. Keep advice practical and encouraging.`,
};

function buildDayPrompt(profile: UserProfile, meals: DayMealEntry[], cycleContext?: string): string {
  const conditionContexts = profile.conditions.map(c => CONDITION_CONTEXT[c]).join("\n");
  const mealList = meals.map(m => `- ${m.mealType.toUpperCase()}: ${m.mealText}`).join("\n");

  return `You are an expert nutrition coach doing a full-day meal review. Analyse all meals together as a complete picture of the day.

USER PROFILE:
- Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
- Conditions: ${profile.conditions.join(", ")}
- Diet: ${profile.dietPreference}, Cuisine: ${profile.cuisinePreference}
- Lifestyle: ${profile.lifestyle}, Goal: ${profile.mainGoal}
${cycleContext ? `\nCYCLE CONTEXT:\n${cycleContext}` : ""}

CONDITION-SPECIFIC LENS (apply ALL of these rigorously):
${conditionContexts}

TODAY'S MEALS:
${mealList}

ANALYSIS RULES:
- Analyse meals TOGETHER — patterns across the day matter (e.g. all carbs, no protein, skipped meals)
- Be condition-specific and concrete — name the actual foods, explain exactly why they help or hurt
- dayScore should reflect the overall nutritional quality for their specific conditions (e.g. "7/10 — Good protein intake but heavy on refined carbs")
- tomorrowPlan must DIRECTLY contrast today — if they had heavy carbs, suggest a protein-first tomorrow; if they skipped vegetables, make tomorrow vegetable-rich. Be SPECIFIC with meal names.
- Never shame. Always warm and encouraging.

CULINARY REALISM RULES (CRITICAL — follow strictly):
- ONLY suggest food combinations that people actually cook and eat together in real life. Never suggest adding a raw ingredient to a dish where it makes no culinary sense (e.g. do NOT say "add spinach to dahi", "add flaxseeds to chai", "sprinkle turmeric on fruit").
- When suggesting adding a vegetable or protein, always specify a realistic method: as a separate side dish (e.g. "have a small kachumber salad on the side"), as a swap for an ingredient (e.g. "use whole wheat roti instead of maida"), or as a recipe change (e.g. "make palak paneer instead of regular paneer").
- betterVersion must be a real dish or a realistic version of the original — not a Frankenstein combination. E.g. if someone had "poha", a better version is "poha with peanuts and a boiled egg on the side", NOT "poha with added spinach and flaxseed powder".
- smallFix must be something a home cook can realistically do: adding a side dish, drinking water before the meal, swapping one ingredient, reducing portion of one item. Never suggest mixing ingredients that don't belong together.
- For Indian cuisine: respect traditional pairings. Dal goes with rice or roti. Dahi goes with meals as a side. Vegetables are cooked as sabji or added to dal — not raw-tossed into everything. Suggest nuts/seeds only as a snack or garnish where appropriate.
- If you're unsure whether a combination is culinarily realistic, choose a safer suggestion like "have a handful of almonds as a snack" or "add a side salad" instead.

Respond with ONLY a valid JSON object — no markdown, no code fences:
{
  "overallSummary": "2-3 sentences on how the day looks overall for their specific conditions",
  "dayScore": "X/10 — one-line explanation tailored to their conditions",
  "meals": [
    {
      "mealType": "breakfast",
      "mealText": "exact meal text",
      "feedback": {
        "summary": "1-2 sentences on this specific meal",
        "whatsGood": ["specific good points with WHY"],
        "improvements": ["specific improvements with WHY it matters for their condition"],
        "conditionAwareFeedback": ["condition-specific insight for this meal"],
        "betterVersion": "concrete upgraded version of this exact meal",
        "smallFix": "one ultra-specific fix",
        "tomorrowTip": "",
        "gentleNote": ""
      }
    }
  ],
  "dayPatterns": ["2-3 patterns noticed across the whole day — e.g. 'No protein at breakfast or lunch', 'Good fiber intake overall'"],
  "tomorrowPlan": "Specific tomorrow guidance directly contrasting today's gaps — name actual meals/foods, e.g. 'Start with moong dal chilla for protein since today was carb-heavy. Have rajma rice for lunch with a big salad. Keep dinner light with dal soup and vegetables.'",
  "gentleNote": "Warm closing line celebrating today's effort"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userProfile, meals, cycleContext } = await req.json();

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });

    const groq = new Groq({ apiKey });
    const prompt = buildDayPrompt(userProfile as UserProfile, meals as DayMealEntry[], cycleContext);

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "";
    const analysis: DayAnalysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Day analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
