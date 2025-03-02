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
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git'
import inlangSettings from '../../project.inlang/settings.json'
import { collectPromptAdditions } from './additions'
import {
	generateJsonPrompt,
	generateMarkdownPrompt,
	generateReviewPrompt,
	PromptGenerator
} from './prompts'
import { L10NS_BASE_DIR, MARKDOWN_L10NS, MESSAGE_L10NS } from '../../src/lib/l10n-paths'

dotenv.config()
const argv = minimist(process.argv)

const DEBUG = argv.mode == 'debug'
const DEBUG_RETRANSLATE_EVERYTHING = false
const DEBUG_RETRANSLATE_FILES: string[] = [
	'en.json',
	'learn.md',
	'proposal.md',
	'events.md',
	'faq.md',
	'action.md',
	'donate.md',
	'join.md'
]
const GIT_EMAIL = 'example@example.com'
const GIT_MAX_CONCURRENT_PROCESSES = 8
const GIT_REPO_PARAGLIDE = requireEnvVar('GIT_REPO_PARAGLIDE')
const GIT_TOKEN = requireEnvVar('GITHUB_TOKEN')
const GIT_USERNAME = 'Translations'
const LLM_API_KEY = requireEnvVar('OPENROUTER_API_KEY')
const LLM_BASE_URL = 'https://openrouter.ai/api/v1/'
const LLM_MODEL = 'meta-llama/llama-3.1-405b-instruct'
const LLM_PROVIDERS = ['Fireworks']
const LLM_REQUESTS_PER_SECOND = 1
const PATH_JSON_BASE = './messages'
const PATH_JSON_SOURCE = './messages/en.json'
const PATH_MD_BASE = './src/posts'
const PATH_PATTERNS = [/src\/posts(\/.*)\.md/, /messages\/(.*)/]
const POSTPROCESSING_ADD_HEADING_IDS = true
const PREPROCESSING_REMOVE_COMMENTS_WITH_MD_HEADINGS = true
const PREPROCESSING_REMOVE_COMMENTS_WITH_MD_LINKS = true
// CRLF is normalized to LF
type PatternCommentPair = { pattern: RegExp; comment: string }
const PREPROCESSING_COMMENT_AFTER_PATTERN: PatternCommentPair[] = [
	{
		pattern: /---[\S\s]*?\n---\n/,
		comment: `end of frontmatter metadata, dashes above need to stay`
	},
	{
		pattern: /\]\(#[a-z0-9-_.]+\)/g,
		comment: `don't translate target, only label`
	}
]

const requestQueue = new PQueue({
	// concurrency: 1,
	intervalCap: LLM_REQUESTS_PER_SECOND,
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
const gitOptions: Partial<SimpleGitOptions> = {
	maxConcurrentProcesses: GIT_MAX_CONCURRENT_PROCESSES
}
const cacheGit = simpleGit(gitOptions)
const mainGit = simpleGit(gitOptions)
const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })
const slugger = new GithubSlugger()
let cacheLatestCommitDates: Map<string, Date>
let mainLatestCommitDates: Map<string, Date>

{
	await Promise.all([
		(async () => {
			await initializeGitCache({
				dir: L10NS_BASE_DIR,
				token: GIT_TOKEN,
				repo: GIT_REPO_PARAGLIDE,
				username: GIT_USERNAME,
				email: GIT_EMAIL
			})
			cacheLatestCommitDates = await prepareLastestCommitDates(cacheGit)
		})(),
		(async () => (mainLatestCommitDates = await prepareLastestCommitDates(mainGit)))()
	])

	const languageTags = inlangSettings.languageTags

	// remove source language from array
	const indexOfSourceLanguageTag = languageTags.indexOf(inlangSettings.sourceLanguageTag)
	languageTags.splice(indexOfSourceLanguageTag, 1)

	await Promise.all([
		(async () => {
			await translateOrLoadMessages({
				sourcePath: PATH_JSON_SOURCE,
				languageTags: languageTags,
				promptGenerator: generateJsonPrompt,
				targetDir: MESSAGE_L10NS,
				cacheGitCwd: L10NS_BASE_DIR
			})
			await fs.cp(MESSAGE_L10NS, L10NS_BASE_DIR, { recursive: true })
		})(),
		(async () => {
			const markdownPathsFromBase = await fs.readdir(PATH_MD_BASE, { recursive: true })
			const markdownPathsFromRoot = markdownPathsFromBase.map((file) =>
				path.join(PATH_MD_BASE, file)
			)
			await translateOrLoadMarkdown({
				sourcePaths: markdownPathsFromRoot,
				sourceBaseDir: PATH_MD_BASE,
				languageTags: languageTags,
				promptGenerator: generateMarkdownPrompt,
				targetDir: MARKDOWN_L10NS,
				cacheGitCwd: L10NS_BASE_DIR
			})
		})()
	])

	await cacheGit.push()
}

/**
 * Retrieves the value of an environment variable.
 *
 * @param variable - The name of the environment variable.
 * @returns The value of the specified environment variable.
 * @throws {Error} If the environment variable is not set.
 */
function requireEnvVar(variable: string) {
	const value = process.env[variable]
	if (!value) throw new Error(`Environment variable ${variable} is required`)
	return value
}

/**
 * Creates an Axios client configured for the LLM API.
 *
 * @param options - An object containing the API base URL, API key, model, and provider names.
 * @returns An Axios instance with interceptors for retrying failed requests and default headers.
 */
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

/**
 * Initializes the Git cache by removing the existing directory,
 * cloning the remote repository, and configuring Git user settings.
 *
 * @param options - An object containing the target directory, authentication token, repository URL, username, and email.
 * @returns A Promise that resolves when the cache repository has been cloned and configured.
 */
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

/**
 * Extracts the latest commit dates for each file by parsing the Git log.
 *
 * @param git - The SimpleGit instance used to retrieve the log.
 * @returns A Promise that resolves to a Map where keys are file paths and values are the latest commit dates.
 */
async function prepareLastestCommitDates(git: SimpleGit) {
	const latestCommitDatesMap = new Map<string, Date>()
	const log = await git.log({
		// TODO lower?
		'--stat': 4096
	})
	for (const entry of log.all) {
		const files = entry.diff?.files
		if (!files) continue
		for (const file of files) {
			if (!latestCommitDatesMap.has(file.file)) {
				latestCommitDatesMap.set(file.file, new Date(entry.date))
			}
		}
	}
	return latestCommitDatesMap
}

/**
 * Translates or loads message files using a JSON prompt generator.
 * Processes the source JSON file and creates separate translations for each target language.
 *
 * @param options - An object containing the source path, language tags, prompt generator, target directory, and cache working directory.
 * @returns A Promise that resolves when the translations have been processed.
 */
async function translateOrLoadMessages(options: {
	sourcePath: string
	languageTags: string[]
	promptGenerator: PromptGenerator
	targetDir: string
	cacheGitCwd: string
}) {
	await translateOrLoad({
		sourcePaths: [options.sourcePath],
		languageTags: options.languageTags,
		promptGenerator: options.promptGenerator,
		targetStrategy: (language) => path.join(options.targetDir, language + '.json'),
		cacheGitCwd: options.cacheGitCwd
	})
}

/**
 * Translates or loads markdown files using a Markdown prompt generator.
 * Reads markdown files from the source directory and outputs translated files organized by language.
 *
 * @param options - An object with sourcePaths, sourceBaseDir, language tags, prompt generator, target directory, and cache working directory.
 * @returns A Promise that resolves when the markdown translations have been processed.
 */
async function translateOrLoadMarkdown(options: {
	sourcePaths: string[]
	sourceBaseDir: string
	languageTags: string[]
	promptGenerator: PromptGenerator
	targetDir: string
	cacheGitCwd: string
}) {
	await translateOrLoad({
		sourcePaths: options.sourcePaths,
		languageTags: options.languageTags,
		promptGenerator: options.promptGenerator,
		targetStrategy: (language, sourcePath) => {
			const relativePath = path.relative(options.sourceBaseDir, sourcePath)
			return path.join(options.targetDir, language, relativePath)
		},
		cacheGitCwd: options.cacheGitCwd
	})
}

type TargetStrategy = (language: string, sourcePath: string) => string

/**
 * Generalized function that handles the translation or loading of files for various languages.
 * It checks whether a cached translation is up-to-date before generating a new translation.
 *
 * @param options - An object containing source file paths, language tags, prompt generator, target strategy, and the cache working directory.
 * @returns A Promise that resolves when all translations have been processed.
 */
async function translateOrLoad(options: {
	sourcePaths: string[]
	languageTags: string[]
	promptGenerator: PromptGenerator
	targetStrategy: TargetStrategy
	cacheGitCwd: string
}) {
	let done = 1
	let total = 0
	await Promise.all(
		options.sourcePaths.map(async (sourcePath) => {
			const sourceFileName = path.basename(sourcePath)
			/** Backslash to forward slash to match Git log and for web path */
			const processedSourcePath = path.relative('.', sourcePath).replaceAll(/\\/g, '/')
			await Promise.all(
				options.languageTags.map(async (languageTag) => {
					const target = options.targetStrategy(languageTag, sourcePath)
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
						const sourceLatestCommitDate = mainLatestCommitDates.get(processedSourcePath)
						if (!sourceLatestCommitDate) {
							console.warn(
								`Didn't prepare latest commit date for ${processedSourcePath}, use Cached version`
							)
							useCachedTranslation = true
						}
						const cachePathFromCwd = path.relative(options.cacheGitCwd, target)
						const processedCachePathFromCwd = cachePathFromCwd.replaceAll(/\\/g, '/')
						const cacheLatestCommitDate = cacheLatestCommitDates.get(processedCachePathFromCwd)
						if (!cacheLatestCommitDate)
							throw new Error(`Didn't prepare latest commit date for ${target}`)
						if (cacheLatestCommitDate > sourceLatestCommitDate) {
							console.log(`Using cached translation for ${sourceFileName} in ${languageTag}`)
							useCachedTranslation = true
						}
					}
					if (!useCachedTranslation) {
						total++
						const content = await fs.readFile(sourcePath, 'utf-8')
						// TODO Don't process/match more often than necessary
						const processedContent = preprocessMarkdown(content)
						console.log(processedContent)
						const page = extractWebPath(sourcePath)
						const promptAdditions = collectPromptAdditions(page, languageTag)
						const translation = await translate(
							processedContent,
							options.promptGenerator,
							languageTag,
							promptAdditions
						)
						const processedTranslation = postprocessMarkdown(processedContent, translation)
						const dir = path.dirname(target)
						await fs.mkdir(dir, { recursive: true })
						// ensure nothing happens between writing, adding and commiting
						fsSync.writeFileSync(target, processedTranslation)
						const message = getCommitMessage(sourceFileName, languageTag, fileExists)
						try {
							await gitQueue.add(() =>
								(fileExists ? cacheGit : cacheGit.add('.')).commit(message, ['-a'])
							)
						} catch (e) {
							if (e instanceof Error && e.message.includes('nothing to commit')) {
								console.log(`${sourceFileName} in ${languageTag} didn't change`)
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

/**
 * Preprocesses markdown content by normalizing line endings,
 * optionally removing HTML comments that contain markdown headings or links,
 * and appending additional inline comments after matching specific patterns.
 *
 * @param source - The original markdown content.
 * @returns The preprocessed markdown content.
 */
function preprocessMarkdown(source: string) {
	let processed = source
	processed = processed.replaceAll(/\r\n/g, '\n')
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
	for (const { pattern, comment } of PREPROCESSING_COMMENT_AFTER_PATTERN) {
		processed = processed.replace(pattern, `$& <!-- ${comment} -->`)
	}
	return processed
}

/**
 * Sends a chat completion request to the LLM API.
 *
 * @param messages - Array of message objects for the conversation.
 * @param temperature - Temperature to use for generation (default is 0).
 * @returns A Promise that resolves to the generated message content.
 */
async function postChatCompletion(
	messages: { role: string; content: string }[],
	temperature = 0
): Promise<string> {
	const response = await requestQueue.add(() =>
		llmClient.post('/chat/completions', { messages, temperature })
	)
	return response.data.choices[0].message.content
}

/**
 * Generates an appropriate commit message based on whether the translation file already existed.
 *
 * @param sourceFileName - The name of the source file.
 * @param language - The language code for the translation.
 * @param fileExists - Boolean indicating if the file existed.
 * @returns The commit message.
 */
function getCommitMessage(sourceFileName: string, language: string, fileExists: boolean): string {
	return fileExists
		? `Update outdated translation for ${sourceFileName} in ${language}`
		: `Create new translation for ${sourceFileName} in ${language}`
}

/**
 * Translates the provided content to a specified language using a two-pass process.
 * The first pass generates a translation, and the second pass reviews and refines it.
 *
 * @param content - The original content to be translated.
 * @param promptGenerator - A function for generating the translation prompt.
 * @param language - The target language code.
 * @param promptAdditions - Additional context to include in the prompt.
 * @returns A Promise that resolves to the reviewed (final) translation.
 * @throws {Error} If either the translation or review pass fails.
 */
async function translate(
	content: string,
	promptGenerator: PromptGenerator,
	language: string,
	promptAdditions: string
): Promise<string> {
	const languageName = languageNamesInEnglish.of(language)
	if (!languageName) throw new Error(`Couldn't resolve language code: ${language}`)

	const translationPrompt = promptGenerator(languageName, content, promptAdditions)

	// First pass: generate initial translation
	const firstPass = await postChatCompletion([{ role: 'user', content: translationPrompt }])
	if (!firstPass) throw new Error(`Translation to ${languageName} failed`)
	console.log('First pass response:', firstPass)

	// Second pass: review and refine translation with context
	const reviewPrompt = generateReviewPrompt(languageName)
	const reviewed = await postChatCompletion([
		{ role: 'user', content: translationPrompt },
		{ role: 'assistant', content: firstPass },
		{ role: 'user', content: reviewPrompt }
	])
	if (!reviewed) throw new Error(`Review of ${languageName} translation failed`)
	console.log('Review pass response:', reviewed)

	return reviewed
}

/**
 * Postprocesses translated markdown content by optionally adding heading IDs.
 * It compares the headings in the source and the translated content and appends a generated ID to each heading.
 *
 * @param source - The original markdown content.
 * @param translation - The translated markdown content before postprocessing.
 * @returns The postprocessed markdown content with heading IDs.
 * @throws {Error} If the number of headings in the translation does not match those in the source.
 */
function postprocessMarkdown(source: string, translation: string) {
	let processed = translation
	if (POSTPROCESSING_ADD_HEADING_IDS) {
		const REGEX_HEADING = /^#+ (.*)/gm
		const headingsInSource = Array.from(source.matchAll(REGEX_HEADING))
		if (headingsInSource.length > 0) {
			let i = 0
			processed = translation.replace(REGEX_HEADING, (_match) => {
				const sourceResult = headingsInSource[i]
				if (!sourceResult)
					throw new Error(`Different heading count in translation:\n\n${translation}`)
				const headingInSource = sourceResult[1]
				const stripped = removeMarkdown(headingInSource)
				const slugged = slugger.slug(stripped)
				i++
				return `${_match} {#${slugged}}`
			})
		}
	}
	return processed
}

/**
 * Extracts a web path from a local file path using predefined regex patterns.
 * Returns the extracted portion if found, otherwise returns the original local path.
 *
 * @param localPath - The local file path.
 * @returns The extracted web path or the original file path.
 */
function extractWebPath(localPath: string): string {
	for (const pattern of PATH_PATTERNS) {
		const result = pattern.exec(localPath)
		// return group
		if (result) return result[1]
	}
	return localPath
}
