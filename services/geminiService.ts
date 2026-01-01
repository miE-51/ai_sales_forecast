
import { GoogleGenAI, Type } from "@google/genai";
import { SalesData, AIAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSalesWithAI = async (data: SalesData[]): Promise<AIAnalysis> => {
  const model = "gemini-3-flash-preview";
  
  const dataString = data.map(d => `${d.month}: ${d.value} MMK`).join(", ");
  
  const prompt = `
    You are an expert business consultant for Myanmar entrepreneurs. 
    Analyze the following historical monthly sales data (in MMK): ${dataString}.
    
    Tasks:
    1. Forecast the next 4 months based on the trend.
    2. Identify the overall trend (up, down, or stable).
    3. Provide 3 specific actionable business tips in Myanmar language specifically tailored to the Myanmar market context (consider factors like inflation, seasonality, or local consumer behavior).
    4. Estimate your confidence in this forecast (High/Medium/Low).

    Respond in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forecast: { type: Type.STRING, description: "A brief summary of the forecast" },
            advice: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "3 tips in Myanmar language"
            },
            trend: { type: Type.STRING, enum: ['up', 'down', 'stable'] },
            confidence: { type: Type.STRING }
          },
          required: ["forecast", "advice", "trend", "confidence"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
