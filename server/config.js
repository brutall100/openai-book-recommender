// All settings come from environment variables (.env file locally).
// Secrets are never written in the code.
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

export const config = {
  port: Number(process.env.PORT) || 6500,
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // Optional: point the client at a compatible API or a local mock.
  openaiBaseUrl: process.env.OPENAI_BASE_URL || undefined,
};

export const hasApiKey = config.openaiApiKey.length > 0;
