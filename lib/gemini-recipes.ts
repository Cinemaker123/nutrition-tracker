import { GoogleGenAI } from "@google/genai";
import type { DayData, RecipeSuggestion, MacroGoals } from "@/types";

const SYSTEM_PROMPT = `Return exactly 3 suggestions (2 meals + 1 snack) that would best address the macro gaps from the provided food log. Keep the snack simple and realistic — think a piece of fruit, yogurt with grains, or toast with cheese.
The user is vegetarian, so all suggestions should be plant-based and not include meat, poultry, or fish. Milk free alternatives are fine (e.g. almond milk, soy yogurt).

Respond ONLY with a JSON array, no markdown, no explanation:
[
  {
    "name": string,
    "description": string (one sentence),
    "primary_macro": string (e.g. "protein"),
    "type": "meal" | "snack"
  }
]`;

export async function generateRecipes(
  data: DayData[],
  goals: MacroGoals
): Promise<RecipeSuggestion[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Calculate macro gaps
  const totals = data.reduce(
    (acc, day) => ({
      kcal: acc.kcal + day.totals.kcal,
      protein_g: acc.protein_g + day.totals.protein_g,
      carbs_g: acc.carbs_g + day.totals.carbs_g,
      fat_g: acc.fat_g + day.totals.fat_g,
      fiber_g: acc.fiber_g + day.totals.fiber_g,
    }),
    { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0 }
  );

  const daysCount = data.length;
  const targetTotals = {
    kcal: goals.kcal * daysCount,
    protein_g: goals.protein_g * daysCount,
    carbs_g: goals.carbs_g * daysCount,
    fat_g: goals.fat_g * daysCount,
    fiber_g: goals.fiber_g * daysCount,
  };

  const gaps = {
    kcal: targetTotals.kcal - totals.kcal,
    protein_g: targetTotals.protein_g - totals.protein_g,
    carbs_g: targetTotals.carbs_g - totals.carbs_g,
    fat_g: targetTotals.fat_g - totals.fat_g,
    fiber_g: targetTotals.fiber_g - totals.fiber_g,
  };

  // Format the data for the LLM
  const formattedData = data.map((day) => ({
    date: day.date,
    totals: day.totals,
    foods: day.entries.map((e) => `${e.food} (${e.amount_g}g, ${e.kcal} kcal)`),
  }));

  const prompt = `Daily goals: ${goals.kcal} kcal, ${goals.protein_g}g protein, ${goals.carbs_g}g carbs, ${goals.fat_g}g fat, ${goals.fiber_g}g fiber

Macro gaps over ${daysCount} day(s):
- Calories: ${gaps.kcal > 0 ? 'under by ' + Math.round(gaps.kcal) : 'over by ' + Math.round(Math.abs(gaps.kcal))}
- Protein: ${gaps.protein_g > 0 ? 'under by ' + Math.round(gaps.protein_g) + 'g' : 'over by ' + Math.round(Math.abs(gaps.protein_g)) + 'g'}
- Carbs: ${gaps.carbs_g > 0 ? 'under by ' + Math.round(gaps.carbs_g) + 'g' : 'over by ' + Math.round(Math.abs(gaps.carbs_g)) + 'g'}
- Fat: ${gaps.fat_g > 0 ? 'under by ' + Math.round(gaps.fat_g) + 'g' : 'over by ' + Math.round(Math.abs(gaps.fat_g)) + 'g'}
- Fiber: ${gaps.fiber_g > 0 ? 'under by ' + Math.round(gaps.fiber_g) + 'g' : 'over by ' + Math.round(Math.abs(gaps.fiber_g)) + 'g'}

Food log:
${JSON.stringify(formattedData, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  
  const suggestions = JSON.parse(text) as RecipeSuggestion[];
  
  // Validate and normalize
  return suggestions.map((s, i) => ({
    name: s.name || `Suggestion ${i + 1}`,
    description: s.description || "No description provided",
    primary_macro: s.primary_macro || "protein",
    type: s.type || "meal",
  }));
}
