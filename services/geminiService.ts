import { GoogleGenAI, Type, Schema } from "@google/genai";
import { MoodAnalysisResult } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION_CHAT = `
You are Hum-AI, a supportive friend.
Your goal is to listen and provide gentle support.
CRITICAL: Keep your responses SHORT (1-2 sentences max usually).
Sound strictly human, casual, and empathetic. Do NOT sound like a robot or an AI.
Use lowercase occasionally or casual punctuation to feel more text-like.
Never say "I am an AI". Just be a friend.
`;

const MOOD_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    mood: { type: Type.STRING, description: "One word mood description, e.g., Anxious, Joyful, Melancholic" },
    intensity: { type: Type.NUMBER, description: "Intensity of the mood from 1 to 10" },
    color: { type: Type.STRING, description: "A hex color code representing the mood" },
    summary: { type: Type.STRING, description: "A short, empathetic 1-sentence summary of how they feel." },
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['music', 'activity', 'article', 'video'] },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          duration: { type: Type.STRING, description: "e.g., '5 mins', '3:04'" },
        },
        required: ['type', 'title', 'description'],
      }
    }
  },
  required: ['mood', 'intensity', 'color', 'summary', 'suggestions'],
};

export const analyzeUserMood = async (text: string): Promise<MoodAnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following user responses to a mental health check-in questionnaire. Determine their mood, intensity, and helpful content suggestions:
      
      ${text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: MOOD_SCHEMA,
        systemInstruction: "You are an expert psychologist and content curator. Analyze the user's answers deeply to understand their emotional state.",
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");
    
    return JSON.parse(jsonText) as MoodAnalysisResult;
  } catch (error) {
    console.error("Mood analysis failed", error);
    throw error;
  }
};

export const getChatResponse = async (history: {role: 'user' | 'model', text: string}[], message: string) => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_CHAT,
        },
        history: history.map(h => ({
            role: h.role,
            parts: [{ text: h.text }]
        }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
};