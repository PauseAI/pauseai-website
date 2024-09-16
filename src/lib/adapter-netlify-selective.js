import adapter from '@sveltejs/adapter-netlify'
import fs from 'fs/promises'

const NAME = 'adapter-netlify-selective'
const MANIFEST_PATH = '.netlify/edge-functions/manifest.json'
const FUNCTION_NAME = 'render'

export default function ({ split = undefined, edge = undefined } = {}) {
	const adapterNetlify = adapter({ split, edge })
	adapterNetlify.name = NAME
	const adaptNetlify = adapterNetlify.adapt
	adapterNetlify.adapt = async function (builder) {
		await adaptNetlify(builder)

		if (!edge) throw new Error(`${NAME} only works for edge functions`)

		const dynamicRoutes = builder.routes.filter((route) => !route.prerender)
		const dynamicRoutesPattern = dynamicRoutes
			.map((route) => '(' + route.pattern.source + ')')
			.join('|')

		/** @type import("./types").EdgeManifest */
		const edgeManifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'))
		const renderFunction = edgeManifest.functions.find((f) => f.function == FUNCTION_NAME)
		if (!renderFunction) throw Error('Render function not found in edge manifest')
		renderFunction.pattern = dynamicRoutesPattern
		await fs.writeFile(MANIFEST_PATH, JSON.stringify(edgeManifest))
		builder.log(`Limited edge function to ${dynamicRoutes.length} dynamic routes`)
	}
	return adapterNetlify
}
