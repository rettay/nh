// engine/modules/phoneme/PhonemeAnalyzer.ts

import { Phoneme, PhonemeOptions, LanguageProcessor } from './types';
import { LRUCache } from './utils/cache';
import { detectLanguage } from './utils/languageDetector';

import { EnglishProcessor } from './processors/EnglishProcessor';
import { ItalianProcessor } from './processors/ItalianProcessor';
import { ChineseProcessor } from './processors/ChineseProcessor';

export class PhonemeAnalyzer {
  private languageProcessors: Map<string, LanguageProcessor>;
  private cache: LRUCache<string, Phoneme[]>;
  
  constructor() {
    this.languageProcessors = new Map();
    // Register built-in language processors
    this.registerLanguageProcessor('en', new EnglishProcessor());
    this.registerLanguageProcessor('it', new ItalianProcessor());
    this.registerLanguageProcessor('zh', new ChineseProcessor());
    
    // Initialize cache with reasonable size for name generation
    this.cache = new LRUCache<string, Phoneme[]>(1000);
  }
  
  registerLanguageProcessor(language: string, processor: LanguageProcessor): void {
    this.languageProcessors.set(language.toLowerCase(), processor);
  }
  
  getPhonemes(text: string, options: PhonemeOptions = { language: 'en' }): Phoneme[] {
    const lang = options.language || detectLanguage(text);
    const cacheKey = `${text}:${lang}:${options.dialect || ''}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    
    const processor = this.getProcessorForLanguage(lang);
    if (!processor) {
      throw new Error(`No phoneme processor available for language: ${lang}`);
    }
    
    const phonemes = processor.processText(text, options);
    
    // Store in cache
    this.cache.set(cacheKey, phonemes);
    
    return phonemes;
  }
  
  countSyllables(text: string, options: PhonemeOptions = { language: 'en' }): number {
    const lang = options.language || detectLanguage(text);
    const processor = this.getProcessorForLanguage(lang);
    if (!processor) {
      throw new Error(`No phoneme processor available for language: ${lang}`);
    }
    
    return processor.countSyllables(text);
  }
  
  getSyllableStructure(text: string, options: PhonemeOptions = { language: 'en' }): string[] {
    const lang = options.language || detectLanguage(text);
    const processor = this.getProcessorForLanguage(lang);
    if (!processor) {
      throw new Error(`No phoneme processor available for language: ${lang}`);
    }
    
    const phonemes = this.getPhonemes(text, { language: lang });
    return processor.getSyllableStructure(phonemes);
  }
  
  getStressPattern(text: string, options: PhonemeOptions = { language: 'en' }): string[] {
    const lang = options.language || detectLanguage(text);
    const processor = this.getProcessorForLanguage(lang);
    if (!processor) {
      throw new Error(`No phoneme processor available for language: ${lang}`);
    }
    
    return processor.getStressPattern(text);
  }
  
  // Helper method for Chinese tones
  getTones(text: string): number[] {
    const processor = this.getProcessorForLanguage('zh');
    if (processor instanceof ChineseProcessor) {
      return processor.getTones(text);
    }
    return [];
  }
  
  detectLanguage(text: string): string {
    return detectLanguage(text);
  }
  
  private getProcessorForLanguage(language: string): LanguageProcessor | undefined {
    return this.languageProcessors.get(language.toLowerCase());
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}