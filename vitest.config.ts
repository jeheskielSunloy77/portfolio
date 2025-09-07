import { getViteConfig } from 'astro/config'

export default getViteConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/setupTests.ts'],
		globals: true,
		css: true,
	},
	resolve: {
		alias: {
			'astro:actions': 'src/actions',
		},
	},
})
