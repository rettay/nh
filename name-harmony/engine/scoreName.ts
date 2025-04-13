// engine/scoreName.ts

import { CULTURE_PROFILES } from "@/engine/data/cultureProfiles";

export function scoreName(
  first: string,
  last: string,
  culture: string = "us_english",
  gender: string = "unknown"
): {
  score: number;
  breakdown: Record<string, string>;
} {
  const breakdown: Record<string, string> = {};
  let score = 0;

  const fullName = `${first} ${last}`.toLowerCase();
  const profile = CULTURE_PROFILES[culture];

  // Common Ending
  if (profile?.commonEndings.some((ending) => first.endsWith(ending.replace("-", "")))) {
    score += 10;
    breakdown["Cultural Ending"] = "+10 — Ends with culturally familiar sound";
  } else {
    breakdown["Cultural Ending"] = "0 — Uncommon ending for this culture";
  }

  // Forbidden Phonemes
  if (profile?.forbiddenPhonemes?.some((p) => first.includes(p))) {
    score -= 10;
    breakdown["Forbidden Sounds"] = "-10 — Contains phonemes disallowed in culture";
  } else {
    breakdown["Forbidden Sounds"] = "+0 — No forbidden phonemes";
  }

  // Gender Alignment
  if (gender !== "unknown" && profile?.genderMarkers?.[gender]) {
    const matches = profile.genderMarkers[gender].filter((s) => first.endsWith(s.replace("-", "")));
    if (matches.length > 0) {
      score += 10;
      breakdown["Gender Match"] = "+10 — Ending aligns with cultural gender norm";
    } else {
      breakdown["Gender Match"] = "0 — Gender alignment not detected";
    }
  }

  // Final normalization
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    breakdown,
  };
}

// Optional helper for use in generator
export function scoreFullName(
  fullName: string,
  culture: string = "us_english",
  gender: string = "unknown"
): {
  score: number;
  breakdown: Record<string, string>;
} {
  
  console.log("Loaded profile:", CULTURE_PROFILES[culture]);  
  const [first, ...rest] = fullName.trim().split(" ");
  const last = rest.join(" ") || "";

  
  return scoreName(first, last, culture, gender);
}
