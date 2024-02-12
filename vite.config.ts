import { sveltekit } from '@sveltejs/kit/vite'
import type { UserConfig } from 'vite'

const config: UserConfig = {
	server: {
		port: 37572
	},
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: ['/pagefind/pagefind.js']
		}
	},
	assetsInclude: '**/pagefind.js'
}

export default config
