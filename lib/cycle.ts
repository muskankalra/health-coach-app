import { CyclePhase, CycleInfo } from "./types";

export interface PhaseInfo {
  phase: CyclePhase;
  dayOfCycle: number;
  daysUntilNextPhase: number;
  label: string;
  emoji: string;
  description: string;
  nutritionFocus: string[];
  avoidFocus: string[];
  energyLevel: "low" | "rising" | "peak" | "dropping";
}

const PHASE_DATA: Record<CyclePhase, Omit<PhaseInfo, "phase" | "dayOfCycle" | "daysUntilNextPhase">> = {
  menstrual: {
    label: "Menstrual Phase",
    emoji: "🌑",
    description: "Your body is shedding the uterine lining. Iron, warmth, and rest are your best friends right now.",
    nutritionFocus: [
      "Iron-rich foods — spinach, lentils, beetroot, dates",
      "Anti-inflammatory spices — turmeric, ginger, cinnamon",
      "Warm, cooked meals over raw/cold foods",
      "Dark chocolate (70%+) for magnesium and mood",
      "Omega-3s — flaxseeds, walnuts, fatty fish",
    ],
    avoidFocus: [
      "Excess salt — worsens bloating and cramps",
      "Caffeine and alcohol — can intensify cramps",
      "Processed sugary foods — spikes then crashes energy",
    ],
    energyLevel: "low",
  },
  follicular: {
    label: "Follicular Phase",
    emoji: "🌒",
    description: "Estrogen is rising, energy is coming back. Your metabolism is more efficient — great time to eat lighter and varied.",
    nutritionFocus: [
      "Fermented foods — yogurt, idli, dosa, kanji for gut health",
      "Light proteins — eggs, legumes, tofu, paneer",
      "Fresh fruits and salads — your digestion handles them well now",
      "Complex carbs — oats, quinoa, brown rice for sustained energy",
      "Seeds — flaxseeds and pumpkin seeds support estrogen balance",
    ],
    avoidFocus: [
      "Heavy, greasy meals — your gut is sensitive post-period",
      "Excess refined carbs — can disrupt rising estrogen balance",
    ],
    energyLevel: "rising",
  },
  ovulatory: {
    label: "Ovulatory Phase",
    emoji: "🌕",
    description: "Peak estrogen! You're at your highest energy. Focus on antioxidants and zinc to support ovulation.",
    nutritionFocus: [
      "Zinc-rich foods — pumpkin seeds, chickpeas, lentils",
      "Antioxidant-rich foods — berries, tomatoes, bell peppers",
      "Fiber-rich vegetables — support estrogen clearance",
      "Light, cooling foods — cucumber, coconut water, salads",
      "Sunflower seeds — support progesterone production",
    ],
    avoidFocus: [
      "Excess dairy — may increase estrogen dominance",
      "Heavy, processed meals — can cause inflammation at peak",
    ],
    energyLevel: "peak",
  },
  luteal: {
    label: "Luteal Phase",
    emoji: "🌘",
    description: "Progesterone rises then falls. PMS symptoms may appear. Magnesium, B6, and stable blood sugar are key.",
    nutritionFocus: [
      "Magnesium-rich foods — dark chocolate, spinach, almonds, bananas",
      "Vitamin B6 — chickpeas, potato, banana, sunflower seeds",
      "Protein at every meal — reduces cravings and mood swings",
      "Complex carbs — dal, sweet potato, oats for serotonin boost",
      "Calcium-rich foods — sesame seeds, dairy, ragi",
    ],
    avoidFocus: [
      "Sugar and refined carbs — worsens PMS and mood swings",
      "Caffeine — increases anxiety and disrupts sleep",
      "Excess salt — causes water retention and bloating",
      "Alcohol — depletes magnesium and B vitamins",
    ],
    energyLevel: "dropping",
  },
};

export function calculatePhase(cycleInfo: CycleInfo): PhaseInfo {
  const today = new Date();
  const lastPeriod = new Date(cycleInfo.lastPeriodDate);
  const daysSincePeriod = Math.floor(
    (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dayOfCycle = (daysSincePeriod % cycleInfo.cycleLength) + 1;

  let phase: CyclePhase;
  let daysUntilNextPhase: number;

  if (dayOfCycle <= 5) {
    phase = "menstrual";
    daysUntilNextPhase = 5 - dayOfCycle + 1;
  } else if (dayOfCycle <= 13) {
    phase = "follicular";
    daysUntilNextPhase = 13 - dayOfCycle + 1;
  } else if (dayOfCycle <= 16) {
    phase = "ovulatory";
    daysUntilNextPhase = 16 - dayOfCycle + 1;
  } else {
    phase = "luteal";
    daysUntilNextPhase = cycleInfo.cycleLength - dayOfCycle + 1;
  }

  return {
    phase,
    dayOfCycle,
    daysUntilNextPhase,
    ...PHASE_DATA[phase],
  };
}

export function getPhaseContext(cycleInfo: CycleInfo): string {
  const info = calculatePhase(cycleInfo);
  return `
MENSTRUAL CYCLE PHASE: ${info.label} (Day ${info.dayOfCycle} of cycle)
${info.description}
Nutrition focus for this phase: ${info.nutritionFocus.join(", ")}
Things to reduce: ${info.avoidFocus.join(", ")}
Energy level: ${info.energyLevel}
  `.trim();
}
