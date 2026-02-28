import { GoogleGenAI } from "@google/genai";

export interface MacroResult {
  food: string;
  amount_g: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
}

const SYSTEM_PROMPT = `You are a nutrition parser. The user will describe food they ate.
Return ONLY a JSON array of objects with this exact shape, no markdown, no explanation:
[{ "food": string, "amount_g": number, "kcal": number, "protein_g": number, "carbs_g": number, "fat_g": number, "fiber_g": number }]
If the user provides per-100g values, scale them to the actual amount eaten.
If a value is unknown, estimate it. Never return null.`;

export async function parseMacros(userInput: string): Promise<MacroResult[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: userInput,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  return JSON.parse(text) as MacroResult[];
}
