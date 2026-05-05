import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { MealLog, SymptomLog, UserProfile, PatternAnalysis } from "@/lib/types";

function buildPatternPrompt(
  profile: UserProfile,
  meals: MealLog[],
  symptoms: SymptomLog[]
): string {
  const mealSummary = meals
    .slice(0, 20)
    .map((m) => {
      const date = new Date(m.timestamp).toLocaleDateString();
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return `[${date} ${time}] ${m.mealType}: "${m.mealText}"${m.mood ? ` (felt ${m.mood})` : ""}`;
    })
    .join("\n");

  const symptomSummary = symptoms
    .slice(0, 30)
    .map((s) => {
      const date = new Date(s.timestamp).toLocaleDateString();
      const time = new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const severityLabel = s.severity === 1 ? "mild" : s.severity === 2 ? "moderate" : "severe";
      return `[${date} ${time}] ${severityLabel}: ${s.symptoms.join(", ")}${s.notes ? ` — "${s.notes}"` : ""}`;
    })
    .join("\n");

  return `You are an expert nutrition and wellness coach analyzing a user's meal and symptom data to find meaningful health patterns.

USER PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}
- Conditions: ${profile.conditions.join(", ")}
- Diet: ${profile.dietPreference}
- Main goal: ${profile.mainGoal}

MEAL LOG (most recent first):
${mealSummary || "No meals logged yet"}

SYMPTOM LOG (most recent first):
${symptomSummary || "No symptoms logged yet"}

TASK:
Analyze the meal and symptom data to find real, specific patterns. Look for:
- Time-based patterns (e.g. symptoms appearing hours after certain meals)
- Nutritional patterns (e.g. symptoms after high-carb meals, feeling better after protein-rich meals)
- Condition-specific patterns (relevant to their conditions: ${profile.conditions.join(", ")})
- Positive patterns worth reinforcing
- Missing nutrients or food groups

Be honest but kind. If there's not enough data, say so warmly and encourage them to keep logging.
Do NOT make up patterns if the data doesn't support them.

Respond with ONLY a valid JSON object — no markdown, no code fences:
{
  "summary": "2-3 sentences summarizing the overall picture from the data — warm and honest",
  "insights": [
    {
      "pattern": "Short title of the pattern found",
      "explanation": "What the data shows and why this matters for their specific condition",
      "suggestion": "A specific, actionable recommendation based on this pattern"
    }
  ],
  "positivePattern": "One positive habit or pattern you notice worth celebrating",
  "focusForNextWeek": "The single most impactful thing they should focus on next week based on this data"
}

Include 2-4 insights. If data is insufficient, include 1 insight encouraging more logging.`;
}

export async function POST(req: NextRequest) {
  try {
    const { userProfile, meals, symptoms } = await req.json();

    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY missing" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });
    const prompt = buildPatternPrompt(
      userProfile as UserProfile,
      meals as MealLog[],
      symptoms as SymptomLog[]
    );

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "";
    const analysis: PatternAnalysis = JSON.parse(content);
    return NextResponse.json(analysis);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Pattern analysis error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
