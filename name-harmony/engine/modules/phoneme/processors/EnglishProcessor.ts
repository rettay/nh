// engine/modules/phoneme/processors/EnglishProcessor.ts

import { Phoneme, PhonemeOptions, ContextRule } from '../types';
import { BaseLanguageProcessor } from './BaseProcessor';

export class EnglishProcessor extends BaseLanguageProcessor {
  protected phonemeMap: Map<string, Phoneme>;
  protected diphthongs: string[];
  protected contextRules: ContextRule[];
  
  constructor() {
    super();
    this.phonemeMap = this.buildPhonemeMap();
    this.diphthongs = ['ai', 'ay', 'ei', 'ey', 'oi', 'oy', 'au', 'aw', 'ou', 'ow'];
    this.contextRules = this.buildContextRules();
  }
  
  private buildPhonemeMap(): Map<string, Phoneme> {
    const map = new Map<string, Phoneme>();
    
    // Vowels
    map.set('a', {
      symbol: 'æ',
      type: 'vowel',
      features: { 
        height: 'low', 
        backness: 'front', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('e', {
      symbol: 'ɛ',
      type: 'vowel',
      features: { 
        height: 'mid', 
        backness: 'front', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('i', {
      symbol: 'ɪ',
      type: 'vowel',
      features: { 
        height: 'high', 
        backness: 'front', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('o', {
      symbol: 'ɔ',
      type: 'vowel',
      features: { 
        height: 'mid', 
        backness: 'back', 
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('u', {
      symbol: 'ʌ',
      type: 'vowel',
      features: { 
        height: 'mid', 
        backness: 'back', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('y', {
      symbol: 'j',
      type: 'consonant',
      features: { 
        place: 'palatal',
        manner: 'approximant',
        voicing: true,
        sonorant: true
      }
    });
    
    // Consonants
    map.set('b', {
      symbol: 'b',
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'plosive',
        voicing: true,
        sonorant: false
      }
    });
    
    map.set('c', {
      symbol: 'k',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('d', {
      symbol: 'd',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'plosive',
        voicing: true,
        sonorant: false
      }
    });
    
    map.set('f', {
      symbol: 'f',
      type: 'consonant',
      features: { 
        place: 'labiodental',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('g', {
      symbol: 'g',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: true,
        sonorant: false
      }
    });
    
    map.set('h', {
      symbol: 'h',
      type: 'consonant',
      features: { 
        place: 'glottal',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('j', {
      symbol: 'dʒ',
      type: 'consonant',
      features: { 
        place: 'postalveolar',
        manner: 'affricate',
        voicing: true,
        sonorant: false
      }
    });
    
    map.set('k', {
      symbol: 'k',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('l', {
      symbol: 'l',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'lateral',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('m', {
      symbol: 'm',
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'nasal',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('n', {
      symbol: 'n',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'nasal',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('p', {
      symbol: 'p',
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('q', {
      symbol: 'k',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('r', {
      symbol: 'ɹ',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'approximant',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('s', {
      symbol: 's',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('t', {
      symbol: 't',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('v', {
      symbol: 'v',
      type: 'consonant',
      features: { 
        place: 'labiodental',
        manner: 'fricative',
        voicing: true,
        sonorant: false
      }
    });
    
    map.set('w', {
      symbol: 'w',
      type: 'consonant',
      features: { 
        place: 'bilabial',
        manner: 'approximant',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('x', {
      symbol: 'ks',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('z', {
      symbol: 'z',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'fricative',
        voicing: true,
        sonorant: false
      }
    });
    
    // Common digraphs
    map.set('ch', {
      symbol: 'tʃ',
      type: 'consonant',
      features: { 
        place: 'postalveolar',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('sh', {
      symbol: 'ʃ',
      type: 'consonant',
      features: { 
        place: 'postalveolar',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('th', {
      symbol: 'θ',
      type: 'consonant',
      features: { 
        place: 'dental',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('ng', {
      symbol: 'ŋ',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'nasal',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('ph', {
      symbol: 'f',
      type: 'consonant',
      features: { 
        place: 'labiodental',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    // Common diphthongs
    map.set('ai', {
      symbol: 'aɪ',
      type: 'diphthong',
      features: { 
        height: 'low',
        backness: 'front',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ay', {
      symbol: 'eɪ',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'front',
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('ow', {
      symbol: 'oʊ',
      type: 'diphthong',
      features: { 
        height: 'mid',
        backness: 'back',
        roundedness: true,
        sonorant: true,
        syllabic: true
      }
    });
    
    return map;
  }
  
  private buildContextRules(): ContextRule[] {
    return [
      {
        pattern: /c(?=[eiy])/g,
        replacement: 's',
        description: 'c followed by e, i, or y is pronounced as /s/'
      },
      {
        pattern: /c(?=[aou])/g,
        replacement: 'k',
        description: 'c followed by a, o, or u is pronounced as /k/'
      },
      {
        pattern: /g(?=[eiy])/g,
        replacement: 'j',
        description: 'g followed by e, i, or y is often pronounced as /dʒ/'
      }
    ];
  }
  
  protected tokenize(text: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    
    while (i < text.length) {
      // Check for digraphs first
      if (i < text.length - 1) {
        const digraph = text.substring(i, i + 2);
        if (['ch', 'sh', 'th', 'ph', 'wh', 'gh', 'ng'].includes(digraph)) {
          tokens.push(digraph);
          i += 2;
          continue;
        }
      }
      
      // Check for diphthongs
      let diphthongMatch = false;
      for (const diphthong of this.diphthongs) {
        if (i <= text.length - diphthong.length && 
            text.substring(i, i + diphthong.length) === diphthong) {
          tokens.push(diphthong);
          i += diphthong.length;
          diphthongMatch = true;
          break;
        }
      }
      
      if (!diphthongMatch) {
        // Single character
        tokens.push(text[i]);
        i++;
      }
    }
    
    return tokens;
  }
  
  protected tokensToPhonemes(tokens: string[], options?: PhonemeOptions): Phoneme[] {
    const phonemes: Phoneme[] = [];
    
    for (const token of tokens) {
      if (this.phonemeMap.has(token)) {
        phonemes.push(this.phonemeMap.get(token)!);
      } else {
        // Handle unknown tokens by breaking them into characters
        for (const char of token) {
          if (this.phonemeMap.has(char)) {
            phonemes.push(this.phonemeMap.get(char)!);
          } else {
            // If character not in map, create a generic phoneme
            phonemes.push({
              symbol: char,
              type: 'other',
              features: {}
            });
          }
        }
      }
    }
    
    return phonemes;
  }
  
  countSyllables(text: string): number {
    // Improved syllable counting algorithm for English
    const normalized = this.normalizeText(text);
    
    // Count vowel sequences as potential syllable nuclei
    const vowelGroups = normalized.match(/[aeiouy]+/g) || [];
    
    // Handle special cases where adjacent vowels might form diphthongs
    const diphthongs = (normalized.match(/[aeiouy]{2}/g) || []).length;
    const triphthongs = (normalized.match(/[aeiouy]{3}/g) || []).length;
    
    // Subtract estimated diphthongs/triphthongs and handle silent e
    let syllableCount = vowelGroups.length;
    syllableCount -= Math.floor(diphthongs * 0.6); // Most pairs are diphthongs
    syllableCount -= Math.floor(triphthongs * 0.8); // Most triplets are single syllables
    
    // Handle silent e at the end of words
    if (normalized.match(/[^aeiou]e$/)) {
      syllableCount--;
    }
    
    return Math.max(1, syllableCount);
  }
  
  getSyllableStructure(phonemes: Phoneme[]): string[] {
    // Convert phoneme sequence to CV pattern
    const cvPattern = phonemes.map(p => 
      p.type === 'vowel' || p.type === 'diphthong' ? 'V' : 'C'
    ).join('');
    
    // Split into syllables using maximal onset principle
    const syllables = this.divideIntoSyllables(cvPattern);
    
    return syllables;
  }
  
  private divideIntoSyllables(cvPattern: string): string[] {
    // Simple syllable division based on CV patterns
    // This is a simplified implementation
    
    if (!cvPattern.includes('V')) {
      return [cvPattern]; // No vowels, treat as one syllable
    }
    
    const syllables: string[] = [];
    let currentSyllable = '';
    let inConsonantCluster = true;
    
    for (let i = 0; i < cvPattern.length; i++) {
      const current = cvPattern[i];
      const next = i < cvPattern.length - 1 ? cvPattern[i + 1] : null;
      
      if (current === 'C') {
        if (inConsonantCluster) {
          // Continue building consonant cluster
          currentSyllable += current;
        } else {
          // Start of a new consonant cluster
          if (next === 'V') {
            // This consonant is the onset of the next syllable
            if (currentSyllable) {
              syllables.push(currentSyllable);
            }
            currentSyllable = current;
            inConsonantCluster = true;
          } else {
            // This consonant could be coda of current syllable
            // or part of the onset of the next syllable
            currentSyllable += current;
          }
        }
      } else { // current === 'V'
        inConsonantCluster = false;
        currentSyllable += current;
        
        // If next is a consonant followed by a vowel, it's likely
        // the onset of the next syllable
        if (next === 'C' && i < cvPattern.length - 2 && cvPattern[i + 2] === 'V') {
          syllables.push(currentSyllable);
          currentSyllable = '';
          inConsonantCluster = true;
        }
      }
    }
    
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    return syllables;
  }
  
  getStressPattern(text: string): string[] {
    // English stress pattern detection
    // Simplified implementation - for names, often first syllable is stressed
    
    const syllableCount = this.countSyllables(text);
    const pattern: string[] = new Array(syllableCount).fill('0');
    
    if (syllableCount > 0) {
      // Default to first syllable stress for names
      pattern[0] = '1';
    }
    
    return pattern;
  }
}