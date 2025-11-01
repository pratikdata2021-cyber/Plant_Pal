import { GoogleGenAI, Chat } from "@google/genai";

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
      const { prompt, history } = await req.json();

      if (!prompt) {
        return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
      }

      const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history.slice(0, -1).map((msg: any) => ({ // Remove the last user message from history
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }],
        })),
      });

      const result = await chat.sendMessage({ message: prompt });
      const response = result.text;
      
      return new Response(JSON.stringify({ response }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error: any) {
      console.error(error);
      return new Response(JSON.stringify({ error: 'Failed to fetch response from Gemini API', details: error.message }), { status: 500 });
    }
  }
  return new Response('Method Not Allowed', { status: 405 });
}
