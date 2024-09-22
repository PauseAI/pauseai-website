import { Language, languages } from '../src/languages'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import { dirname } from 'node:path'
import { generatePrompt } from './prompt'
import * as path from 'path'
import * as fs from 'fs'

const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = dirname(__filename)

// Load environment variables manually
const loadEnv = () => {
	const envPath = path.resolve(__dirname, '../.env')
	const envContent = fs.readFileSync(envPath, 'utf-8')
	const envVars = envContent.split('\n').reduce(
		(acc, line) => {
			const [key, value] = line.split('=')
			if (key && value) {
				acc[key.trim()] = value.trim()
			}
			return acc
		},
		{} as Record<string, string>
	)

	Object.assign(process.env, envVars)
}

loadEnv()

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
			throw new Error(`Translation failed, did not start with "---". Content: ${content}`)
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

	for (const file of files) {
		if (path.extname(file) === '.md') {
			const filePath = path.join(postsDirectory, file)
			const content = fs.readFileSync(filePath, 'utf8')

			for (const language of languages) {
				// Skip English, that's the default language
				if (language.code !== 'en') {
					// Create language-specific folder if it doesn't exist
					const languageFolder = path.join(__dirname, `../src/posts/${language.code}`)
					if (!fs.existsSync(languageFolder)) {
						fs.mkdirSync(languageFolder, { recursive: true })
					}

					// Check if the translated file already exists
					const translatedFilePath = path.join(languageFolder, file)
					if (!fs.existsSync(translatedFilePath)) {
						console.log(`Translating ${file} to ${language.name}...`)
						const translatedContent = await translateContent(language, content)

						// Write translated content to the language-specific folder
						fs.writeFileSync(translatedFilePath, translatedContent, 'utf8')
						console.log(`Translated file written to: ${translatedFilePath}`)
					} else {
						console.log(`Translation for ${file} in ${language.name} already exists. Skipping...`)
					}
				}
			}
		} else {
			console.log(`${file} is not a markdown file. Skipping...`)
		}
	}
}

main()
