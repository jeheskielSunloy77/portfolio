import { z } from 'zod'

const schema = z.object({
	SMTP_USER: z.email(),
	SMTP_PASS: z.string().min(1),
	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number().int().positive(),
	SMTP_RECEIVER_EMAIL: z.email(),
	APP_URL: z.url(),
	GEMINI_API_KEY: z.string().min(1),
	ASTRA_DB_API_ENDPOINT: z.string().url(),
	ASTRA_DB_APPLICATION_TOKEN: z.string().min(1),
	ASTRA_DB_COLLECTION: z.string().min(1),

	MONGODB_URI: z.string().min(1),
	MONGODB_DB: z.string().min(1),
	SKETCHES_COLLECTION: z.string().min(1).optional(),
})

export const env = schema.parse(import.meta.env)
