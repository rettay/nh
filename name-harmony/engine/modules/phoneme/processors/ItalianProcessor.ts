// engine/modules/phoneme/processors/ItalianProcessor.ts

import { Phoneme, PhonemeOptions, ContextRule } from '../types';
import { BaseLanguageProcessor } from './BaseProcessor';

export class ItalianProcessor extends BaseLanguageProcessor {
  protected phonemeMap: Map<string, Phoneme>;
  protected diphthongs: string[];
  protected contextRules: ContextRule[];
  
  constructor() {
    super();
    this.phonemeMap = this.buildPhonemeMap();
    this.diphthongs = ['ia', 'ie', 'io', 'iu', 'ai', 'ei', 'oi', 'ui', 'au', 'eu'];
    this.contextRules = this.buildContextRules();
  }
  
  private buildPhonemeMap(): Map<string, Phoneme> {
    const map = new Map<string, Phoneme>();
    
    // Vowels
    map.set('a', {
      symbol: 'a',
      type: 'vowel',
      features: { 
        height: 'low', 
        backness: 'central', 
        roundedness: false,
        sonorant: true,
        syllabic: true
      }
    });
    
    map.set('e', {
      symbol: 'e',
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
      symbol: 'i',
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
      symbol: 'o',
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
      symbol: 'u',
      type: 'vowel',
      features: { 
        height: 'high', 
        backness: 'back', 
        roundedness: true,
        sonorant: true,
        syllabic: true
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
      symbol: '',  // Silent in Italian
      type: 'other',
      features: {}
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
      symbol: 'r',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'trill',
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
    
    map.set('z', {
      symbol: 'ts',
      type: 'consonant',
      features: { 
        place: 'alveolar',
        manner: 'affricate',
        voicing: false,
        sonorant: false
      }
    });
    
    // Italian digraphs
    map.set('ch', {
      symbol: 'k',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: false,
        sonorant: false
      }
    });
    
    map.set('gh', {
      symbol: 'g',
      type: 'consonant',
      features: { 
        place: 'velar',
        manner: 'plosive',
        voicing: true,
        sonorant: false
      }
    });
    
    map.set('gl', {
      symbol: 'ʎ',
      type: 'consonant',
      features: { 
        place: 'palatal',
        manner: 'lateral',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('gn', {
      symbol: 'ɲ',
      type: 'consonant',
      features: { // engine/modules/phoneme/processors/ItalianProcessor.ts (continued)
        place: 'palatal',
        manner: 'nasal',
        voicing: true,
        sonorant: true
      }
    });
    
    map.set('sc', {
      symbol: 'ʃ',
      type: 'consonant',
      features: { 
        place: 'postalveolar',
        manner: 'fricative',
        voicing: false,
        sonorant: false
      }
    });
    
    return map;
  }
  
  private buildContextRules(): ContextRule[] {
    return [
      {
        pattern: /c(?=[ei])/g,
        replacement: 'tʃ',
        description: 'c followed by e or i is pronounced as /tʃ/'
      },
      {
        pattern: /g(?=[ei])/g,
        replacement: 'dʒ',
        description: 'g followed by e or i is pronounced as /dʒ/'
      },
      {
        pattern: /sc(?=[ei])/g,
        replacement: 'ʃ',
        description: 'sc followed by e or i is pronounced as /ʃ/'
      }
    ];
  }
  
  protected tokenize(text: string): string[] {
    const tokens: string[] = [];
    let i = 0;
    
    while (i < text.length) {
      // Check for trigraphs first
      if (i < text.length - 2) {
        const trigraph = text.substring(i, i + 3);
        if (['sci', 'sce'].includes(trigraph)) {
          tokens.push(trigraph);
          i += 3;
          continue;
        }
      }
      
      // Check for digraphs
      if (i < text.length - 1) {
        const digraph = text.substring(i, i + 2);
        if (['ch', 'gh', 'gl', 'gn', 'sc'].includes(digraph)) {
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
        const phoneme = this.phonemeMap.get(token)!;
        // Skip empty phonemes (like silent h in Italian)
        if (phoneme.symbol !== '') {
          phonemes.push(phoneme);
        }
      } else {
        // Apply context rules
        let handled = false;
        for (const rule of this.contextRules) {
          if (rule.pattern.test(token)) {
            // Create phoneme based on rule
            phonemes.push({
              symbol: rule.replacement,
              type: 'consonant', // Most rules handle consonants
              features: {}
            });
            handled = true;
            break;
          }
        }
        
        if (!handled) {
          // Handle character by character
          for (const char of token) {
            if (this.phonemeMap.has(char)) {
              const phoneme = this.phonemeMap.get(char)!;
              if (phoneme.symbol !== '') {
                phonemes.push(phoneme);
              }
            }
          }
        }
      }
    }
    
    return phonemes;
  }
  
  countSyllables(text: string): number {
    // Italian syllable counting
    // Italian syllables are primarily determined by vowels with consideration for diphthongs
    const normalized = this.normalizeText(text);
    const tokens = this.tokenize(normalized);
    
    let syllableCount = 0;
    let inDiphthong = false;
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (this.diphthongs.includes(token)) {
        syllableCount++;
        inDiphthong = false;
      } else if (token.length === 1 && /[aeiou]/.test(token)) {
        if (!inDiphthong) {
          syllableCount++;
        }
        inDiphthong = false;
      } else if (token === 'i' || token === 'u') {
        // i and u can form diphthongs with other vowels
        const nextToken = i < tokens.length - 1 ? tokens[i + 1] : '';
        if (nextToken.length === 1 && /[aeou]/.test(nextToken)) {
          inDiphthong = true;
        } else {
          syllableCount++;
          inDiphthong = false;
        }
      }
    }
    
    return Math.max(1, syllableCount);
  }
  
  getSyllableStructure(phonemes: Phoneme[]): string[] {
    const cvPattern = phonemes.map(p => 
      p.type === 'vowel' || p.type === 'diphthong' ? 'V' : 'C'
    ).join('');
    
    // Split into syllables using Italian syllabification rules
    const syllables = this.divideIntoSyllables(cvPattern);
    
    return syllables;
  }
  
  private divideIntoSyllables(cvPattern: string): string[] {
    // Italian syllabification rules
    // - One consonant between vowels goes with the second vowel (CV.CV)
    // - Multiple consonants are usually split (VC.CV)
    // - Certain consonant clusters stay together (V.CCV)
    
    if (!cvPattern.includes('V')) {
      return [cvPattern]; // No vowels, treat as one syllable
    }
    
    const syllables: string[] = [];
    let currentSyllable = '';
    let i = 0;
    
    while (i < cvPattern.length) {
      const current = cvPattern[i];
      
      if (current === 'V') {
        currentSyllable += current;
        i++;
        
        // If we've reached the end or the next character is a vowel,
        // end the current syllable
        if (i >= cvPattern.length || cvPattern[i] === 'V') {
          syllables.push(currentSyllable);
          currentSyllable = '';
        }
      } else { // current === 'C'
        // Check consonant cluster
        let consonantCount = 0;
        let j = i;
        while (j < cvPattern.length && cvPattern[j] === 'C') {
          consonantCount++;
          j++;
        }
        
        if (consonantCount === 1) {
          // Single consonant: add to next syllable (if there's a next vowel)
          if (j < cvPattern.length && cvPattern[j] === 'V') {
            // End current syllable if not empty
            if (currentSyllable) {
              syllables.push(currentSyllable);
              currentSyllable = '';
            }
          }
          currentSyllable += current;
        } else {
          // Multiple consonants: usually split after the first
          currentSyllable += current;
          syllables.push(currentSyllable);
          currentSyllable = '';
          
          // Special case for Italian: certain consonant clusters stay together
          // (simplified for demonstration)
          if (consonantCount >= 2) {
            // Add all but one consonant to the next syllable
            for (let k = 1; k < consonantCount; k++) {
              currentSyllable += 'C';
            }
            i += consonantCount - 1;
          }
        }
        i++;
      }
    }
    
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    return syllables;
  }
  
  getStressPattern(text: string): string[] {
    // Italian typically has penultimate stress
    const syllableCount = this.countSyllables(text);
    const pattern: string[] = new Array(syllableCount).fill('0');
    
    // Default Italian stress is on the penultimate syllable
    if (syllableCount > 1) {
      pattern[syllableCount - 2] = '1';
    } else if (syllableCount === 1) {
      pattern[0] = '1';
    }
    
    // Check for accent marks which indicate different stress
    // (simplified implementation)
    if (text.match(/[àèéìíòóù]/)) {
      // Italian words with accent marks usually have stress on the final syllable
      if (syllableCount > 0) {
        pattern.fill('0');
        pattern[syllableCount - 1] = '1';
      }
    }
    
    return pattern;
  }
}