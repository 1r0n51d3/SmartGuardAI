import { GoogleGenAI, Schema, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize the client with the provided API Key for the hackathon demo
const apiKey = "your_api_key";

const ai = new GoogleGenAI({ apiKey });

// schema for structured JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    safetyScore: {
      type: Type.INTEGER,
      description: "A score from 0 to 100 representing safety compliance (100 is perfect)."
    },
    hazards: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific safety hazards detected (e.g., 'Missing hard hat', 'Debris on walkway')."
    },
    progressEstimate: {
      type: Type.INTEGER,
      description: "Estimated percentage of completion for the visible construction phase (0-100)."
    },
    complianceStatus: {
      type: Type.STRING,
      enum: ["Compliant", "Minor Violations", "Critical Risk"],
      description: "Overall compliance status summary."
    },
    recommendations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Actionable steps to fix the issues."
    }
  },
  required: ["safetyScore", "hazards", "progressEstimate", "complianceStatus", "recommendations"]
};

const cleanBase64 = (base64Image: string) => {
  return base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
}

export const analyzeConstructionImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(base64Image)
            }
          },
          {
            text: "Analyze this construction site image. Act as a strict OSHA safety inspector. Identify safety hazards, estimate progress, and provide a safety score."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert AI Construction Safety Officer. Your job is to analyze site photos to prevent accidents and track progress."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    
    return {
      ...result,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const askAboutImage = async (base64Image: string, question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64(base64Image)
            }
          },
          {
            text: `Answer this question about the construction image provided: ${question}`
          }
        ]
      },
      config: {
        systemInstruction: "You are a helpful construction site assistant. Answer brief and concise."
      }
    });

    return response.text || "I couldn't analyze that detail.";
  } catch (error) {
    console.error("Chat failed:", error);
    return "Sorry, I encountered an error answering that.";
  }
};

export const generateConstructionImage = async (): Promise<string> => {
  try {
    // Attempt generation 
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
        parts: [
            {
            text: 'A realistic, high-resolution photo of a busy construction site. Include scaffolding, concrete structures, and workers. Add some subtle safety hazards like debris on the ground or a worker missing a vest to test safety inspection software.'
            },
        ],
        },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    
    throw new Error("Generation failed - No image data returned");
  } catch (error) {
    console.error("Image generation failed. Switching to fallback simulation.", error);
    
    // FALLBACK: Return a placeholder SVG data URI so the demo continues smoothly
    const fallbackSvg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="600" fill="#f8fafc"/>
        <rect x="0" y="500" width="800" height="100" fill="#94a3b8"/>
        <rect x="100" y="200" width="200" height="400" fill="#cbd5e1"/>
        <rect x="150" y="250" width="100" height="350" fill="#e2e8f0"/>
        <rect x="400" y="150" width="300" height="450" fill="#cbd5e1"/>
        <rect x="450" y="200" width="200" height="400" fill="#e2e8f0"/>
        <circle cx="700" cy="100" r="50" fill="#fbbf24" opacity="0.5"/>
        <text x="400" y="300" font-family="sans-serif" font-size="24" text-anchor="middle" fill="#64748b">Simulated Construction Site</text>
        <text x="400" y="340" font-family="sans-serif" font-size="16" text-anchor="middle" fill="#94a3b8">(AI Generation Fallback Mode)</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(fallbackSvg)}`;
  }
};
