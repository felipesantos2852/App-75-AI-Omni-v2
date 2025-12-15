import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem, Macros } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants for models
const MODEL_FAST = 'gemini-2.5-flash';

export const analyzeNutrition = async (text: string): Promise<FoodItem[]> => {
  try {
    const prompt = `Analise a ingestão alimentar descrita e estime os macronutrientes. Retorne uma lista de itens. Se o input for em português, mantenha os nomes em português. Input: "${text}"`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fats: { type: Type.NUMBER },
                },
                required: ["name", "calories", "protein", "carbs", "fats"]
              }
            }
          },
          required: ["items"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const data = JSON.parse(jsonText);
    
    // Map to our internal structure
    return data.items.map((item: any) => ({
      name: item.name,
      macros: {
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
      }
    }));

  } catch (error) {
    console.error("Gemini Nutrition API Error:", error);
    return [];
  }
};

export const getAlternativeExercise = async (currentExerciseName: string, targetMuscles: string): Promise<{ name: string, description: string } | null> => {
  try {
    const prompt = `Sugira APENAS UM exercício alternativo para substituir "${currentExerciseName}".
    Regras:
    1. Deve trabalhar o mesmo grupo muscular principal: "${targetMuscles}".
    2. Deve ser biomecanicamente similar ou equivalente em intensidade.
    3. Retorne JSON com "name" e "description" (curta, em português).`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "description"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini Exercise Swap API Error:", error);
    return null;
  }
};

export const suggestNewExercise = async (routineName: string, existingExercises: string[]): Promise<{ name: string, description: string, targetMuscles: string, sets: number, reps: string } | null> => {
  try {
    const prompt = `Sugira um novo exercício para adicionar a rotina de treino "${routineName}".
    Exercícios já existentes na rotina: ${existingExercises.join(', ')}.
    Regras:
    1. O exercício deve complementar os existentes (trabalhar um ângulo diferente ou músculo faltante nessa rotina).
    2. Retorne JSON com name, description (curta), targetMuscles, sets (número sugerido) e reps (string ex: '10-12').`;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            targetMuscles: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING }
          },
          required: ["name", "description", "targetMuscles", "sets", "reps"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini New Exercise API Error:", error);
    return null;
  }
};

export const generateExerciseIllustration = async (exerciseName: string): Promise<string | null> => {
  const prompt = `Minimalist vector line art illustration of the gym exercise: "${exerciseName}". 
  Style: White lines on a solid black background. High contrast. Technical drawing. 
  Focus on correct biomechanics and form. No text, no shading.`;

  try {
    // Attempt 1: Use Imagen 3.0 (Best for Image Generation)
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg'
      }
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    if (base64) {
      return `data:image/jpeg;base64,${base64}`;
    }
  } catch (error) {
    console.error("Imagen Error (trying fallback):", error);
  }

  try {
    // Attempt 2: Fallback to Gemini 2.5 Flash Image (Multimodal)
    const fallbackResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { 
          parts: [{ text: `Generate an image. ${prompt}` }] 
      }
    });

    for (const part of fallbackResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Gemini Flash Image Error:", error);
  }

  return null;
};

export const chatWithCoach = async (
  message: string, 
  history: { role: string, parts: { text: string }[] }[],
  userContext: string
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: MODEL_FAST,
      history: history,
      config: {
        systemInstruction: `Você é o "Coach 75", um treinador especialista em hipertrofia e nutrição focado em ajudar o usuário a ir de 68kg para 75kg (ganho de massa magra).
        Idioma: Português do Brasil.
        Tom: Encorajador, rígido mas justo, baseado em dados e conciso.
        Contexto do Usuário: ${userContext}
        Mantenha as respostas curtas e acionáveis (menos de 100 palavras, a menos que peçam um plano detalhado).`,
      }
    });

    const result = await chat.sendMessage({ message });
    return result.text || "Estou com dificuldades para conectar ao mainframe muscular. Tente novamente.";
  } catch (error) {
    console.error("Gemini Chat API Error:", error);
    return "Erro de rede. Até as máquinas precisam de um deload às vezes.";
  }
};