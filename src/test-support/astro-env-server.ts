export const GEMINI_API_KEY =
	process.env.GEMINI_API_KEY ?? 'test-gemini-api-key'
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'test-gemini-model'
export const MONGODB_URI =
	process.env.MONGODB_URI ?? 'mongodb://localhost:27017/test'
export const MONGODB_DB = process.env.MONGODB_DB ?? 'portfolio_test'
export const SMTP_HOST = process.env.SMTP_HOST ?? 'smtp.example.com'
export const SMTP_PORT = Number(process.env.SMTP_PORT ?? '465')
export const SMTP_USER = process.env.SMTP_USER ?? 'test@example.com'
export const SMTP_PASS = process.env.SMTP_PASS ?? 'test-password'
