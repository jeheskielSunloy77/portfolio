import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./src/setupTests.ts'],
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov', 'html'],
			all: true,
			include: ['src/**/*.{ts,tsx,js,jsx}'],
			exclude: ['**/*.test.*', 'src/setupTests.ts', 'src/**/__tests__/**'],
		},
	},
})
