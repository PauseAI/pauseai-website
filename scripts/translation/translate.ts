import dotenv from 'dotenv'
import fsSync from 'fs'
import fs from 'fs/promises'
import OpenAI from 'openai'
import PQueue from 'p-queue'
import path from 'path'
import simpleGit, { SimpleGit } from 'simple-git'
import inlangSettings from '../../project.inlang/settings.json'
import { generateJsonPrompt, generateMarkdownPrompt, PromptGenerator } from './prompts'

dotenv.config()

const GIT_EMAIL = 'example@example.com'
const GIT_REPO = 'github.com/Wituareard/git-cache-test'
const GIT_TOKEN = requireEnvVar('GITHUB_TOKEN')
const GIT_USERNAME = 'Translations'
const LLM_API_KEY = requireEnvVar('SAMBANOVA_API_KEY')
const LLM_BASE_URL = 'https://api.sambanova.ai/v1'
const LLM_MODEL = 'Meta-Llama-3.1-405B-Instruct'
const PATH_JSON_BASE = './messages'
const PATH_JSON_SOURCE = './messages/en.json'
const PATH_MD_BASE = './src/posts'
const PATH_TARGET_BASE = './src/temp/translations'
const PATH_TARGET_JSON = './src/temp/translations/json'
const PATH_TARGET_MD = './src/temp/translations/md'

const queue = new PQueue({
	concurrency: 1,
	intervalCap: 1,
	interval: 10000
})
const openai = new OpenAI({
	baseURL: LLM_BASE_URL,
	apiKey: LLM_API_KEY
})
const cacheGit = simpleGit()
const mainGit = simpleGit()
const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

{
	await initializeGitCache({
		dir: PATH_TARGET_BASE,
		token: GIT_TOKEN,
		repo: GIT_REPO,
		username: GIT_USERNAME,
		email: GIT_EMAIL
	})

	const languages = inlangSettings.languageTags
	const indexOfSourceLanguage = languages.indexOf(inlangSettings.sourceLanguageTag)
	languages.splice(indexOfSourceLanguage, 1)

	await Promise.all([
		(async () => {
			await translateOrLoadMessages({
				sourcePath: PATH_JSON_SOURCE,
				languages,
				promptGenerator: generateJsonPrompt,
				targetDir: PATH_TARGET_JSON,
				cacheGitCwd: PATH_TARGET_BASE
			})
			await fs.cp(PATH_TARGET_JSON, PATH_JSON_BASE, { recursive: true })
		})(),
		(async () => {
			const markdownPathsFromBase = await fs.readdir(PATH_MD_BASE, { recursive: true })
			const markdownPathsFromRoot = markdownPathsFromBase.map((file) =>
				path.join(PATH_MD_BASE, file)
			)
			await translateOrLoadMarkdown({
				sourcePaths: markdownPathsFromRoot,
				sourceBaseDir: PATH_MD_BASE,
				languages,
				promptGenerator: generateMarkdownPrompt,
				targetDir: PATH_TARGET_MD,
				cacheGitCwd: PATH_TARGET_BASE
			})
		})()
	])

	await cacheGit.push()
}

function requireEnvVar(variable: string) {
	const value = process.env[variable]
	if (!value) throw new Error(`Environment variable ${variable} is required`)
	return value
}

async function initializeGitCache(options: {
	dir: string
	token: string
	repo: string
	username: string
	email: string
}) {
	await fs.rm(options.dir, {
		recursive: true,
		force: true
	})
	const remote = `https://${options.token}@${options.repo}`
	await cacheGit.clone(remote, options.dir)
	await cacheGit.cwd(options.dir)
	await cacheGit.addConfig('user.name', options.username)
	await cacheGit.addConfig('user.email', options.email)
}

async function translateOrLoadMessages(options: {
	sourcePath: string
	languages: string[]
	promptGenerator: PromptGenerator
	targetDir: string
	cacheGitCwd: string
}) {
	await translateOrLoad({
		sourcePaths: [options.sourcePath],
		languages: options.languages,
		promptGenerator: options.promptGenerator,
		targetStrategy: (language) => path.join(options.targetDir, language + '.json'),
		cacheGitCwd: options.cacheGitCwd
	})
}

async function translateOrLoadMarkdown(options: {
	sourcePaths: string[]
	sourceBaseDir: string
	languages: string[]
	promptGenerator: PromptGenerator
	targetDir: string
	cacheGitCwd: string
}) {
	await translateOrLoad({
		sourcePaths: options.sourcePaths,
		languages: options.languages,
		promptGenerator: options.promptGenerator,
		targetStrategy: (language, sourcePath) => {
			const relativePath = path.relative(options.sourceBaseDir, sourcePath)
			return path.join(options.targetDir, language, relativePath)
		},
		cacheGitCwd: options.cacheGitCwd
	})
}

type TargetStrategy = (language: string, sourcePath: string) => string

async function translateOrLoad(options: {
	sourcePaths: string[]
	languages: string[]
	promptGenerator: PromptGenerator
	targetStrategy: TargetStrategy
	cacheGitCwd: string
}) {
	let done = 1
	let total = 0
	await Promise.all(
		options.sourcePaths.map(async (sourcePath) => {
			const sourceFileName = path.basename(sourcePath)
			await Promise.all(
				options.languages.map(async (language) => {
					const target = options.targetStrategy(language, sourcePath)
					let useCachedTranslation = false
					let fileExists = false
					if (fsSync.existsSync(target)) {
						fileExists = true
						const sourceLastModified = await fetchLastModified(mainGit, sourcePath)
						const cachePathFromCwd = path.relative(options.cacheGitCwd, target)
						const cacheLastModified = await fetchLastModified(cacheGit, cachePathFromCwd)
						if (cacheLastModified > sourceLastModified) {
							console.log(`Using cached translation for ${sourceFileName} in ${language}`)
							useCachedTranslation = true
						}
					}
					if (!useCachedTranslation) {
						total++
						const content = await fs.readFile(sourcePath, 'utf-8')
						const translated = await translate(content, options.promptGenerator, language)
						const dir = path.dirname(target)
						await fs.mkdir(dir, { recursive: true })
						await fs.writeFile(target, translated)
						let message: string
						if (fileExists) {
							message = `Update outdated translation for ${sourceFileName} in ${language}`
						} else {
							await cacheGit.add('.')
							message = `Create new translation for ${sourceFileName} in ${language}`
						}
						await cacheGit.commit(message)
						console.log(`${message} (${done++} / ${total})`)
					}
				})
			)
		})
	)
}

async function fetchLastModified(git: SimpleGit, path: string) {
	const log = await git.log({
		file: path
	})
	const date = log.latest?.date
	if (!date) throw new Error(`Couldn't fetch modification date of file ${path}`)
	return new Date(date)
}

async function translate(content: string, promptGenerator: PromptGenerator, language: string) {
	const languageName = languageNamesInEnglish.of(language)
	if (!languageName) throw new Error(`Couldn't resolve language code: ${language}`)
	const prompt = promptGenerator(languageName, content)
	const response = await queue.add(() =>
		openai.chat.completions.create({
			model: LLM_MODEL,
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
