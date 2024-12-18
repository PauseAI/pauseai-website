import { paraglide } from '@inlang/paraglide-sveltekit/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import type { UserConfig } from 'vite'

const config: UserConfig = {
	server: {
		port: 37572
	},
	plugins: [
		enhancedImages(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		sveltekit()
	]
}

export default config
