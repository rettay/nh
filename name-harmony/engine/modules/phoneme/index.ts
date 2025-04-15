// engine/modules/phoneme/index.ts

export * from './types';
export { PhonemeAnalyzer } from './PhonemeAnalyzer';
export { detectLanguage } from './utils/languageDetector';

// Create a singleton instance for the application
import { PhonemeAnalyzer } from './PhonemeAnalyzer';
export const analyzer = new PhonemeAnalyzer();