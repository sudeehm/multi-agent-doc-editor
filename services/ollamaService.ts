/**
 * Ollama Service - Local LLM Integration
 * Supports Gemma 2B and other open-source models via Ollama
 */

interface OllamaResponse {
    model: string;
    created_at: string;
    response: string;
    done: boolean;
}

interface OllamaGenerateRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
    };
}

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'gemma2:2b'; // Gemma 2B model

/**
 * Check if Ollama is running and accessible
 */
export const checkOllamaStatus = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        return response.ok;
    } catch (error) {
        console.error('Ollama is not running:', error);
        return false;
    }
};

/**
 * List available models in Ollama
 */
export const listOllamaModels = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
        const data = await response.json();
        return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
        console.error('Failed to list models:', error);
        return [];
    }
};

/**
 * Generate completion using Ollama
 */
const generateWithOllama = async (
    prompt: string,
    model: string = DEFAULT_MODEL,
    temperature: number = 0.7
): Promise<string> => {
    try {
        const requestBody: OllamaGenerateRequest = {
            model,
            prompt,
            stream: false,
            options: {
                temperature,
                top_p: 0.9,
                top_k: 40,
            },
        };

        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.statusText}`);
        }

        const data: OllamaResponse = await response.json();
        return data.response;
    } catch (error) {
        console.error('Ollama generation error:', error);
        throw new Error(`Failed to generate with Ollama: ${(error as Error).message}`);
    }
};

/**
 * Agent 1: The Analyst (Ollama version)
 * Takes raw text from a question bank and segments it into a list of questions.
 */
export const analyzeQuestionsWithOllama = async (
    questionBankText: string,
    model: string = DEFAULT_MODEL
): Promise<string[]> => {
    const prompt = `You are an expert educational content analyzer.
I have a raw text dump from a Question Bank document.
Your goal is to extract individual questions from this text.

Rules:
1. Ignore headers, footers, page numbers, or instructional text (e.g., "Answer all questions").
2. Extract only the question text.
3. If a question has sub-parts (a, b, c), try to keep them together as one question entry unless they are clearly distinct problems.
4. Return ONLY a JSON array of strings. No other text or explanation.
5. Format: ["question 1", "question 2", "question 3"]

Raw Text:
${questionBankText}

JSON Array:`;

    try {
        const response = await generateWithOllama(prompt, model, 0.3);

        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            console.warn('Could not extract JSON array from response');
            return [];
        }

        const questions = JSON.parse(jsonMatch[0]) as string[];
        return questions;
    } catch (error) {
        console.error('Ollama Analysis Error:', error);
        throw new Error('Failed to analyze question bank with Ollama.');
    }
};

/**
 * Agent 2: The Solver (Ollama version)
 * Answers a single question based on provided context notes.
 */
export const solveQuestionWithOllama = async (
    question: string,
    contextNotes: string,
    model: string = DEFAULT_MODEL
): Promise<string> => {
    // Truncate context to prevent overwhelming the model
    const truncatedContext = contextNotes.substring(0, 8000);

    const prompt = `You are an intelligent academic tutor.

Task: Answer the following question comprehensively using the provided Source Notes.

Source Notes:
${truncatedContext}

Question:
${question}

Instructions:
1. Answer clearly and concisely.
2. Use the source notes as the primary truth.
3. If the answer is not in the notes, use your general knowledge but mention that it was not explicitly found in the notes.
4. Format with clear paragraphs or bullet points if necessary.
5. Do NOT output Markdown formatting (like **bold**) excessively, as this will go into a plain Word doc. Keep it clean.
6. Provide a direct answer without repeating the question.

Answer:`;

    try {
        const answer = await generateWithOllama(prompt, model, 0.7);
        return answer.trim() || 'Could not generate answer.';
    } catch (error) {
        console.error('Ollama Solver Error:', error);
        return 'Error generating answer with Ollama.';
    }
};

/**
 * Pull a model from Ollama registry
 */
export const pullOllamaModel = async (modelName: string): Promise<void> => {
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: modelName }),
        });

        if (!response.ok) {
            throw new Error(`Failed to pull model: ${response.statusText}`);
        }

        // Note: This is a streaming response, but we're not handling the stream here
        console.log(`Model ${modelName} pull initiated`);
    } catch (error) {
        console.error('Failed to pull model:', error);
        throw error;
    }
};
