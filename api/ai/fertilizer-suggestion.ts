import { GoogleGenAI } from "@google/genai";

export const config = {
  runtime: 'nodejs',
};

// IMPORTANT: Set the API_KEY in your Vercel project settings
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({apiKey}) : null;

export default async function handler(req: Request) {
  if (!ai) {
    return new Response(JSON.stringify({ error: 'The AI provider is not configured. Please set the API_KEY environment variable in your Vercel project settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method === 'POST') {
    try {
        const { name, scientificName } = await req.json();
        
        const prompt = `Give a concise fertilizer suggestion for a ${name} (${scientificName}). Recommend a suitable NPK ratio and a feeding schedule for its growing season. Keep the response under 50 words.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const suggestion = response.text;
        
        return new Response(JSON.stringify({ suggestion }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch(error: any) {
        console.error("Error getting fertilizer suggestion:", error);
        return new Response(JSON.stringify({ error: 'Failed to get suggestion', details: error.message }), { status: 500 });
    }
  }
  return new Response('Method Not Allowed', { status: 405 });
}
