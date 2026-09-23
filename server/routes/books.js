import { Router } from 'express';
import { hasApiKey } from '../config.js';
import { GENRES, MIN_COUNT, MAX_COUNT } from '../genres.js';
import { recommendBooks } from '../book-service.js';
import { rateLimit } from '../rate-limit.js';

export const booksRouter = Router();

// Lets the page know whether real AI answers are available.
booksRouter.get('/health', (req, res) => {
  res.json({ ai: hasApiKey });
});

booksRouter.get('/books', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const genre = String(req.query.genre ?? 'any');
  const count = Number.parseInt(req.query.count ?? '5', 10);

  // Validate input: only known genres and a small, safe number of books.
  if (!Object.hasOwn(GENRES, genre)) {
    res.status(400).json({ error: 'Unknown genre.' });
    return;
  }
  if (!Number.isInteger(count) || count < MIN_COUNT || count > MAX_COUNT) {
    res.status(400).json({ error: `Count must be between ${MIN_COUNT} and ${MAX_COUNT}.` });
    return;
  }
  if (!hasApiKey) {
    res.status(503).json({ error: 'OPENAI_API_KEY is not set on the server.' });
    return;
  }

  try {
    const books = await recommendBooks({ genreLabel: GENRES[genre], count });
    res.json({ source: 'openai', genre, books });
  } catch (error) {
    // Log the details on the server, send only a safe message to the browser.
    console.error('OpenAI request failed:', error.message);
    res.status(502).json({ error: 'Could not get books from OpenAI.' });
  }
});
