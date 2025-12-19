
import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateStyledImage = async (
  base64Image: string,
  persianPrompt: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Custom instruction in English for the model to ensure constraints are met
  const systemInstruction = `
    You are a professional digital stylist.
    User will provide an image of a man and a prompt in Persian.
    Your task: Modify ONLY the hair, beard, clothing, or add tattoos/cars as requested.
    STRICT CONSTRAINT: Do NOT change the person's facial features (eyes, nose, mouth shape, skin texture). Keep the face exactly the same.
    Understand all types of Persian styles, Iranian cars (like Samand, Peykan, Pride, etc.) and foreign cars.
    Respond with the modified image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1], // Strip the data:image/jpeg;base64, part
              mimeType: mimeType,
            },
          },
          {
            text: `${systemInstruction}\n\nUser's Persian Request: ${persianPrompt}`,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
