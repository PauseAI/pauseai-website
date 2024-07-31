import { visit } from 'unist-util-visit'
import { createPatch } from 'diff'
import fs from 'fs'
import path from 'path'

const THIN_SPACE = '\u202F' // Narrow No-Break Space
const REGULAR_SPACE = '\u00A0' // No-Break Space

const changesFile = path.join('.typographyChanges.json')
/**
 * Applies the semicolon rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied semicolon rule
 */
export function applySemicolonRule(text) {
	return text.replace(/(^|(\S))(\s*)(;)/g, `$1${THIN_SPACE}$4`)
}

/**
 * Applies the question mark rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied question mark rule
 */
export function applyQuestionMarkRule(text) {
	return text.replace(/(^|(\S))(\s*)(\?)/g, `$1${THIN_SPACE}$4`)
}

/**
 * Applies the exclamation mark rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied exclamation mark rule
 */
export function applyExclamationMarkRule(text) {
	return text.replace(/(^|(\S))(\s*)(!)/g, `$1${THIN_SPACE}$4`)
}

/**
 * Applies the number-unit rule
 * @param {string} text - The input text
 * @returns {string} The text with applied number-unit rule
 */
export function applyNumberUnitRule(text) {
	const unitsRegex =
		/(?:[yzafpnµmcdhkMGTPEZY]?(?:m|g|s|A|K|mol|cd|rad|Hz|N|Pa|J|W|C|V|F|Ω|S|Wb|T|H|lm|lx|Bq|Gy|Sv|kat|eV))|(?:Np|B|dB|st|Mx)|(?:bar|atm|Ci|R|rem|gal|L|t|Da|u|UA)|\b(?:mol|cat|bit|o|pc|min|h|d|wk|yr|Å)\b/

	return text.replace(
		new RegExp(
			`(\\d+(?:[,]\\d+)?)\\s*(${unitsRegex.source})(?!\\w)|(?<=\\d)(?=${unitsRegex.source}(?!\\w))`,
			'g'
		),
		`$1${THIN_SPACE}$2`
	)
}

/**
 * Applies the percent symbol rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied percent symbol rule
 */
export function applyPercentSymbolRule(text) {
	return text.replace(/(\d+(?:[,.]\d+)?)(\s*)(%)/g, `$1${THIN_SPACE}$3`)
}

/**
 * Applies the currency symbol rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied currency symbol rule
 */
export function applyCurrencySymbolRule(text) {
	return text.replace(
		/(€|\$|£|¥)(\s*)(\d+)|(\d+)(\s*)(€|\$|£|¥)/g,
		/**
		 * @param {string} match - The entire matched substring
		 * @param {string} prefixSymbol - The currency symbol if it's a prefix (undefined for suffix)
		 * @param {string} prefixSpace - Any space between prefix symbol and number (undefined for suffix)
		 * @param {string} prefixNumber - The number for prefix case (undefined for suffix)
		 * @param {string} suffixNumber - The number for suffix case (undefined for prefix)
		 * @param {string} suffixSpace - Any space between number and suffix symbol (undefined for prefix)
		 * @param {string} suffixSymbol - The currency symbol if it's a suffix (undefined for prefix)
		 * @returns {string}
		 */
		(match, prefixSymbol, prefixSpace, prefixNumber, suffixNumber, suffixSpace, suffixSymbol) => {
			if (prefixSymbol) {
				// Prefix currency symbol
				return `${prefixSymbol}${THIN_SPACE}${prefixNumber}`
			} else {
				// Suffix currency symbol
				return `${suffixNumber}${THIN_SPACE}${suffixSymbol}`
			}
		}
	)
}

/**
 * Applies the colon rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied colon rule
 */
export function applyColonRule(text) {
	return text.replace(/(^|(\S))(\s*)(:)(?![\d])/g, `$1${REGULAR_SPACE}$4`)
}

/**
 * Applies the French quotes rule
 * @param {string} text - The input text
 * @returns {string} - The text with applied French quotes rule
 */
export function applyFrenchQuotesRule(text) {
	return text
		.replace(/(«)(\s*)(\S)/g, `$1${REGULAR_SPACE}$3`)
		.replace(/(\S)(\s*)(»)/g, `$1${REGULAR_SPACE}$3`)
}

/**
 * Replaces English quotes with French quotes
 * @param {string} text - The input text
 * @returns {string} - The text with English quotes replaced by French quotes
 */
export function applyQuoteReplacementRule(text) {
	let quoteCount = 0
	const result = text.replace(/"/g, (match, offset) => {
		quoteCount++
		if (offset > 0 && text[offset - 1] !== ' ') {
			return REGULAR_SPACE + '»'
		} else {
			return '«' + REGULAR_SPACE
		}
	})

	if (quoteCount % 2 !== 0) {
		console.error(`Unmatched quote found in text: "${text.substring(0, 50)}..."`)
	}

	return result
}

/**
 * Applies French typography rules to the given text
 * @param {string} text - The input text
 * @returns {string} - The text with applied typography rules
 */
export function applyTypographyRules(text) {
	let result = text
	// Apply thin non-breaking space rules
	result = applySemicolonRule(result)
	result = applyQuestionMarkRule(result)
	result = applyExclamationMarkRule(result)
	result = applyNumberUnitRule(result)
	result = applyPercentSymbolRule(result)
	result = applyCurrencySymbolRule(result)
	// Apply regular non-breaking space rules
	result = applyColonRule(result)
	result = applyFrenchQuotesRule(result)
	// Replace English quotes with French quotes
	result = applyQuoteReplacementRule(result)

	return result
}
/** @typedef {[string, {originalContent: string, newContent: string}]} FileChangeEntry */
/** @typedef {Map<string, {originalContent: string, newContent: string}>} FileChanges */
/** @typedef {import('mdast').Text} TextNode */
/** @typedef {import('unified').Plugin<[], TextNode>} Plugin */
/** @typedef {import('diff').Change} DiffChange */

/** @type {Plugin} */
export function remarkFrenchTypography() {
	/** @type {FileChanges} */
	let fileChanges = new Map()
	return function transformer(tree, file) {
		const inputFile = /** @type {import('vfile').VFile & {filename: string}} */ (file)
		const filePath = inputFile.filename

		let originalContent = ''
		let newContent = ''

		visit(tree, 'text', (node) => {
			const originalText = node.value
			originalContent += originalText + '\n'
			newContent += applyTypographyRules(node.value) + '\n'
			node.value = applyTypographyRules(node.value)
		})

		if (originalContent !== newContent) {
			fileChanges.set(filePath, { originalContent, newContent })
		} else {
			fileChanges.delete(filePath)
		}
		// Only write fileChanges during build
		if (process.env.VITE_BUILD_MODE === 'true') {
			const fileChangesJson = JSON.stringify(Array.from(fileChanges.entries()))
			fs.writeFileSync(changesFile, fileChangesJson)
		}
	}
}

/**
 * Writes the diff HTML file with changes from all processed files
 * @param {FileChanges} fileChanges
 * @returns {string} - The diff HTML
 */
export function createHTMLDiff(fileChanges) {
	const diffStrings = Array.from(fileChanges.entries())
		.map(([file, { originalContent, newContent }]) => {
			return createPatch(file, originalContent, newContent, '', '')
		})
		.join('\n')

	const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Typography Changes</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/github.min.css">
      <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/diff2html/bundles/css/diff2html.min.css">
      <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/diff2html/bundles/js/diff2html-ui.min.js"></script>
    </head>
    <body>
      <div id="diff-container"></div>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          var targetElement = document.getElementById('diff-container');
          var configuration = {
            drawFileList: true,
            fileListToggle: false,
            fileListStartVisible: true,
            fileContentToggle: false,
            matching: 'lines',
            outputFormat: 'side-by-side',
            synchronisedScroll: true,
            highlight: true,
            renderNothingWhenEmpty: false,
          };
          var diff2htmlUi = new Diff2HtmlUI(targetElement, ${JSON.stringify(diffStrings)}, configuration);
          diff2htmlUi.draw();
          diff2htmlUi.highlightCode();
        });
      </script>
    </body>
    </html>
  `
	return fullHtml
}

/** @type {import('vite').Plugin} */
export const viteTypographyPlugin = {
	name: 'french-typography',
	config(config, { command }) {
		if (command === 'build') {
			process.env.VITE_BUILD_MODE = 'true'
		}
	},
	generateBundle() {
		const fileChangesJson = fs.readFileSync(changesFile, 'utf-8')
		/** @type {FileChangeEntry[]} */
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		const parsedChanges = JSON.parse(fileChangesJson)
		/** @type {FileChanges} */
		const fileChanges = new Map(parsedChanges)
		const htmlContent = createHTMLDiff(fileChanges)
		this.emitFile({
			type: 'asset',
			fileName: 'static/logs/typography-diff.html',
			source: htmlContent
		})

		// Clean up the temporary JSON file
		fs.unlinkSync(changesFile)
	}
}
