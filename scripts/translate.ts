import { Language, languages } from '../src/languages'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import { dirname } from 'node:path'
import { generatePrompt } from './prompt'
import * as path from 'path'
import * as fs from 'fs'

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = dirname(__filename)

const openai = new OpenAI({
	apiKey: process.env.OPENAI_KEY
})

const translateContent = async (language: Language, content: string) => {
	const prompt = generatePrompt(language, content)
	console.log(`Generating translation for ${language.name}`)

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You are a professional translator.' },
				{ role: 'user', content: prompt }
			],
			temperature: 0.3
		})

		const content = response.choices[0].message.content

		if (!content?.startsWith('---')) {
			throw new Error('Translation failed, did not start with "---"', content)
		}

		return content
	} catch (error) {
		console.error(`Error translating to ${language.name}:`, error)
		throw error
	}
}

/** Generates translations for every Post, for every language */
async function main() {
	const postsDirectory = path.join(__dirname, '../src/posts')
	const files = fs.readdirSync(postsDirectory)

	files.forEach((file) => {
		if (path.extname(file) === '.md') {
			const filePath = path.join(postsDirectory, file)
			const content = fs.readFileSync(filePath, 'utf8')
			languages.forEach(async (language) => {
				// Skip english, that's the default language
				if (language.code !== 'en') {
					const prompt = generatePrompt(language, content)
					console.log(`generating prompt for ${language.name}`, prompt)
					const translatedContent = await translateContent(language, content)

					// Create language-specific folder if it doesn't exist
					const languageFolder = path.join(__dirname, `../src/posts/${language.code}`)
					if (!fs.existsSync(languageFolder)) {
						fs.mkdirSync(languageFolder, { recursive: true })
					}

					// Write translated content to the language-specific folder
					const translatedFilePath = path.join(languageFolder, file)
					fs.writeFileSync(translatedFilePath, translatedContent, 'utf8')
					console.log(`Translated file written to: ${translatedFilePath}`)
				}
			})
		} else {
			console.log('File is not a markdown file')
		}
	})
}

main()
