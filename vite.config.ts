import { sveltekit } from '@sveltejs/kit/vite'

const config = {
	server: {
		port: 37572
	},
	plugins: [sveltekit()]
}

export default config
