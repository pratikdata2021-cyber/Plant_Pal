
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'POST') {
    await req.formData(); // Consume the form data
    await new Promise(res => setTimeout(res, 1200)); // Simulate processing

    const mockDetails = {
      name: "Monstera",
      scientificName: "Monstera deliciosa",
      wateringFrequency: 8,
      fertilizingFrequency: 30,
      sunlight: "Bright Light",
      humidity: "High Humidity",
      notes: "Also known as the Swiss Cheese Plant. It enjoys climbing and may need a moss pole for support as it matures. Wiping leaves with a damp cloth keeps them dust-free and glossy."
    };
    
    return new Response(JSON.stringify(mockDetails), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
