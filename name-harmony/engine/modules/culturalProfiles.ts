export const CULTURE_PROFILES: Record<string, CultureProfile> = {
    chinese: {
      allowedEndings: ["li", "mei", "zhao", "hua"],
      forbiddenPhonemes: ["ck", "th", "rr"],
      syllableCountRange: [1, 3],
      genderMarkers: {
        male: ["-wei", "-ming"],
        female: ["-mei", "-hua", "-xiu"]
      },
      toneRules: {
        // placeholder structure for future tone logic
        // e.g., tonePattern: /^[1234]{1,3}$/, or tonesAllowed: [1, 2, 3, 4]
      },
      penalties: {
        endings: 0.2,
        phonemes: 0.3,
        syllableCount: 0.2,
        genderMarkers: 0.2,
        tones: 0.25
      },
      syllableDetectionMethod: "chinese"
    },
  
    italian: {
      allowedEndings: ["a", "o", "e"],
      forbiddenPhonemes: ["zh", "x", "q"],
      syllableCountRange: [2, 4],
      genderMarkers: {
        male: ["-o", "-io"],
        female: ["-a", "-ina"]
      },
      penalties: {
        endings: 0.2,
        phonemes: 0.3,
        syllableCount: 0.2,
        genderMarkers: 0.2
      },
      syllableDetectionMethod: "default"
    },
  
    us_english: {
      allowedEndings: ["y", "ie", "son", "den", "ton"],
      forbiddenPhonemes: ["llz", "ptkph"], // fictive examples
      syllableCountRange: [1, 4],
      genderMarkers: {
        male: ["-son", "-ton"],
        female: ["-y", "-ie", "-lyn"]
      },
      penalties: {
        endings: 0.15,
        phonemes: 0.25,
        syllableCount: 0.2,
        genderMarkers: 0.15
      },
      syllableDetectionMethod: "default"
    }
  };
  
  // Type definition for each profile
  export interface CultureProfile {
    allowedEndings?: string[];
    forbiddenPhonemes?: string[];
    syllableCountRange?: [number, number];
    genderMarkers?: Record<string, string[]>;
    toneRules?: any;
    penalties?: {
      endings?: number;
      phonemes?: number;
      syllableCount?: number;
      genderMarkers?: number;
      tones?: number;
    };
    syllableDetectionMethod?: "default" | "chinese" | "japanese";
  }
  