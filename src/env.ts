import { z } from 'zod'

const schema = z.object({
	SMTP_USER: z.email(),
	SMTP_PASS: z.string().min(1),
	SMTP_HOST: z.string().min(1),
	SMTP_PORT: z.coerce.number().int().positive(),
	SMTP_RECEIVER_EMAIL: z.email(),
	APP_URL: z.url(),
})

export const env = schema.parse(import.meta.env)
