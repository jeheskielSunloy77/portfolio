import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
	resolve: {
		alias: {
			'@': path.resolve(rootDir, 'src'),
			'astro:actions': path.resolve(rootDir, 'src/actions/index.ts'),
			'astro:content': path.resolve(
				rootDir,
				'src/test-support/astro-content.ts'
			),
			'astro:env/server': path.resolve(
				rootDir,
				'src/test-support/astro-env-server.ts'
			),
			'astro/zod': 'zod',
			'astro/loaders': path.resolve(
				rootDir,
				'src/test-support/astro-loaders.ts'
			),
		},
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/setupTests.ts'],
		globals: true,
		css: true,
	},
})
