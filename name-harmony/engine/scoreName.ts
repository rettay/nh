// engine/scoreName.ts

import { phoneticHarmony } from "./modules/phoneticHarmony";
import { phoneticFlowWithSurname } from "./modules/phoneticFlow";
import { culturalCoherence } from "./modules/culturalCoherence";
import { emotionalResonance } from "./modules/emotionalResonance";
import { distinctiveness } from "./modules/distinctiveness";
import { pronounceability } from "./modules/pronounceability";
import { US_ENGLISH_NAMES } from "@/data/names_us_english";
import { CULTURE_PROFILES } from "@/engine/data/cultureProfiles";

export function scoreName(
  first: string,
  last: string,
  cultureBlend: Record<string, number> = { us_english: 1.0 },
  gender: string = "unknown",
  subjectType: "person" | "pet" | "product" | "fantasy" = "person"
): {
  score: number;
  breakdown: Record<string, string>;
} {
  const breakdown: Record<string, string> = {};
  let totalScore = 0;

  // Weights by subject type
  const weights = {
    phoneticHarmony: 0.2,
    phoneticFlow: 0.15,
    culturalCoherence: 0.2,
    emotionalResonance: 0.15,
    distinctiveness: 0.15,
    pronounceability: 0.15,
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  // Phonetic Harmony
  const harmony = phoneticHarmony(first);
  totalScore += harmony * weights.phoneticHarmony;
  breakdown["Phonetic Harmony"] = `+${(harmony * 10).toFixed(1)} — Sound structure`;

  // Phonetic Flow with Surname
  const flow = phoneticFlowWithSurname(first, last);
  totalScore += flow * weights.phoneticFlow;
  breakdown["Phonetic Flow"] = `+${(flow * 10).toFixed(1)} — Transition with surname`;

  // Cultural Coherence
  const cultureScore = culturalCoherence(first, cultureBlend, { gender });
  totalScore += cultureScore * weights.culturalCoherence;
  breakdown["Cultural Coherence"] = `+${(cultureScore * 10).toFixed(1)} — Fit with cultural norms`;

  // Emotional Resonance
  const emotion = emotionalResonance(first);
  totalScore += emotion * weights.emotionalResonance;
  breakdown["Emotional Resonance"] = `+${(emotion * 10).toFixed(1)} — Aesthetic appeal`;

  // Distinctiveness
  const distinct = distinctiveness(first, US_ENGLISH_NAMES);
  totalScore += distinct * weights.distinctiveness;
  breakdown["Distinctiveness"] = `+${(distinct * 10).toFixed(1)} — Uniqueness`;

  // Pronounceability
  const pronounce = pronounceability(first);
  totalScore += pronounce * weights.pronounceability;
  breakdown["Pronounceability"] = `+${(pronounce * 10).toFixed(1)} — Ease of pronunciation`;

  // Normalize to 0–100 scale
  const normalizedScore = Math.round((totalScore / totalWeight) * 100);

  return {
    score: normalizedScore,
    breakdown
  };
}