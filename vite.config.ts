import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

const config: UserConfig = {
	build: {
		rollupOptions: {
			external: ['/_pagefind/pagefind.js']
		}
	},
	server: {
		port: 37572
	},
	plugins: [sveltekit()]
}

export default config
