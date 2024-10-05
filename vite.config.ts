import { partytownVite } from '@builder.io/partytown/utils'
import { join } from 'path'
import { sveltekit } from '@sveltejs/kit/vite'

const config = {
	server: {
		port: 37572
	},
	plugins: [
		// Partytown first because SvelteKit copies /static in same hook
		partytownVite({
			// Place in /static as /build is wiped by adapter which always runs last
			dest: join(__dirname, 'static', '~partytown')
		}),
		sveltekit()
	]
}

export default config
