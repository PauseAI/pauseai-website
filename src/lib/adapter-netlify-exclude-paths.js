import adapter from '@sveltejs/adapter-netlify'
import { promises as fs } from 'fs'

const MANIFEST_PATH = '.netlify/edge-functions/manifest.json'

/**
 * @param {{split?: boolean, edge?: boolean, excludePatternsFromEdge: string[]}} opts
 * @returns {import('@sveltejs/kit').Adapter}
 */
export default function ({ split, edge, excludePatternsFromEdge }) {
    return {
        name: 'adapter-netlify-exclude-paths',
        async adapt(builder) {
            await adapter({ split, edge }).adapt(builder)
            if (!excludePatternsFromEdge) return
            if (!edge) throw new Error(`Can't use adapter option excludePatternsFromEdge if edge isn't enabled.`)
            const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf-8'))
            const renderFunction = manifest.functions.find((/** @type {{ function: string; }} */ route) => route.function == 'render')
            if (!renderFunction.excludedPattern) renderFunction.excludedPattern = []
            renderFunction.excludedPattern = excludePatternsFromEdge.concat(renderFunction.excludedPattern)
            await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest))
        }
    }
}
