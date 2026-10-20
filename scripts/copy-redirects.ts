import { copyFile } from 'fs/promises'
import { USE_EDGE_FUNCTIONS } from '../svelte.config.js'

// adapter-netlify only copies _redirects into the publish directory when it
// generates lambda functions, so with edge functions we have to do it ourselves
if (!USE_EDGE_FUNCTIONS) {
	console.log('⏭️  Skipping _redirects copy - adapter copies it when not using edge functions')
	process.exit(0)
}

await copyFile('_redirects', 'build/_redirects')
