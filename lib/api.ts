import { Plant, JournalEntry, Article } from "../components/Dashboard";

const API_BASE_URL = '/api'; // Using a relative path for proxying

// --- Helper Function for API Requests ---
const apiRequest = async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', token: string, body?: any) => {
    const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
    };

    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
        if (body instanceof FormData) {
            // Let the browser set the Content-Type for FormData
        } else {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }
    
    if (body instanceof FormData) {
        options.body = body;
    }


    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) { // No Content
        return null;
    }
    
    return response.json();
};

// --- Authentication API ---
export const signIn = (credentials: { email: string; password: string }) => 
    fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    }).then(res => res.ok ? res.json() : Promise.reject(res.json()));

export const signUp = (userData: { fullname: string, email: string; password: string }) => 
    fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    }).then(res => res.ok ? res.json() : Promise.reject(res.json()));

// --- Plants API ---
export const getPlants = (token: string): Promise<Plant[]> => 
    apiRequest('/plants', 'GET', token);

export const addPlant = (plantData: FormData, token: string): Promise<Plant> => 
    apiRequest('/plants', 'POST', token, plantData);

export const updatePlant = (id: Plant['id'], plantData: Plant, token: string): Promise<Plant> =>
    apiRequest(`/plants/${id}`, 'PUT', token, plantData);

export const deletePlant = (id: Plant['id'], token: string): Promise<null> =>
    apiRequest(`/plants/${id}`, 'DELETE', token);
    
export const updatePlantActivity = (id: Plant['id'], activity: 'water' | 'fertilize' | 'groom', token: string): Promise<Plant> =>
    apiRequest(`/plants/${id}/activity`, 'POST', token, { activity });

// --- Journal API ---
export const getJournalEntries = (token: string): Promise<JournalEntry[]> =>
    apiRequest('/journal', 'GET', token);

export const addJournalEntry = (formData: FormData, token: string): Promise<JournalEntry> =>
    apiRequest('/journal', 'POST', token, formData);

export const deleteJournalEntry = (id: JournalEntry['id'], token: string): Promise<null> =>
    apiRequest(`/journal/${id}`, 'DELETE', token);

// --- Articles API ---
export const getArticles = (token: string): Promise<Article[]> =>
    apiRequest('/articles', 'GET', token);

// --- AI API ---
export const askAiChat = (prompt: string, history: any[], token: string): Promise<{ response: string }> =>
    apiRequest('/ai/chat', 'POST', token, { prompt, history });

export const identifyPlant = (image: File, token: string): Promise<{ name: string; match: number }> => {
    const formData = new FormData();
    formData.append('image', image);
    return apiRequest('/ai/identify', 'POST', token, formData);
};

export const autoFillPlantDetails = (image: File, token: string): Promise<Partial<Plant>> => {
    const formData = new FormData();
    formData.append('image', image);
    return apiRequest('/ai/autofill', 'POST', token, formData);
};

export const getFertilizerSuggestion = (plantInfo: { name: string, scientificName: string }, token: string): Promise<{ suggestion: string }> =>
    apiRequest('/ai/fertilizer-suggestion', 'POST', token, plantInfo);
