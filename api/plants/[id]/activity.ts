import { mockPlants } from '../../_data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    const { method } = req;
    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/')[3] || '', 10);
    
    const plantIndex = mockPlants.findIndex(p => p.id === id);

    if (plantIndex === -1) {
        return new Response(JSON.stringify({ message: 'Plant not found' }), { status: 404 });
    }
    
    if (method === 'POST') {
        try {
            const { activity } = await req.json();
            const today = new Date().toISOString();
            
            if (activity === 'water') {
                mockPlants[plantIndex].lastWatered = today;
            } else if (activity === 'fertilize') {
                mockPlants[plantIndex].lastFertilized = today;
            } else if (activity === 'groom') {
                mockPlants[plantIndex].lastGroomed = today;
            } else {
                return new Response(JSON.stringify({ message: 'Invalid activity' }), { status: 400 });
            }
            
            return new Response(JSON.stringify(mockPlants[plantIndex]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (error) {
            return new Response(JSON.stringify({ message: 'Error updating activity' }), { status: 500 });
        }
    }

    return new Response('Method Not Allowed', { status: 405 });
}