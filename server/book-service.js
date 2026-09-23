import OpenAI from 'openai';
import { config } from './config.js';

const client = new OpenAI({
  apiKey: config.openaiApiKey || 'missing-key',
  baseURL: config.openaiBaseUrl,
});

/**
 * Ask OpenAI for book recommendations and return a clean array:
 * [{ title, author, year, why }]
 */
export async function recommendBooks({ genreLabel, count }) {
  const completion = await client.chat.completions.create({
    model: config.openaiModel,
    response_format: { type: 'json_object' },
    temperature: 0.9,
    messages: [
      {
        role: 'system',
        content:
          'You are a friendly librarian. Reply only with JSON shaped like ' +
          '{"books":[{"title":"","author":"","year":1900,"why":""}]}. ' +
          '"why" is one short sentence (max 20 words). Only recommend real, published books.',
      },
      {
        role: 'user',
        content: `Recommend ${count} great books to read. Genre: ${genreLabel}.`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? '{}';
  const data = JSON.parse(text);
  const books = Array.isArray(data.books) ? data.books : [];

  return books.slice(0, count).map((book) => ({
    title: String(book.title ?? '').slice(0, 120),
    author: String(book.author ?? '').slice(0, 80),
    year: Number.isInteger(book.year) ? book.year : null,
    why: String(book.why ?? '').slice(0, 200),
  })).filter((book) => book.title && book.author);
}
