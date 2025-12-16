import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FactData, FactMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";
const ttsModelName = "gemini-2.5-flash-preview-tts";

const systemInstruction = `
You are a friendly, engaging science teacher for children (ages 4-8).
Your goal is to satisfy curiosity.
You operate in two modes:
1. OBSERVATION: State a simple, interesting, observable scientific fact. (e.g., "The sky is blue." or "Cats have whiskers.")
2. EXPLANATION: The child asked "Tell me more". Explain the previous observation. Keep it simple, scientifically accurate, and conversational.
Use bright, cheerful emojis.
For background colors, suggest a tailwind CSS class like 'bg-blue-100', 'bg-cyan-100', 'bg-yellow-100', 'bg-purple-100', 'bg-orange-100', 'bg-rose-100', 'bg-pink-100'.
CRITICAL: DO NOT use any green colors (like bg-green-100, bg-emerald-100, bg-lime-100) for the background, as that color is reserved for the UI.
`;

export const fetchFact = async (
  domain: string,
  mode: FactMode,
  context: {
    rootObservation?: string; // The original fact we are explaining
    lastFact?: string; // The immediate previous output
  }
): Promise<FactData> => {
  try {
    let prompt = "";

    if (mode === FactMode.OBSERVATION) {
      prompt = `
      Topic: ${domain}.
      Give me a new, simple scientific observation about ${domain}.
      It should be a short statement of fact that naturally invites the question "Why?" or "Tell me more".
      Example: "Bananas are curved." or "Stars twinkle at night."
      Length: 1 short sentence.
      `;
    } else {
      // Explanation Mode
      prompt = `
      Topic: ${domain}.
      Current Observation: "${context.rootObservation}".
      The child just heard: "${context.lastFact}".
      The child asked: "Tell me more"
      
      Task: Provide the next step of the explanation. 
      - Connect directly to the observation ("${context.rootObservation}").
      - You can explain a specific word from the last fact, or go deeper into the cause.
      - Keep it extremely simple for a 5-year-old.
      - Length: Exactly 1 short sentence.
      `;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fact: { type: Type.STRING, description: "The content text." },
            domain: { type: Type.STRING, description: "The category." },
            emoji: { type: Type.STRING, description: "A single emoji representing this specific fact." },
            backgroundColor: { type: Type.STRING, description: "A Tailwind CSS background color class." }
          },
          required: ["fact", "domain", "emoji", "backgroundColor"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Gemini");

    return JSON.parse(text) as FactData;

  } catch (error) {
    console.error("Error fetching fact:", error);
    // Fallback
    return {
      fact: "Science is full of amazing mysteries waiting to be solved!",
      domain: domain,
      emoji: "✨",
      backgroundColor: "bg-indigo-100"
    };
  }
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: ttsModelName,
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Puck' },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Error generating speech:", error);
    return undefined;
  }
};