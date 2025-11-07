import type { Manifest } from '@netlify/edge-functions'
import fs from 'fs/promises'

const MANIFEST_PATH = '.netlify/edge-functions/manifest.json'

export async function readEdgeManifest(): Promise<Manifest> {
	return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'))
}

export function searchRenderFunction(manifest: Manifest) {
	return manifest.functions.find((route) => route.function == 'render')
}

export async function writeEdgeManifest(manifest: Manifest) {
	await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest))
}
