import axios from 'axios'
import axiosRetry from 'axios-retry'
import dotenv from 'dotenv'
import fsSync from 'fs'
import fs from 'fs/promises'
import GithubSlugger from 'github-slugger'
import minimist from 'minimist'
import PQueue from 'p-queue'
import path from 'path'
import removeMarkdown from 'remove-markdown'
import simpleGit, { SimpleGit } from 'simple-git'
import inlangSettings from '../../project.inlang/settings.json'
import { generateJsonPrompt, generateMarkdownPrompt, PromptGenerator } from './prompts'

dotenv.config()
const argv = minimist(process.argv)

const DEBUG = argv.mode == 'debug'
const DEBUG_RETRANSLATE_EVERYTHING = false
const DEBUG_RETRANSLATE_FILES: string[] = []
const GIT_EMAIL = 'example@example.com'
const GIT_REPO = 'github.com/Wituareard/git-cache-test'
const GIT_TOKEN = requireEnvVar('GITHUB_TOKEN')
const GIT_USERNAME = 'Translations'
const LLM_API_KEY = requireEnvVar('OPENROUTER_API_KEY')
const LLM_BASE_URL = 'https://openrouter.ai/api/v1/'
const LLM_MODEL = 'meta-llama/llama-3.1-405b-instruct'
const LLM_PROVIDERS = ['Fireworks']
const PATH_JSON_BASE = './messages'
const PATH_JSON_SOURCE = './messages/en.json'
const PATH_MD_BASE = './src/posts'
const PATH_TARGET_BASE = './src/temp/translations'
const PATH_TARGET_JSON = './src/temp/translations/json'
const PATH_TARGET_MD = './src/temp/translations/md'
const POSTPROCESSING_ADD_HEADING_IDS = true
const PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS = true
const PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS = true

const requestQueue = new PQueue({
	// concurrency: 1,
	intervalCap: 1,
	interval: 1000
})
const gitQueue = new PQueue({
	concurrency: 1
})
const llmClient = createLlmClient({
	baseUrl: LLM_BASE_URL,
	apiKey: LLM_API_KEY,
	model: LLM_MODEL,
	providers: LLM_PROVIDERS
})
const cacheGit = simpleGit()
const mainGit = simpleGit()
const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })
const slugger = new GithubSlugger()

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

function createLlmClient(options: {
	baseUrl: string
	apiKey: string
	model: string
	providers: string[]
}) {
	const created = axios.create({
		baseURL: options.baseUrl,
		headers: {
			Authorization: `Bearer ${options.apiKey}`
		}
	})
	created.interceptors.request.use((config) => {
		Object.assign(config.data, {
			model: options.model,
			provider: {
				order: options.providers
			}
		})
		return config
	})
	axiosRetry(created, {
		retryDelay: axiosRetry.exponentialDelay,
		retryCondition: axiosRetry.isRetryableError
	})
	return created
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
					if (
						!(
							DEBUG &&
							(DEBUG_RETRANSLATE_EVERYTHING || DEBUG_RETRANSLATE_FILES.includes(sourceFileName))
						) &&
						fsSync.existsSync(target)
					) {
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
						// TODO Don't process/match more often than necessary
						const processedContent = preprocessMarkdown(content)
						console.log(processedContent)
						const translation = await translate(processedContent, options.promptGenerator, language)
						const processedTranslation = postprocessMarkdown(processedContent, translation)
						const dir = path.dirname(target)
						await fs.mkdir(dir, { recursive: true })
						// ensure nothing happens between writing, adding and commiting
						fsSync.writeFileSync(target, processedTranslation)
						let message: string
						if (fileExists) {
							message = `Update outdated translation for ${sourceFileName} in ${language}`
						} else {
							message = `Create new translation for ${sourceFileName} in ${language}`
						}
						try {
							await gitQueue.add(() =>
								(fileExists ? cacheGit : cacheGit.add('.')).commit(message, ['-a'])
							)
						} catch (e) {
							if (e instanceof Error && e.message.includes('nothing to commit')) {
								console.log(`${sourceFileName} in ${language} didn't change`)
							} else {
								throw e
							}
						}
						console.log(`${message} (${done++} / ${total})`)
					}
				})
			)
		})
	)
}

async function fetchLastModified(git: SimpleGit, path: string) {
	const log = await gitQueue.add(() =>
		git.log({
			file: path
		})
	)
	const date = log?.latest?.date
	if (!date) throw new Error(`Couldn't fetch modification date of file ${path}`)
	return new Date(date)
}

function preprocessMarkdown(source: string) {
	let processed = source
	if (
		PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS ||
		PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS
	) {
		processed = processed.replaceAll(/<!--([\S\s]*?)-->/g, (_0, _1: string) => {
			if (PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS && _1.match(/# /g)) return ''
			if (PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS && _1.match(/\]\(/g)) return ''
			return _0
		})
	}
	return processed
}

async function translate(content: string, promptGenerator: PromptGenerator, language: string) {
	const languageName = languageNamesInEnglish.of(language)
	if (!languageName) throw new Error(`Couldn't resolve language code: ${language}`)
	const prompt = promptGenerator(languageName, content)
	const response = await requestQueue.add(
		async () =>
			await llmClient.post('/chat/completions', {
				messages: [
					{
						role: 'user',
						content: prompt
					}
				],
				temperature: 0
			})
	)
	console.log(response?.data)
	const translated = response?.data.choices[0].message.content
	if (!translated) throw new Error(`Translation to ${languageName} failed`)
	return translated
}

function postprocessMarkdown(source: string, translation: string) {
	let processed = translation
	addHeadingIds: if (POSTPROCESSING_ADD_HEADING_IDS) {
		const REGEX_HEADING = /^#+ (.*)/gm
		const headingsInSource = Array.from(source.matchAll(REGEX_HEADING))
		if (!headingsInSource.length) break addHeadingIds
		let i = 0
		processed = translation.replaceAll(REGEX_HEADING, (_0) => {
			const sourceResult = headingsInSource[i]
			if (!sourceResult)
				throw new Error(`Different heading count in translation:\n\n${translation}`)
			const headingInSource = sourceResult[1]
			const stripped = removeMarkdown(headingInSource)
			const slugged = slugger.slug(stripped)
			const heading = `${_0} {#${slugged}}`
			i++
			return heading
		})
	}
	return processed
}
