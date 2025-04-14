// /engine/__tests__/phoneticHarmony.test.ts
import { phoneticHarmony } from '../phoneticHarmony';

describe('phoneticHarmony', () => {
  it('scores "Luna" highly', () => {
    const score = phoneticHarmony("Luna");
    expect(score).toBeGreaterThan(0.85);
  });

  it('scores "Brktz" poorly', () => {
    const score = phoneticHarmony("Brktz");
    expect(score).toBeLessThan(0.3);
  });

  it('scores "Amara" decently', () => {
    const score = phoneticHarmony("Amara");
    expect(score).toBeGreaterThan(0.75);
  });

  it('handles empty input', () => {
    const score = phoneticHarmony("");
    expect(score).toEqual(0);
  });
});
