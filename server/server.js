import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { config, hasApiKey } from './config.js';
import { booksRouter } from './routes/books.js';

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = express();

app.disable('x-powered-by');

// API
app.use('/api', booksRouter);

// Front-end files. Only these folders are public – never the server code or .env.
for (const folder of ['css', 'js', 'images']) {
  app.use(`/${folder}`, express.static(path.join(rootDir, folder)));
}
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(config.port, () => {
  console.log(`Book recommender running at http://localhost:${config.port}`);
  if (!hasApiKey) {
    console.warn('No OPENAI_API_KEY found – the page will fall back to demo books.');
  }
});
