import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'

const config = {
	server: {
		port: 37572
	},
	plugins: [enhancedImages(), sveltekit()]
}

export default config
