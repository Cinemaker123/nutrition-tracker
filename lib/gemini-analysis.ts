import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are a nutrition coach analyzing 7 days of food log data for someone trying to lose weight. They are tracking calories and macros with the following daily goals: calories, protein, carbs, fat, and fiber.
The user is vegetarian and transitioning to a plant-based diet. Never suggest meat, fish, or seafood. Prioritize plant-based protein sources like legumes, tofu, tempeh, edamame, seitan, or high-protein dairy if needed.

You will receive daily totals and a full list of everything eaten each day. From the food list, identify which items are recurring daily staples and ignore them. Focus on foods that appear intermittently and are contributing meaningfully to calorie or carb overages.

Give exactly 1-2 observations. Never more.

Only state things the user cannot already see from the raw numbers. Do not restate totals, percentages, or anything visible in the data directly.

When multiple days are provided, prioritize pattern observations over single-day anomalies. If fewer than 3 days are available, note that conclusions are limited and be appropriately cautious.

Every observation must end with one concrete, specific action for the next meal or next day. Not general advice — something they can actually do tomorrow. 

Never praise. Never use words like "great", "good job", "well done".
Never shame or use negative framing around specific foods or choices.
If the data shows no meaningful pattern or concern, say so in one sentence and stop.

Tone: direct and neutral, like a coach who respects the user's time and intelligence.
Format: plain sentences only. No bullet points, no headers, no markdown, no lists.

interface DayData {
  date: string;
  totals: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
  entries: {
    food: string;
    amount_g: number;
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  }[];
}

export async function analyze7Days(data: DayData[], goals: { kcal: number; protein_g: number; carbs_g: number; fat_g: number; fiber_g: number }): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  // Format the data for the LLM
  const formattedData = data.map(day => ({
    date: day.date,
    totals: day.totals,
    foods: day.entries.map(e => `${e.food} (${e.amount_g}g, ${e.kcal} kcal)`),
  }));

  const prompt = `Daily goals: ${goals.kcal} kcal, ${goals.protein_g}g protein, ${goals.carbs_g}g carbs, ${goals.fat_g}g fat, ${goals.fiber_g}g fiber

7-day food log:
${JSON.stringify(formattedData, null, 2)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
      maxOutputTokens: 2000,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  return text;
}
