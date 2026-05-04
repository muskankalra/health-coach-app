# 🌿 Condition-Aware AI Health Coach

A mobile-first web app that gives personalized nutrition feedback based on your health conditions. Log a meal in plain text and get immediate, condition-aware AI guidance — no calorie obsession, no shame.

**Supported conditions:** PCOS · Insulin Resistance · Weight Loss · High Cholesterol · General Health

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up your OpenAI key (optional)

Copy the example env file and add your key:

```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your OpenAI API key. If you leave it empty, the app runs with mock feedback — everything still works.

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

---

## How it works

1. **Onboarding** — Enter your name, age, health conditions, diet/cuisine preferences, lifestyle, and main goal. Saved to localStorage.
2. **Home screen** — See your conditions, today's health focus tip, and a meal logger.
3. **Log a meal** — Type what you ate (e.g. "poha and chai", "pasta with chicken") and hit Analyze.
4. **AI feedback** — Get structured feedback: what's good, what to improve, condition-specific insights, a better version of the meal, and one small fix.
5. **History** — View all past meal logs and feedback, expandable on tap.

---

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** (Button, Card, Badge, Textarea)
- **OpenAI API** (`gpt-4o-mini`) with mock fallback
- **localStorage** (no database needed for MVP)

---

## API

### `POST /api/analyze-meal`

**Request body:**
```json
{
  "userProfile": { ... },
  "mealType": "breakfast",
  "mealText": "poha and chai",
  "mood": "okay"
}
```

**Response:**
```json
{
  "summary": "...",
  "whatsGood": ["..."],
  "improvements": ["..."],
  "conditionAwareFeedback": ["..."],
  "betterVersion": "...",
  "smallFix": "...",
  "gentleNote": "..."
}
```

---

## Disclaimer

This app provides general wellness guidance, not medical advice. Always consult a qualified healthcare provider for medical decisions.
