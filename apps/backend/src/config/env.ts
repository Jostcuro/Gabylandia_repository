import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email().optional(),
  GOOGLE_PRIVATE_KEY: z.string().optional(),
  GOOGLE_SHEETS_ID: z.string().min(10).optional(),
  GOOGLE_SHEETS_TAB: z.string().default('backup')
});

export const env = envSchema.parse(process.env);
