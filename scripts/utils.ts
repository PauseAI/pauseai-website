import fs from 'fs/promises'

const MANIFEST_PATH = '.netlify/edge-functions/manifest.json'

export async function readEdgeManifest() {
	return JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'))
}

export function searchRenderFunction(manifest) {
	return manifest.functions.find((route: { function: string }) => route.function == 'render')
}

export async function writeEdgeManifest(manifest) {
	await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest))
}
