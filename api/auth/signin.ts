
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'POST') {
    // In a real app, you'd validate credentials against a database.
    // Here, we'll just simulate a successful login.
    const body = await req.json();

    if (!body.email || !body.password) {
      return new Response(JSON.stringify({ message: 'Email and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Simulate success
    return new Response(JSON.stringify({ token: 'fake-jwt-token-for-plant-pal' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
