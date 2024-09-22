import { Language, languages } from '../src/languages'
import { fileURLToPath } from 'node:url'
import OpenAI from 'openai'
import { dirname } from 'node:path'
import { generatePrompt } from './prompt'
import * as path from 'path'
import * as fs from 'fs'

// @ts-ignore
const __filename = fileURLToPath(import.meta.url) as string
const __dirname = dirname(__filename)

// Load environment variables manually
const loadEnv = () => {
	const envPath = path.resolve(__dirname, '../.env')
	const envContent = fs.readFileSync(envPath, 'utf-8')
	const envVars = envContent.split('\n').reduce(
		(acc, line) => {
			const [key, ...valueParts] = line.split('=')
			if (key && valueParts.length > 0) {
				let value = valueParts.join('=').trim()
				// Remove surrounding quotes if present
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.slice(1, -1)
				}
				acc[key.trim()] = value
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

const translateContent = async (language: Language, content: string, isJson: boolean) => {
	const prompt = isJson ? generateJsonPrompt(language, content) : generatePrompt(language, content)
	console.log(`Generating translation for ${language.name} (${isJson ? 'JSON' : 'Markdown'})`)

	try {
		const response = await openai.chat.completions.create({
			model: 'gpt-4o-mini',
			messages: [
				{ role: 'system', content: 'You are a professional translator.' },
				{ role: 'user', content: prompt }
			],
			temperature: 0.3
		})

		const translatedContent = response.choices[0].message.content

		if (isJson) {
			// For JSON, we expect a valid JSON string
			JSON.parse(translatedContent!) // This will throw an error if it's not valid JSON
			return translatedContent
		} else {
			// For Markdown, we keep the existing check
			if (!translatedContent?.startsWith('---')) {
				throw new Error(
					`Translation failed, did not start with "---". Content: ${translatedContent}`
				)
			}
			return translatedContent
		}
	} catch (error) {
		console.error(`Error translating to ${language.name}:`, error)
		throw error
	}
}

const generateJsonPrompt = (language: Language, content: string) => {
	return `Translate the following JSON content to ${language.name}. Maintain the JSON structure and only translate the values, not the keys. Ensure the result is valid JSON:

${content}

Do not start with \`\`\`json, just return the JSON.
Translated JSON:`
}

async function main() {
	const postsDirectory = path.join(__dirname, '../src/posts')
	const translationsDirectory = path.join(__dirname, '../src/lib/translations')

	// Process Markdown files
	const mdFiles = fs.readdirSync(postsDirectory)
	for (const file of mdFiles) {
		if (path.extname(file) === '.md') {
			await processFile(postsDirectory, file, false)
		}
	}

	// Ensure the translations/en directory exists
	const enTranslationsDir = path.join(translationsDirectory, 'en')
	if (!fs.existsSync(enTranslationsDir)) {
		console.log(`Creating directory: ${enTranslationsDir}`)
		fs.mkdirSync(enTranslationsDir, { recursive: true })
	}

	// Create or update home.json with homepage items
	const homeJsonPath = path.join(enTranslationsDir, 'home.json')
	const homeContent = generateHomeJson()
	fs.writeFileSync(homeJsonPath, JSON.stringify(homeContent, null, 2), 'utf8')
	console.log(`Updated ${homeJsonPath}`)

	// Process JSON files
	const jsonFiles = fs.readdirSync(enTranslationsDir)
	for (const file of jsonFiles) {
		if (path.extname(file) === '.json') {
			await processFile(translationsDirectory, file, true)
		}
	}
}

function generateHomeJson() {
	return {
		title: 'We need to Pause AI',
		description: 'We are risking human extinction. We need to pause AI development, right now.',
		blocks: [
			{
				title: 'We risk <Mark>losing control</Mark>',
				content:
					'AI can have amazing benefits, but it could also erode our democracy, destabilize our economy and could be used to create powerful cyber weapons.',
				linkText: 'Read about the risks',
				href: '/risks'
			},
			{
				title: 'We risk <Mark>human extinction</Mark>',
				content: 'Many AI labs and experts agree: AI could end humanity.',
				linkText: 'Why and how AI can kill us',
				href: '/xrisk'
			},
			{
				title: 'We need a <Mark>pause</Mark>',
				content:
					'Stop the development of AI systems more powerful than GPT-4 until we know how to make them safe. This needs to happen on an international level, and it needs to happen soon.',
				linkText: 'Read the proposal',
				href: '/proposal'
			},
			{
				title: 'WE NEED TO ACT <Mark>RIGHT NOW</Mark>',
				content:
					'In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we might be almost there. Superintelligence could be one innovation away, so we should tread carefully.',
				linkText: 'How long do we have?',
				href: '/urgency'
			},
			{
				title: '<Mark>YOU</Mark> CAN HELP',
				content:
					'Too few people are well-informed about the potential risks of AI. Inform others, and help stop this race to the bottom.',
				linkText: 'Take action',
				href: '/action'
			}
		]
	}
}

async function processFile(directory: string, file: string, isJson: boolean) {
	const filePath = path.join(directory, isJson ? 'en' : '', file)
	const content = fs.readFileSync(filePath, 'utf8')

	for (const language of languages) {
		if (language.code !== 'en') {
			const languageFolder = path.join(directory, language.code)
			if (!fs.existsSync(languageFolder)) {
				fs.mkdirSync(languageFolder, { recursive: true })
			}

			const translatedFilePath = path.join(languageFolder, file)
			if (!fs.existsSync(translatedFilePath)) {
				console.log(`Translating ${file} to ${language.name}...`)
				const translatedContent = await translateContent(language, content, isJson)

				fs.writeFileSync(translatedFilePath, translatedContent, 'utf8')
				console.log(`Translated file written to: ${translatedFilePath}`)
			} else {
				console.log(`Translation for ${file} in ${language.name} already exists. Skipping...`)
			}
		}
	}
}

main()
