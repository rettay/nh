// engine/modules/phoneme/types.ts

export interface Phoneme {
    symbol: string;       // IPA symbol representation
    type: 'vowel' | 'consonant' | 'diphthong' | 'other';
    features: PhoneticFeatures;
  }
  
  export interface PhoneticFeatures {
    // Vowel features
    height?: 'high' | 'mid' | 'low';
    backness?: 'front' | 'central' | 'back';
    roundedness?: boolean;
    
    // Consonant features
    place?: 'bilabial' | 'labiodental' | 'dental' | 'alveolar' | 'postalveolar' | 
            'palatal' | 'velar' | 'glottal';
    manner?: 'plosive' | 'nasal' | 'trill' | 'tap' | 'fricative' | 
             'affricate' | 'approximant' | 'lateral';
    voicing?: boolean;
    
    // Common features
    sonorant?: boolean;
    syllabic?: boolean;
    tonal?: number;
  }
  
  export interface PhonemeOptions {
    language: string;
    dialect?: string;
    preserveOriginalText?: boolean;
    includeStress?: boolean;
  }
  
  export interface LanguageProcessor {
    processText(text: string, options?: PhonemeOptions): Phoneme[];
    countSyllables(text: string): number;
    getSyllableStructure(phonemes: Phoneme[]): string[];
    getStressPattern(text: string): string[];
  }
  
  export interface ContextRule {
    pattern: RegExp;
    replacement: string;
    description: string;
    condition?: (context: string) => boolean;
  }