/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly SMTP_USER: string
	readonly SMTP_PASS: string
	readonly SMTP_HOST: string
	readonly SMTP_PORT: string
	readonly SMTP_RECEIVER_EMAIL: string
	readonly APP_URL: string
	readonly GEMINI_API_KEY: string
	readonly ASTRA_DB_API_ENDPOINT: string
	readonly ASTRA_DB_APPLICATION_TOKEN: string
	readonly ASTRA_DB_COLLECTION: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
