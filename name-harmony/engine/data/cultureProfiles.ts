// engine/data/cultureProfiles.ts

export type CultureProfile = {
    culture: 'chinese' | 'italian' | 'us_english';
    syllableStructures: string[]; // e.g., "CV", "CVC", "CVN"
    commonEndings: string[]; // typical final phonemes/suffixes
    disallowedClusters?: string[];
    preferredTonePatterns?: string[]; // for tonal languages like Mandarin
    stressPattern?: 'penultimate' | 'trochaic' | 'variable';
    forbiddenPhonemes?: string[];
    allowedPhonemes?: string[];
    genderMarkers?: {
      male: string[];
      female: string[];
    };
    coPronounceableWith?: string[]; // cultures that blend easily with this
    notes?: string; // freeform insights from research
  };
  
  export const CULTURE_PROFILES: CultureProfile[] = [
    {
      culture: 'chinese',
      syllableStructures: ['CV', 'CVN'],
      commonEndings: ['-ng', '-n', '-ao', '-ei'],
      disallowedClusters: ['-tr', '-bl', '-sk'],
      preferredTonePatterns: ['T1-T4', 'T1-T2', 'T2-T1', 'T1-T3'],
      forbiddenPhonemes: ['v', 'f', 'r'],
      genderMarkers: {
        male: ['-jun', '-hao', '-zheng', '-peng'],
        female: ['-li', '-hua', '-mei', '-xin'],
      },
      coPronounceableWith: ['us_english', 'italian'],
      notes: 'Mandarin favors syllables that are light and open, tones are important, avoid T3–T3 sequences.'
    },
    {
      culture: 'italian',
      syllableStructures: ['CV', 'CVCV', 'VCV'],
      commonEndings: ['-o', '-a', '-e', '-i'],
      stressPattern: 'penultimate',
      forbiddenPhonemes: ['h', 'x', 'w'],
      genderMarkers: {
        male: ['-o', '-e'],
        female: ['-a'],
      },
      coPronounceableWith: ['us_english', 'chinese'],
      notes: 'Names almost always end in a vowel, especially "-a" (f) or "-o" (m). Double consonants common. Penultimate syllable usually stressed.'
    },
    {
      culture: 'us_english',
      syllableStructures: ['CVC', 'CV', 'VC', 'CVCV'],
      commonEndings: ['-son', '-er', '-ie', '-a', '-y'],
      stressPattern: 'trochaic',
      allowedPhonemes: ['th', 'sh', 'r', 'l', 'z', 'v', 'dʒ'],
      genderMarkers: {
        male: ['-son', '-er', '-an'],
        female: ['-ie', '-a', '-y'],
      },
      coPronounceableWith: ['chinese', 'italian'],
      notes: 'Trochaic (STRONG-weak) stress pattern. Huge variety of endings. Common to form diminutives with -ie or -y.'
    }
  ];
  