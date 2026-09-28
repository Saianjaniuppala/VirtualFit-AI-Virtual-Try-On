const BASE = import.meta.env.VITE_API || 'http://localhost:5000/api/stylist';
const post = (path, body) =>
  fetch(`${BASE}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then((r) => r.json()).catch(() => null); // demo never breaks if the server is down

export const sendEvent = (userId, type, garment, seconds) => post('/event', { userId, type, garment, seconds });
export const saveProfile = (p) => post('/profile', p);
export const getRecommendations = (userId, catalog) => post('/recommend', { userId, catalog });
