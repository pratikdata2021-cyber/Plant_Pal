
import { mockArticles } from '../_data';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method === 'GET') {
    await new Promise(res => setTimeout(res, 400));
    return new Response(JSON.stringify(mockArticles), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new Response('Method Not Allowed', { status: 405 });
}
