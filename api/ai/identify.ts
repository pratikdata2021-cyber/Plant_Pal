import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

export const config = {
  runtime: 'nodejs',
};

// IMPORTANT: Set the API_KEY in your Vercel project settings
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({apiKey}) : null;

// FIX: Replaced Node.js Buffer with Uint8Array and a helper function to avoid type errors in some environments.
// Helper to convert stream to Uint8Array
async function streamToUint8Array(stream: ReadableStream): Promise<Uint8Array> {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
    }
    return result;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}


export default async function handler(req: Request) {
  if (!ai) {
    return new Response(JSON.stringify({ error: 'The AI provider is not configured. Please set the API_KEY environment variable in your Vercel project settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
  
  if (req.method === 'POST') {
    try {
        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return new Response(JSON.stringify({ error: 'Image file is required' }), { status: 400 });
        }

        const imageBytes = await streamToUint8Array(imageFile.stream());
        const base64Image = uint8ArrayToBase64(imageBytes);
        const mimeType = imageFile.type;

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType,
            },
        };

        const textPart = {
            text: "Identify the plant in this image. Provide its common name and scientific name. Also provide a confidence score from 0 to 100 for your identification. Respond with only a JSON object in the format: {\"name\": \"Common Name (Scientific Name)\", \"match\": 95}",
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });
        
        const text = response.text.replace(/```json|```/g, '').trim();
        const result = JSON.parse(text);

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error identifying plant with Gemini:", error);
        return new Response(JSON.stringify({ error: 'Failed to identify plant', details: error.message }), { status: 500 });
    }
  }
  return new Response('Method Not Allowed', { status: 405 });
}
