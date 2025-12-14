import { GoogleGenAI, Type } from "@google/genai";
import {
  analyzeQuestionsWithOllama,
  solveQuestionWithOllama,
  checkOllamaStatus
} from './ollamaService';

// We maintain a singleton-like instance creation pattern inside the functions to ensure latest API key is used.

// Configuration for model selection
export type ModelProvider = 'gemini' | 'ollama';
let currentProvider: ModelProvider = 'gemini'; // Default to Gemini

export const setModelProvider = (provider: ModelProvider) => {
  currentProvider = provider;
};

export const getModelProvider = (): ModelProvider => {
  return currentProvider;
};

/**
 * Auto-detect which provider to use
 * Falls back to Gemini if Ollama is not available
 */
export const autoDetectProvider = async (): Promise<ModelProvider> => {
  const apiKey = process.env.API_KEY;
  const ollamaAvailable = await checkOllamaStatus();

  if (ollamaAvailable) {
    return 'ollama';
  } else if (apiKey) {
    return 'gemini';
  } else {
    throw new Error('No AI provider available. Please set up Gemini API key or install Ollama.');
  }
};

/**
 * Agent 1: The Analyst
 * Takes raw text from a question bank and segments it into a list of questions.
 * Supports both Gemini and Ollama providers.
 */
export const analyzeQuestions = async (questionBankText: string): Promise<string[]> => {
  // Use Ollama if selected
  if (currentProvider === 'ollama') {
    return analyzeQuestionsWithOllama(questionBankText);
  }

  // Otherwise use Gemini
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not set");

  const ai = new GoogleGenAI({ apiKey });

  // Using Flash for speed in large text processing, but Pro is better for complex parsing.
  // We'll use Flash for responsiveness.
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are an expert educational content analyzer.
    I have a raw text dump from a Question Bank document.
    Your goal is to extract individual questions from this text.
    
    Rules:
    1. Ignore headers, footers, page numbers, or instructional text (e.g., "Answer all questions").
    2. Extract only the question text.
    3. If a question has sub-parts (a, b, c), try to keep them together as one question entry unless they are clearly distinct distinct problems.
    4. Return ONLY a JSON array of strings.
    
    Raw Text:
    ${questionBankText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    return JSON.parse(jsonText) as string[];

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze question bank.");
  }
};

/**
 * Agent 2: The Solver
 * Answers a single question based on provided context notes.
 * Supports both Gemini and Ollama providers.
 */
export const solveQuestion = async (question: string, contextNotes: string): Promise<string> => {
  // Use Ollama if selected
  if (currentProvider === 'ollama') {
    return solveQuestionWithOllama(question, contextNotes);
  }

  // Otherwise use Gemini
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not set");

  const ai = new GoogleGenAI({ apiKey });

  // Flash is excellent for high-volume RAG tasks.
  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are an intelligent academic tutor.
    
    Task: Answer the following question comprehensively using the provided Source Notes.
    
    Source Notes:
    ${contextNotes.substring(0, 50000)} 
    (Note: Context truncated to 50k chars to ensure safety, though model handles more)

    Question:
    ${question}

    Instructions:
    1. Answer clearly and concisely.
    2. Use the source notes as the primary truth.
    3. If the answer is not in the notes, use your general knowledge but mention that it was not explicitly found in the notes.
    4. Format with clear paragraphs or bullet points if necessary.
    5. Do NOT output Markdown formatting (like **bold**) excessively, as this will go into a plain Word doc. Keep it clean.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Could not generate answer.";
  } catch (error) {
    console.error("Gemini Solver Error:", error);
    return "Error generating answer.";
  }
};
