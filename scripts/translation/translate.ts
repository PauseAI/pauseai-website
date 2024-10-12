import fs from 'fs/promises'
import OpenAI from 'openai'
import 'dotenv/config'
import { generateJsonPrompt } from './prompts'
import path from 'path'
import inlangSettings from '../../project.inlang/settings.json'

const PATH_JSON = './messages'
const PATH_JSON_SOURCE = './messages/en.json'
const BASE_URL = 'https://api.sambanova.ai/v1'
const API_KEY = process.env.SAMBANOVA_API_KEY
const MODEL = 'Meta-Llama-3.1-405B-Instruct'

const languages = inlangSettings.languageTags

const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

const openai = new OpenAI({
	baseURL: BASE_URL,
	apiKey: API_KEY
})

const messagesJson = await fs.readFile(PATH_JSON_SOURCE, 'utf-8')

await Promise.all(
	languages.map(async (language) => {
		const languageName = languageNamesInEnglish.of(language)
		if (!languageName) throw new Error(`Couldn't resolve language code: ${language}`)
		const prompt = generateJsonPrompt(languageName, messagesJson)
		const response = await openai.chat.completions.create({
			model: MODEL,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0
		})
		const translated = response.choices[0].message.content
		if (!translated) throw new Error(`Translation to ${language} failed`)
		await fs.writeFile(path.join(PATH_JSON, language + '.json'), translated)
	})
)
