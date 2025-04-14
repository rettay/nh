// components/NameGenerator.tsx
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { generateGivenNames } from "@/engine/generate";
import { motion, AnimatePresence } from "framer-motion";

export default function NameGenerator() {
  const [surname, setSurname] = useState<string>("");
  const [italianWeight, setItalianWeight] = useState<number>(0.33);
  const [chineseWeight, setChineseWeight] = useState<number>(0.33);
  const [usWeight, setUsWeight] = useState<number>(0.34);
  const [genderPref, setGenderPref] = useState<number>(0.5);
  const [styleFilter, setStyleFilter] = useState<"any" | "modern" | "traditional">("any");
  const [generatedNames, setGeneratedNames] = useState<
    { name: string; score: number; breakdown: Record<string, string>; culture?: string; style?: string; meaning?: string }[]
  >([]);

  const generate = () => {
    const cultureWeights = {
      italian: italianWeight,
      chinese: chineseWeight,
      us_english: usWeight,
    };

    const gender = genderPref < 0.33 ? 'female' : genderPref > 0.66 ? 'male' : 'neutral';
    const results = generateGivenNames({
      cultureWeights,
      surname,
      gender,
      count: 1,
    });

    setGeneratedNames(results);
  };

  useEffect(() => {
    if (surname.trim().length > 0) {
      generate();
    }
  }, [surname, italianWeight, chineseWeight, usWeight, genderPref, styleFilter]);

  return (
    <motion.div className="max-w-xl mx-auto p-6 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <motion.h1 className="text-3xl font-bold text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        Name Generator
      </motion.h1>

      <Input placeholder="Enter a surname" value={surname} onChange={(e) => setSurname(e.target.value)} />

      <div className="space-y-2">
        <label>🇮🇹 Italian Influence: {(italianWeight * 100).toFixed(0)}%</label>
        <Slider min={0} max={1} step={0.01} value={[italianWeight]} onValueChange={([val]) => setItalianWeight(val)} />

        <label>🇨🇳 Chinese Influence: {(chineseWeight * 100).toFixed(0)}%</label>
        <Slider min={0} max={1} step={0.01} value={[chineseWeight]} onValueChange={([val]) => setChineseWeight(val)} />

        <label>🇺🇸 US English Influence: {(usWeight * 100).toFixed(0)}%</label>
        <Slider min={0} max={1} step={0.01} value={[usWeight]} onValueChange={([val]) => setUsWeight(val)} />

        <label>👶 Gender Preference: {genderPref < 0.33 ? "Feminine" : genderPref > 0.66 ? "Masculine" : "Neutral"}</label>
        <Slider min={0} max={1} step={0.01} value={[genderPref]} onValueChange={([val]) => setGenderPref(val)} />

        <label>🎭 Style:</label>
        <select
          value={styleFilter}
          onChange={(e) => setStyleFilter(e.target.value as "any" | "modern" | "traditional")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
        >
          <option value="any">Any</option>
          <option value="modern">Modern</option>
          <option value="traditional">Traditional</option>
        </select>
      </div>

      {generatedNames.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Name Suggestions</h2>
            <Button variant="outline" size="sm" onClick={generate}>
              🔁 Reroll
            </Button>
          </div>

          <AnimatePresence>
            {generatedNames.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Card>
                  <CardContent>
                    <h2 className="text-lg font-semibold">{n.name} {surname}</h2>
                    <p className="text-sm text-muted-foreground">Score: {n.score}</p>
                    <ul className="mt-2 text-xs text-gray-500 list-disc pl-4 space-y-1">
                      {Object.entries(n.breakdown).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value}</li>
                      ))}
                    </ul>
                    {n.culture && <p className="mt-2 text-sm">🌐 {n.culture}</p>}
                    {n.style && <p className="text-sm">✨ {n.style}</p>}
                    {n.meaning && <p className="text-sm">💬 {n.meaning}</p>}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
