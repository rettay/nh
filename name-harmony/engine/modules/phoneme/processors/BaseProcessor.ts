// engine/modules/phoneme/processors/BaseProcessor.ts

import { LanguageProcessor, Phoneme, PhonemeOptions, ContextRule } from '../types';

export abstract class BaseLanguageProcessor implements LanguageProcessor {
  protected abstract phonemeMap: Map<string, Phoneme>;
  protected abstract diphthongs: string[];
  protected abstract contextRules: ContextRule[];
  
  processText(text: string, options?: PhonemeOptions): Phoneme[] {
    const normalized = this.normalizeText(text);
    const tokens = this.tokenize(normalized);
    const phonemes = this.tokensToPhonemes(tokens, options);
    
    return phonemes;
  }
  
  abstract countSyllables(text: string): number;
  abstract getSyllableStructure(phonemes: Phoneme[]): string[];
  abstract getStressPattern(text: string): string[];
  
  protected normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }
  
  protected abstract tokenize(text: string): string[];
  protected abstract tokensToPhonemes(tokens: string[], options?: PhonemeOptions): Phoneme[];
}