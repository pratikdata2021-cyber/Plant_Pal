
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'POST') {
    await req.formData(); // Consume the form data
    await new Promise(res => setTimeout(res, 1500)); // Simulate identification processing
    
    const result = {
      name: "Monstera Deliciosa (Mock)",
      match: 95
    };
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
