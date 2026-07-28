import type { ManifestFunction } from '@netlify/edge-functions'
import fs from 'fs/promises'

/**
 * The Netlify Frameworks API config file path (adapter-netlify >= 7).
 * @see {@link https://docs.netlify.com/build/frameworks/frameworks-api/}
 */
const CONFIG_PATH = '.netlify/v1/config.json'

/**
 * The edge function name produced by @sveltejs/adapter-netlify.
 * - v5: `render`
 * - v6: `render`
 * - v7: `sveltekit-render`
 */
const RENDER_FUNCTION_NAME = 'sveltekit-render'

/**
 * Shape of the `.netlify/v1/config.json` file written by adapter-netlify >= 7.
 * @see {@link https://docs.netlify.com/build/frameworks/frameworks-api/#netlifyv1edge-functions}
 */
interface FrameworksConfig {
	edge_functions?: ManifestFunction[]
	headers?: Array<{ for: string; values: Record<string, string> }>
}

/**
 * Reads the Netlify Frameworks API config file (adapter-netlify >= 7).
 */
export async function readEdgeConfig(): Promise<FrameworksConfig> {
	const parsed = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8')) as FrameworksConfig
	return parsed
}

/**
 * Finds the SvelteKit render edge function entry in the config.
 */
export function searchRenderFunction(config: FrameworksConfig): ManifestFunction | undefined {
	return config.edge_functions?.find((route) => route.function === RENDER_FUNCTION_NAME)
}

/**
 * Writes the Netlify Frameworks API config file back to disk.
 */
export async function writeEdgeConfig(config: FrameworksConfig): Promise<void> {
	await fs.writeFile(CONFIG_PATH, JSON.stringify(config))
}
