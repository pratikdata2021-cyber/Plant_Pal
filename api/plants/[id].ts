import { mockPlants } from '../_data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    const { method } = req;
    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/').pop() || '', 10);

    const plantIndex = mockPlants.findIndex(p => p.id === id);

    if (plantIndex === -1) {
        return new Response(JSON.stringify({ message: 'Plant not found' }), { status: 404 });
    }

    switch (method) {
        case 'PUT':
            try {
                const updatedData = await req.json();
                mockPlants[plantIndex] = { ...mockPlants[plantIndex], ...updatedData };
                return new Response(JSON.stringify(mockPlants[plantIndex]), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (error) {
                return new Response(JSON.stringify({ message: 'Error updating plant' }), { status: 500 });
            }

        case 'DELETE':
            try {
                mockPlants.splice(plantIndex, 1);
                return new Response(null, { status: 204 });
            } catch (error) {
                return new Response(JSON.stringify({ message: 'Error deleting plant' }), { status: 500 });
            }

        default:
            return new Response('Method Not Allowed', { status: 405 });
    }
}