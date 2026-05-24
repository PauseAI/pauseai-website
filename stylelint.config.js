import { getIgnores } from './scripts/utils/ignores.js'

/** @type {import('stylelint').Config} */
export default {
	// extends: ['stylelint-config-standard'],
	ignoreFiles: getIgnores(),
	overrides: [
		{
			files: ['**/*.svelte'],
			customSyntax: 'postcss-html',
			rules: {
				'selector-pseudo-class-no-unknown': [
					true,
					{
						ignorePseudoClasses: ['global']
					}
				]
			}
		}
	],
	rules: {
		'property-no-vendor-prefix': true,
		'value-no-vendor-prefix': true,
		'at-rule-no-vendor-prefix': true,
		'selector-no-vendor-prefix': true,
		'media-feature-name-no-vendor-prefix': true
	}
}
