
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'POST') {
    const { name } = await req.json();
    await new Promise(res => setTimeout(res, 800)); // Simulate AI thinking

    const suggestion = `For a ${name}, a balanced liquid fertilizer with a 20-20-20 NPK ratio is a great choice. Dilute it to half-strength and apply every 4-6 weeks during the spring and summer growing season. Avoid fertilizing in the fall and winter.`;
    
    return new Response(JSON.stringify({ suggestion }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
