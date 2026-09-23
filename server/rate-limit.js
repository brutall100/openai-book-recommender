// Tiny in-memory rate limiter so nobody can burn through your OpenAI credits.
export function rateLimit({ windowMs, max }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const entry = hits.get(req.ip) ?? { count: 0, start: now };

    if (now - entry.start > windowMs) {
      entry.count = 0;
      entry.start = now;
    }

    entry.count += 1;
    hits.set(req.ip, entry);

    if (entry.count > max) {
      res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
      return;
    }
    next();
  };
}
