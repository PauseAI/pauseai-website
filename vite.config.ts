import { paraglide } from '@inlang/paraglide-sveltekit/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import type { UserConfig } from 'vite'
import { L10NS_BASE_DIR } from './src/lib/l10n-paths'
import { existsSync } from 'fs'

const config: UserConfig = {
	server: {
		port: 37572
	},
	plugins: [
		{
			name: 'check-translations',
			configureServer() {
				if (!existsSync(L10NS_BASE_DIR)) {
					throw new Error(
						"Localization cache not built. Please run 'pnpm build' first to:\n" +
							'- Copy source content as English l10ns\n' +
							'- Copy existing l10ons from repo_paraglide\n' +
							'- Create required directory structure for Vite'
					)
				}
			}
		},
		enhancedImages(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		sveltekit()
	]
}

export default config
