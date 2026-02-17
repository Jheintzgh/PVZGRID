
import { GoogleGenAI, Type } from "@google/genai";
import { ROWS, COLS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function generateGridContent(theme: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Fill a ${ROWS}x${COLS} grid (6 rows, 9 columns) based on the theme: "${theme}". 
    Provide a text value and a hexadecimal color for each cell. 
    Be creative! If the theme is "Periodic Table", use elements. If it is "Pixel Art", use color blocks.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grid: {
            type: Type.ARRAY,
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  value: { type: Type.STRING },
                  color: { type: Type.STRING, description: "Hex color code" },
                  intensity: { type: Type.NUMBER, description: "Scale 0-100" }
                },
                required: ["value", "color", "intensity"]
              },
              description: `An array of ${COLS} cells`
            },
            description: `An array of ${ROWS} rows`
          }
        },
        required: ["grid"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.grid;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return null;
  }
}

export async function analyzeGrid(gridData: any) {
  const textSummary = gridData.map((row: any) => row.map((c: any) => c.value).join(', ')).join(' | ');
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this 6x9 grid content and tell me what story or pattern it represents: ${textSummary}`,
    config: {
      systemInstruction: "You are a data visualizer and pattern recognizer. Keep it concise but insightful."
    }
  });

  return response.text;
}
