import { paraglide } from '@inlang/paraglide-sveltekit/vite'
import { sveltekit } from '@sveltejs/kit/vite'

const config = {
	server: {
		port: 37572
	},
	plugins: [
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		sveltekit()
	]
}

export default config
