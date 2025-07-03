import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  FEDEX_API_KEY: z.string(),
  FEDEX_API_SECRET: z.string(),
  FEDEX_BASE_URL: z.string(),
  UPS_API_KEY: z.string(),
  UPS_API_SECRET: z.string(),
  UPS_BASE_URL: z.string(),
  DHL_API_KEY: z.string(),
  DHL_API_SECRET: z.string(),
  DHL_BASE_URL: z.string(),
  PUROLATOR_API_KEY: z.string(),
  PUROLATOR_API_SECRET: z.string(),
  PUROLATOR_BASE_URL: z.string(),
  DATABASE_URL: z.string(),
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.log('❌ Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data
