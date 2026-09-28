import { Router } from 'express';
import { remember, recallTaste, reflectStyle } from '../hindsight.js';

const r = Router();

// Turn raw try-on behaviour into natural-language memories Hindsight can reason over.
const EVENT_TEXT = {
  tried:   (g, s) => `User tried on "${g.name}" (${g.category}, ${g.color}, ${g.pattern}) for ${Math.round(s)}s.`,
  liked:   (g)    => `User LIKED "${g.name}" (${g.category}, ${g.color}, ${g.pattern}, ${g.fit} fit).`,
  skipped: (g, s) => `User quickly skipped "${g.name}" (${g.color}, ${g.pattern}) after only ${Math.round(s)}s.`,
  saved:   (g)    => `User saved "${g.name}" to their wardrobe (${g.color}, ${g.pattern}).`,
};

r.post('/event', async (req, res) => {
  const { userId, type, garment, seconds = 0 } = req.body;
  if (!EVENT_TEXT[type]) return res.status(400).json({ error: 'bad event type' });
  await remember(userId, EVENT_TEXT[type](garment, seconds), `try-on:${type}`);
  res.json({ ok: true });
});

// Onboarding: skin tone / body type / occasion become long-term facts too.
r.post('/profile', async (req, res) => {
  const { userId, skinTone, bodyType, personality, occasion } = req.body;
  await remember(userId,
    `User profile: skin tone ${skinTone}, body type ${bodyType}, personality ${personality}, dressing for ${occasion}.`,
    'onboarding');
  res.json({ ok: true });
});

// Rank the catalog with recalled taste, then let reflect explain *why*.
r.post('/recommend', async (req, res) => {
  const { userId, catalog } = req.body;
  const memories = await recallTaste(userId, 'colours, patterns, fits and garments this user likes or dislikes');
  const blob = memories.join(' ').toLowerCase();
  const scored = catalog.map((g) => {
    let s = 0;
    [g.color, g.pattern, g.fit, g.category].forEach((k) => { if (k && blob.includes(k.toLowerCase())) s += 1; });
    return { ...g, score: s };
  }).sort((a, b) => b.score - a.score);
  const why = await reflectStyle(userId,
    "In 2 friendly sentences, describe this user's taste and what they should try next. Mention what changed since their first sessions.");
  res.json({ ranked: scored, why, memoriesUsed: memories.length });
});

export default r;
