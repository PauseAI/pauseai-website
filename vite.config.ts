import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { viteTypographyPlugin } from './src/lib/typographyPlugin'

const config = {
	server: {
		port: 37572
	},
	plugins: [enhancedImages(), sveltekit(), viteTypographyPlugin],
	test: {
		chaiConfig: {
			truncateThreshold: 0
		}
	}
}

export default config
