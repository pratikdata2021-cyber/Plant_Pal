import { mockJournalEntries } from '../_data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/').pop() || '', 10);
    const entryIndex = mockJournalEntries.findIndex(e => e.id === id);

    if (entryIndex === -1) {
        return new Response(JSON.stringify({ message: 'Journal entry not found' }), { status: 404 });
    }

    if (req.method === 'DELETE') {
        mockJournalEntries.splice(entryIndex, 1);
        return new Response(null, { status: 204 });
    }

    return new Response('Method Not Allowed', { status: 405 });
}