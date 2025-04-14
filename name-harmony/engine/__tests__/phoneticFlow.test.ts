
import { phoneticFlowWithSurname } from './phoneticFlow';

test("Phonetic flow: smooth melodic pair", () => {
  expect(phoneticFlowWithSurname("Luna", "Lombardi")).toBeGreaterThan(0.9);
});

test("Phonetic flow: harsh repeating sounds", () => {
  expect(phoneticFlowWithSurname("Anna", "Adams")).toBeLessThan(0.7);
});

test("Phonetic flow: distinct pairing", () => {
  expect(phoneticFlowWithSurname("Kai", "Ito")).toBeGreaterThan(0.9);
});
