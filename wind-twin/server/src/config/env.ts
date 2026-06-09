import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.string().default('3001'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string(),
  INFLUX_URL: z.string().url(),
  INFLUX_TOKEN: z.string(),
  INFLUX_ORG: z.string(),
  INFLUX_BUCKET: z.string(),
  REDIS_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  SIMULATOR_INTERVAL_MS: z.string().default('500'),
  SIMULATOR_FAULT_PROBABILITY: z.string().default('0.02')
  // Optional SMTP/email settings
  ,SMTP_HOST: z.string().optional()
  ,SMTP_PORT: z.string().optional()
  ,SMTP_SECURE: z.string().optional()
  ,SMTP_USER: z.string().optional()
  ,SMTP_PASS: z.string().optional()
  ,EMAIL_FROM: z.string().optional()
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('Environment validation error', parsed.error.format())
  process.exit(1)
}

export const config = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT),
  SIMULATOR_INTERVAL_MS: Number(parsed.data.SIMULATOR_INTERVAL_MS),
  SIMULATOR_FAULT_PROBABILITY: Number(parsed.data.SIMULATOR_FAULT_PROBABILITY)
}
