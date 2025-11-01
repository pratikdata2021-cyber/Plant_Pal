
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'POST') {
    const { prompt } = await req.json();
    await new Promise(res => setTimeout(res, 1000)); // Simulate AI thinking
    
    const mockResponse = `This is a mock AI response for your question: **"${prompt}"**. 
    
In a real application, I would provide a detailed, helpful answer about plant care. For example, if you asked about yellow leaves, I might suggest checking your watering schedule, light conditions, or for potential pests.`;
    
    return new Response(JSON.stringify({ response: mockResponse }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
