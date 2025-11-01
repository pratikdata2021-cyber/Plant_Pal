
import { mockPlants } from '../_data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // Simulate a network delay
        await new Promise(res => setTimeout(res, 500));
        return new Response(JSON.stringify(mockPlants), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Error fetching plants' }), { status: 500 });
      }

    case 'POST':
      try {
        const formData = await req.formData();
        const newPlantData: any = {};
        formData.forEach((value, key) => {
            newPlantData[key] = value;
        });

        const newPlant = {
            ...newPlantData,
            id: Date.now(), // simple unique ID
            image: 'https://picsum.photos/id/1025/500/600', // Mock image
            health: 'healthy',
            lastWatered: new Date().toISOString(),
            lastFertilized: new Date().toISOString(),
            lastGroomed: new Date().toISOString(),
        };
        
        mockPlants.unshift(newPlant as any); // Add to the start of the list

        return new Response(JSON.stringify(newPlant), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({ message: 'Error adding plant' }), { status: 500 });
      }

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}
