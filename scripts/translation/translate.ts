import { createClient } from '@supabase/supabase-js'
import { hash } from 'crypto'
import 'dotenv/config'
import fs from 'fs/promises'
import OpenAI from 'openai'
import { join, relative, dirname } from 'path'
import PQueue from 'p-queue'
import inlangSettings from '../../project.inlang/settings.json'
import { generateJsonPrompt, generateMarkdownPrompt, PromptGenerator } from './prompts'
import { existsSync } from 'fs'

const PATH_JSON_BASE = './messages'
const PATH_JSON_SOURCE = './messages/en.json'
const BASE_URL = 'https://api.sambanova.ai/v1'
const API_KEY = process.env.SAMBANOVA_API_KEY
const MODEL = 'Meta-Llama-3.1-405B-Instruct'
const JSON_PATH_IN_CACHE = '_messages.json'
const SUPABASE_URL = 'http://127.0.0.1:54321'
const PATH_MD_BASE = 'src/posts'
const PATH_MD_TARGET = 'temp/translations'

const queue = new PQueue({
	concurrency: 1,
	intervalCap: 1,
	interval: 10000
})
const openai = new OpenAI({
	baseURL: BASE_URL,
	apiKey: API_KEY
})
const supabase = createClient(SUPABASE_URL, process.env.SUPABASE_API_KEY as string)
const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

{
	const languages = inlangSettings.languageTags
	const indexOfSourceLanguage = languages.indexOf(inlangSettings.sourceLanguageTag)
	languages.splice(indexOfSourceLanguage, 1)

	const markdownPathsFromBase = await fs.readdir(PATH_MD_BASE, { recursive: true })
	const markdownPathsFromRoot = markdownPathsFromBase.map((file) => join(PATH_MD_BASE, file))

	await Promise.all([
		translateOrLoadMessages(PATH_JSON_SOURCE, PATH_JSON_BASE, JSON_PATH_IN_CACHE, languages),
		translateOrLoadMarkdown(markdownPathsFromRoot, PATH_MD_BASE, languages, PATH_MD_TARGET)
	])
}

async function translateOrLoadMessages(
	path: string,
	basePath: string,
	pathInCache: string,
	languages: string[]
) {
	return await translateOrLoad({
		paths: [path],
		cacheNamingStrategy: () => pathInCache,
		languages,
		promptGenerator: generateJsonPrompt,
		targetStrategy: (language) => join(basePath, language + '.json')
	})
}

async function translateOrLoadMarkdown(
	paths: string[],
	basePath: string,
	languages: string[],
	target: string
) {
	return await translateOrLoad({
		paths,
		cacheNamingStrategy: (path) => relative(basePath, path),
		languages,
		promptGenerator: generateMarkdownPrompt,
		targetStrategy: (language, path) => {
			const relativePath = relative(basePath, path)
			return join(target, language, relativePath)
		}
	})
}

type CacheNamingStrategy = (path: string) => string
type TargetStrategy = (language: string, path: string) => string

async function translateOrLoad(options: {
	paths: string[]
	cacheNamingStrategy: CacheNamingStrategy
	languages: string[]
	promptGenerator: PromptGenerator
	targetStrategy: TargetStrategy
}) {
	// for (path of paths) {
	await Promise.all(
		options.paths.map(async (path) => {
			const content = await fs.readFile(path, 'utf-8')
			const hashedContent = hash('md5', content)
			// for (language of languages) {
			await Promise.all(
				options.languages.map(async (language) => {
					const pathInCache = options.cacheNamingStrategy(path)
					const cached = await supabase.from('translation').select('translation').match({
						path: pathInCache,
						hash: hashedContent,
						language_code: language
					})
					let translated: string
					if (cached.data?.length) {
						console.log(`Using up-to-date translation from cache for ${pathInCache} in ${language}`)
						translated = cached.data[0].translation
					} else {
						translated = await translate(content, options.promptGenerator, language)
						const { status } = await supabase.from('translation').upsert({
							path: pathInCache,
							hash: hashedContent,
							language_code: language,
							translation: translated
						})
						switch (status) {
							case 200:
								console.log(
									`Updated outdated translation in cache for ${pathInCache} in ${language}`
								)
								break
							case 201:
								console.log(`Created new cache entry for ${pathInCache} in ${language}`)
								break
						}
					}
					const target = options.targetStrategy(language, path)
					const directory = dirname(target)
					if (!existsSync(directory)) await fs.mkdir(directory, { recursive: true })
					await fs.writeFile(target, translated)
				})
			)
		})
	)
}

async function translate(content: string, promptGenerator: PromptGenerator, language: string) {
	const languageName = languageNamesInEnglish.of(language)
	if (!languageName) throw new Error(`Couldn't resolve language code: ${language}`)
	const prompt = promptGenerator(languageName, content)
	const response = await queue.add(() =>
		openai.chat.completions.create({
			model: MODEL,
			messages: [
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0
		})
	)
	const translated = response?.choices[0].message.content
	if (!translated) throw new Error(`Translation to ${languageName} failed`)
	return translated
}
