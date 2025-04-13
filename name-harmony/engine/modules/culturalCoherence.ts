// engine/modules/culturalCoherence.ts

// Simple mock classification – replace with real dataset or API later
function getCulture(name: string): string {
    const normalized = name.toLowerCase();
  
    if (/(chen|li|zhang|wang|xu|xiao)/.test(normalized)) return 'chinese';
    if (/(raman|anand|raj|veer|singh|kumar)/.test(normalized)) return 'indian';
    if (/(giuseppe|mario|luca|rossi|bianchi)/.test(normalized)) return 'italian';
    if (/(john|james|smith|jackson|evans)/.test(normalized)) return 'english';
    if (/(hernandez|rodriguez|garcia|miguel|jose)/.test(normalized)) return 'spanish';
  
    return 'unknown';
  }
  
  export function scoreCulturalCoherence(first: string, last: string): {
    score: number;
    explanation: string;
  } {
    const firstCulture = getCulture(first);
    const lastCulture = getCulture(last);
  
    if (firstCulture === 'unknown' || lastCulture === 'unknown') {
      return {
        score: 0,
        explanation: 'Could not determine cultural background of one or both names.',
      };
    }
  
    if (firstCulture === lastCulture) {
      return {
        score: 10,
        explanation: `Both names appear to be ${firstCulture} in origin.`,
      };
    }
  
    return {
      score: -10,
      explanation: `First name appears ${firstCulture}, last name appears ${lastCulture} — cultural mismatch.`,
    };
  }
  