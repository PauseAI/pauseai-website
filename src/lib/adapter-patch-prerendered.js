import * as runtime from './paraglide/runtime.js'

/**
 * @param {import("@sveltejs/kit").Adapter} adapter
 * @returns {import("@sveltejs/kit").Adapter}
 */
export default function (adapter) {
	return {
		...adapter,
		name: 'adapter-patch-prerendered',
		adapt(builder) {
			builder.prerendered.paths = builder.prerendered.paths.filter((path) => {
				for (const tag of runtime.availableLanguageTags) {
					if (path.startsWith('/' + tag)) return true
				}
			})
			adapter.adapt(builder)
		}
	}
}
