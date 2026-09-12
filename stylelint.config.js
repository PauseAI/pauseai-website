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
		},
		{
			// This is the token definitions file — the one place raw color values
			// are meant to live, so everything else can reference them by name.
			files: ['src/styles/styles.css'],
			rules: {
				'color-no-hex': null,
				'declaration-property-value-disallowed-list': null
			}
		}
	],
	rules: {
		'property-no-vendor-prefix': true,
		'value-no-vendor-prefix': true,
		'at-rule-no-vendor-prefix': true,
		'selector-no-vendor-prefix': true,
		'media-feature-name-no-vendor-prefix': true,

		// Colors belong in src/styles/styles.css as custom properties, referenced
		// via var(--token). This bans raw hex outright, and raw rgb()/hsl() component
		// literals in color-bearing properties — but still allows rgba(var(--x), 0.1)
		// style alpha-compositing, since the base color there is a token, not a literal.
		'color-no-hex': true,
		'declaration-property-value-disallowed-list': {
			'/color$/': [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			background: [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			'background-image': [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			border: [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			outline: [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			'box-shadow': [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			'text-shadow': [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			fill: [/rgba?\(\s*\d/, /hsla?\(\s*\d/],
			stroke: [/rgba?\(\s*\d/, /hsla?\(\s*\d/]
		}
	}
}
