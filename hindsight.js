// Memory layer: one Hindsight "bank" per user = a persistent style brain.
// Docs: https://hindsight.vectorize.io (verify method signatures against your installed SDK version)
import { HindsightClient } from '@vectorize-io/hindsight-client';

const client = new HindsightClient({ baseUrl: process.env.HINDSIGHT_URL || 'http://localhost:8888' });
const bankFor = (userId) => `vf-${userId}`;

export async function remember(userId, content, context = 'virtual try-on session') {
  return client.retain(bankFor(userId), content, { context, timestamp: new Date().toISOString() });
}

export async function recallTaste(userId, query) {
  const res = await client.recall(bankFor(userId), query);
  return (res?.results || []).map((r) => r.text);
}

// Reflect = reasoning over memories, not just retrieval. This is the "learns over time" moment.
export async function reflectStyle(userId, question) {
  const res = await client.reflect(bankFor(userId), question);
  return res?.text || '';
}
