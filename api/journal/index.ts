
import { mockJournalEntries } from '../_data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  switch (req.method) {
    case 'GET':
      await new Promise(res => setTimeout(res, 300));
      return new Response(JSON.stringify(mockJournalEntries), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    case 'POST':
      const formData = await req.formData();
      const newEntry = {
        id: Date.now(),
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        date: new Date().toISOString(),
      };
      mockJournalEntries.unshift(newEntry);
      return new Response(JSON.stringify(newEntry), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });

    default:
      return new Response('Method Not Allowed', { status: 405 });
  }
}
