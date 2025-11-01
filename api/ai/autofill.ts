import { GoogleGenAI } from "@google/genai";
import { Plant } from "../../components/Dashboard";

export const config = {
  runtime: 'edge',
};

// Helper functions to process image data in edge runtime
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
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is not configured. Please set the API_KEY environment variable.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
        return new Response(JSON.stringify({ error: 'Image file is required' }), { status: 400 });
    }

    const imageBytes = await streamToUint8Array(imageFile.stream());
    const base64Image = uint8ArrayToBase64(imageBytes);

    const ai = new GoogleGenAI({ apiKey });

    const textPart = {
      text: `Based on this image of a plant, provide care details as a JSON object. The JSON object must have the following keys: "scientificName" (string), "wateringFrequency" (integer, in days), "fertilizingFrequency" (integer, in days), "sunlight" (string, one of "Low Light", "Medium Light", "Bright Light"), "humidity" (string, one of "Low Humidity", "Medium Humidity", "High Humidity"), and "notes" (string, a brief care tip).`
    };

    const imagePart = {
      inlineData: {
        mimeType: imageFile.type,
        data: base64Image,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, imagePart] },
      config: {
        responseMimeType: "application/json",
      }
    });

    const details: Partial<Plant> = JSON.parse(response.text);

    return new Response(JSON.stringify(details), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error("Error with AI auto-fill:", error);
    return new Response(JSON.stringify({ error: 'Failed to auto-fill details', details: error.message }), { status: 500 });
  }
}