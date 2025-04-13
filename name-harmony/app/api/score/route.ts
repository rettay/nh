import { scoreName } from '@/engine';

export async function POST(request: Request) {
  const body = await request.json();
  const { first = '', last = '', culture = 'english', weights = {} } = body;

  const result = scoreName(first, last, culture, weights);

  return Response.json(result);
}
