// engine/modules/emotionalResonance.ts

export function scoreEmotionalResonance(first: string, last: string): {
    score: number;
    explanation: string;
  } {
    const full = `${first} ${last}`.toLowerCase();
    let score = 0;
    const notes: string[] = [];
  
    const softSounds = ['oo', 'm', 'l', 'n', 'a', 'e'];
    const hardSounds = ['k', 't', 'z', 'x', 'g', 'd', 'ch'];
  
    const softHits = softSounds.filter((s) => full.includes(s)).length;
    const hardHits = hardSounds.filter((s) => full.includes(s)).length;
  
    if (softHits >= 3 && hardHits === 0) {
      score += 5;
      notes.push('Name evokes softness, roundness, or warmth');
    } else if (hardHits >= 3 && softHits === 0) {
      score += 5;
      notes.push('Name evokes strength, punch, or precision');
    } else if (softHits > 0 && hardHits > 0) {
      score -= 3;
      notes.push('Competing soft and hard sound symbolism');
    } else {
      notes.push('Neutral emotional profile');
    }
  
    // Bonus for strong-sounding endings
    if (/[tkd]$/.test(last.toLowerCase())) {
      score += 3;
      notes.push('Crisp, strong-sounding last name ending');
    }
  
    // Bonus for elegant vowel endings
    if (/[aeiou]$/.test(first.toLowerCase())) {
      score += 2;
      notes.push('Elegant vowel ending on first name');
    }
  
    const explanation = notes.length
      ? notes.join('; ')
      : 'No emotional sound pattern detected';
  
    return {
      score: Math.max(-10, Math.min(10, score)),
      explanation,
    };
  }
  