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
  const [generatedNames, setGeneratedNames] = useState<
    { name: string; score: number; breakdown: Record<string, string> }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const generate = () => {
    const cultureWeights = {
      italian: italianWeight,
      chinese: chineseWeight,
      us_english: usWeight,
    };
  
    console.log("Generating with:", {
      surname,
      cultureWeights
    });
  
    const results = generateGivenNames({
      cultureWeights,
      surname,
      gender: "unknown",
      count: 1,
    });
  
    console.log("Generated results:", results);
  
    setGeneratedNames(results);
  };

  useEffect(() => {
    if (surname.trim().length > 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surname, italianWeight, chineseWeight, usWeight]);

  return (
    <motion.div
      className="max-w-xl mx-auto p-6 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        Name Generator
      </motion.h1>

      <Input
        placeholder="Enter a surname"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
      />

      <div className="space-y-2">
        <label>🇮🇹 Italian Influence: {(italianWeight * 100).toFixed(0)}%</label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[italianWeight]}
          onValueChange={([val]) => setItalianWeight(val)}
        />

        <label>🇨🇳 Chinese Influence: {(chineseWeight * 100).toFixed(0)}%</label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[chineseWeight]}
          onValueChange={([val]) => setChineseWeight(val)}
        />

        <label>🇺🇸 US English Influence: {(usWeight * 100).toFixed(0)}%</label>
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={[usWeight]}
          onValueChange={([val]) => setUsWeight(val)}
        />
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
                    <h2 className="text-lg font-semibold">{n.name}</h2>
                    <p className="text-sm text-muted-foreground">Score: {n.score}</p>
                    <ul className="mt-2 text-xs text-gray-500 list-disc pl-4">
                      {Object.entries(n.breakdown).map(([key, value]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {value}
                        </li>
                      ))}
                    </ul>
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
