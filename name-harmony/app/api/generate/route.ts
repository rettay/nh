// app/api/generate/route.ts

import { generateGivenNames } from '@/engine/generate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      surname = '',
      culture = 'english',
      weights = {},
      limit = 10
    } = body;

    if (!surname || typeof surname !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid surname' }), { status: 400 });
    }

    const names = generateGivenNames(surname, culture, weights, limit);

    return Response.json({ results: names });
  } catch (err: any) {
    console.error('Error generating names:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500 });
  }
}
