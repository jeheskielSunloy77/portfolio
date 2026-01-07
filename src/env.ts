import { z } from 'zod'

export const envSchema = z.object({
	SMTP_USER: z.email(),
	SMTP_PASS: z.string().min(1),
	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number().int().positive(),
	SMTP_RECEIVER_EMAIL: z.email(),
	APP_URL: z.url(),
	GEMINI_API_KEY: z.string().min(1),
	PINECONE_API_KEY: z.string().min(1),
	PINECONE_INDEX: z.string().min(1),
	PINECONE_NAMESPACE: z.string().min(1).optional(),
	MONGODB_URI: z.string().min(1),
	MONGODB_DB: z.string().min(1),
})
