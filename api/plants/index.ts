
import { mockPlants } from '../_data';
import { Plant } from '../../components/Dashboard';

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

        const lightValue = (newPlantData.sunlight as string).split(' ')[0];

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
            image: 'https://picsum.photos/id/1025/500/600',
            health: 'healthy',
            lastWatered: new Date().toISOString(),
            lastFertilized: new Date().toISOString(),
            lastGroomed: new Date().toISOString(),
        };
        
        mockPlants.unshift(newPlant);

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
