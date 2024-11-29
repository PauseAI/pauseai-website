import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import netlifyAdapter from '@sveltejs/adapter-netlify'

const config = {
	kit: {
		adapter: netlifyAdapter()
	},
	server: {
		port: 37572
	},
	plugins: [enhancedImages(), sveltekit()]
}

export default config
