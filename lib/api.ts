import { Plant, JournalEntry, Article } from "../components/Dashboard";
import { mockPlants, mockJournalEntries, mockArticles, users as mockUsers } from '../api/_data';
import { GoogleGenAI } from "@google/genai";

// --- Helper Functions for client-side persistence ---
const persistData = (key: string, data: any) => {
    try {
        // Using sessionStorage to persist data for the duration of the browser tab session
        sessionStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("Failed to persist data to sessionStorage", e);
    }
};

const loadData = <T>(key: string, defaultValue: T): T => {
    try {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error("Failed to load data from sessionStorage", e);
        return defaultValue;
    }
};

// Initialize data, using sessionStorage if available to persist state during a session
let plants: Plant[] = loadData('plants', mockPlants);
let journalEntries: JournalEntry[] = loadData('journalEntries', mockJournalEntries);
let users: any[] = loadData('users', mockUsers);

const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Authentication API ---
export const signIn = async (credentials: { email: string; password: string }): Promise<{ token: string }> => {
    await simulateDelay(500);
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    if (user) {
        // The token now just holds basic user info, encoded
        const token = btoa(JSON.stringify({ email: user.email, id: user.id, name: user.fullname }));
        return { token };
    } else {
        throw new Error("Invalid email or password.");
    }
};

export const signUp = async (userData: { fullname: string, email: string; password: string }): Promise<{ token: string }> => {
    await simulateDelay(500);
    if (users.some(u => u.email === userData.email)) {
        throw new Error("An account with this email already exists.");
    }
    const newUser = { id: Date.now(), ...userData };
    users = [...users, newUser];
    persistData('users', users);
    
    const token = btoa(JSON.stringify({ email: newUser.email, id: newUser.id, name: newUser.fullname }));
    return { token };
};

// --- Plants API ---
export const getPlants = async (token: string): Promise<Plant[]> => {
    await simulateDelay(500);
    plants = loadData('plants', mockPlants); // Ensure we have the latest data for the session
    return [...plants]; // Return a copy to prevent direct mutation
};

export const addPlant = async (plantFormData: FormData, token: string): Promise<Plant> => {
    await simulateDelay(500);
    
    const newPlantData: any = {};
    plantFormData.forEach((value, key) => {
        if (key !== 'photo') {
            newPlantData[key] = value;
        }
    });

    const lightValue = (newPlantData.sunlight as string).split(' ')[0];
    const photoFile = plantFormData.get('photo') as File | null;

    const newPlant: Plant = {
        id: Date.now(),
        name: newPlantData.name,
        scientificName: newPlantData.scientificName,
        location: newPlantData.location,
        wateringFrequency: parseInt(newPlantData.wateringFrequency, 10),
        fertilizingFrequency: parseInt(newPlantData.fertilizingFrequency, 10),
        groomingFrequency: parseInt(newPlantData.groomingFrequency, 10),
        sunlight: newPlantData.sunlight,
        humidity: newPlantData.humidity,
        notes: newPlantData.notes,
        light: lightValue,
        image: photoFile ? URL.createObjectURL(photoFile) : 'https://images.unsplash.com/photo-1545239709-1d2d86160869?w=500&h=600&fit=crop&q=80',
        health: 'healthy',
        lastWatered: new Date().toISOString(),
        lastFertilized: new Date().toISOString(),
        lastGroomed: new Date().toISOString(),
    };
    
    plants.unshift(newPlant);
    persistData('plants', plants);
    return newPlant;
};

export const updatePlant = async (id: Plant['id'], plantData: Plant, token: string): Promise<Plant> => {
    await simulateDelay(300);
    const plantIndex = plants.findIndex(p => p.id === id);
    if (plantIndex === -1) throw new Error("Plant not found");
    plants[plantIndex] = { ...plants[plantIndex], ...plantData };
    persistData('plants', plants);
    return plants[plantIndex];
};

export const deletePlant = async (id: Plant['id'], token: string): Promise<null> => {
    await simulateDelay(300);
    plants = plants.filter(p => p.id !== id);
    persistData('plants', plants);
    return null;
};

export const updatePlantActivity = async (id: Plant['id'], activity: 'water' | 'fertilize' | 'groom', token: string): Promise<Plant> => {
    await simulateDelay(200);
    const plantIndex = plants.findIndex(p => p.id === id);
    if (plantIndex === -1) throw new Error("Plant not found");

    const today = new Date().toISOString();
    if (activity === 'water') plants[plantIndex].lastWatered = today;
    if (activity === 'fertilize') plants[plantIndex].lastFertilized = today;
    if (activity === 'groom') plants[plantIndex].lastGroomed = today;
    
    persistData('plants', plants);
    return plants[plantIndex];
};

// --- Journal API ---
export const getJournalEntries = async (token: string): Promise<JournalEntry[]> => {
    await simulateDelay(300);
    journalEntries = loadData('journalEntries', mockJournalEntries);
    return [...journalEntries];
};

export const addJournalEntry = async (formData: FormData, token: string): Promise<JournalEntry> => {
    await simulateDelay(400);
    const file = formData.get('file') as File | null;
    const newEntry: JournalEntry = {
        id: Date.now(),
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        date: new Date().toISOString(),
        file: file ? {
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'pdf',
            url: URL.createObjectURL(file)
        } : undefined
    };
    journalEntries.unshift(newEntry);
    persistData('journalEntries', journalEntries);
    return newEntry;
};

export const deleteJournalEntry = async (id: JournalEntry['id'], token: string): Promise<null> => {
    await simulateDelay(300);
    journalEntries = journalEntries.filter(e => e.id !== id);
    persistData('journalEntries', journalEntries);
    return null;
};

// --- Articles API ---
export const getArticles = async (token: string): Promise<Article[]> => {
    await simulateDelay(400);
    return mockArticles;
};

// --- AI API ---
const getAi = () => {
    if (!process.env.API_KEY) {
        console.error('API_KEY environment variable not set for client-side AI calls.');
        throw new Error('AI features are disabled. API key is not configured.');
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
});


export const askAiChat = async (prompt: string, history: { role: 'user' | 'model', text: string }[], token: string): Promise<{ response: string }> => {
    try {
        const ai = getAi();
        const chatHistoryPayload = history
            .filter(msg => msg.text)
            .map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }],
            }));
        if (chatHistoryPayload.length > 0 && chatHistoryPayload[0].role === 'model') {
            chatHistoryPayload.shift();
        }

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: chatHistoryPayload,
        });

        const result = await chat.sendMessage({ message: prompt });
        return { response: result.text };
    } catch (error) {
        console.error("Error in askAiChat:", error);
        return { response: "Sorry, I'm having trouble connecting to the AI service right now. Please ensure your API key is set up correctly." };
    }
};

export const identifyPlant = async (image: File, token: string): Promise<{ name: string; match: number }> => {
    const ai = getAi();
    const base64Image = await fileToBase64(image);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: `Identify the plant in this image. Provide its common name and scientific name. Also provide a confidence score from 0 to 100 for your identification. Respond with only a JSON object in the format: {"name": "Common Name (Scientific Name)", "match": 95}` },
                { inlineData: { mimeType: image.type, data: base64Image } }
            ]
        },
        config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text);
};

export const autoFillPlantDetails = async (image: File, token: string): Promise<Partial<Plant>> => {
    const ai = getAi();
    const base64Image = await fileToBase64(image);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: `Based on this image of a plant, provide care details as a JSON object. The JSON object must have the following keys: "scientificName" (string), "wateringFrequency" (integer, in days), "fertilizingFrequency" (integer, in days), "sunlight" (string, one of "Low Light", "Medium Light", "Bright Light"), "humidity" (string, one of "Low Humidity", "Medium Humidity", "High Humidity"), and "notes" (string, a brief care tip).` },
                { inlineData: { mimeType: image.type, data: base64Image } }
            ]
        },
        config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
};

export const getFertilizerSuggestion = async (plantInfo: { name: string, scientificName: string }, token: string): Promise<{ suggestion: string }> => {
    const ai = getAi();
    const prompt = `Give a concise fertilizer suggestion for a ${plantInfo.name} (${plantInfo.scientificName}). Recommend a suitable NPK ratio and a feeding schedule for its growing season. Keep the response under 50 words.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return { suggestion: response.text };
};