export const APP_URL = process.env.APP_URL ?? 'http://localhost:4321'
export const AI_PROVIDER = process.env.AI_PROVIDER ?? 'google'
export const AI_API_KEY = process.env.AI_API_KEY ?? 'test-ai-key'
export const AI_MODEL = process.env.AI_MODEL ?? 'gemini-2.5-flash'
export const AI_BASE_URL = process.env.AI_BASE_URL
export const MONGODB_URI =
	process.env.MONGODB_URI ?? 'mongodb://localhost:27017/test'
export const MONGODB_DB = process.env.MONGODB_DB ?? 'portfolio_test'
export const SMTP_URL = process.env.SMTP_URL
