// SVELTEKIT SUBSTITUTE: Removed SvelteKit imports and replaced with Netlify Function structure
// SVELTEKIT SUBSTITUTE: Changed from '$env/dynamic/private' to process.env
// SVELTEKIT SUBSTITUTE: Changed import paths to netlify/functions

import Anthropic from '@anthropic-ai/sdk'
import { JobStorage } from './storage'

// Import types and configurations from server
import type { StepName, WriteState, StepConfig } from './write'
import { generateProgressString, prepareResponse } from './write'

// SVELTEKIT SUBSTITUTE: Changed from env imports to process.env
const ANTHROPIC_API_KEY_FOR_WRITE = process.env.ANTHROPIC_API_KEY_FOR_WRITE || undefined
const ENABLE_WEB_SEARCH = process.env.ENABLE_WEB_SEARCH !== 'false'
const MAX_TOOL_CALLS_PER_STEP = parseInt(process.env.MAX_TOOL_CALLS_PER_STEP || '3')
const IS_API_AVAILABLE = !!ANTHROPIC_API_KEY_FOR_WRITE

// Workflow configurations (duplicated from write.ts for background processing)
const workflowConfigs: Record<string, any> = {
	'1': {
		steps: ['findTarget'],
		description: 'Find Target Only'
	},
	'2': {
		steps: ['webSearch', 'research'],
		description: 'Web Search + Autofill'
	},
	'3': {
		steps: ['research'],
		description: 'Autofill only'
	},
	'4': {
		steps: ['firstDraft', 'firstCut', 'firstEdit', 'toneEdit', 'finalEdit'],
		description: 'Full Email Generation'
	}
}

// Initialize Anthropic client
const anthropic = IS_API_AVAILABLE
	? new Anthropic({
			apiKey: ANTHROPIC_API_KEY_FOR_WRITE
		})
	: null

// System prompts for step processing
const System_Prompts: { [id: string]: string } = {
	Basic: `You are a helpful AI assistant.

Note: Some fields in the information may begin with a robot emoji (🤖). This indicates the field was automatically generated during research. You can use this information normally, just ignore the emoji marker.`,

	Mail: `
What follows is the anatomy of a good email, a set of guidelines and
criteria for writing a good mail. Each paragraph, except the last represents 
a distinct part of the email.

Subject line:
The subject line should be short, informative and clearly communicate
the goal of the mail. It must grab the attention and capture the
interest of the recipient. Avoid cliché language.

Greeting:
The greeting must match the tone of the mail. If possible, address the
recipient by the appropriate title. Keep it short, and mention the reason
for the mail. Establish a strong connection with the recipient: Are they
a politician meant to represent you? Is it regarding something they've
recently done? Make the recipient feel like they owe you an answer.

First paragraph:
Explain what the purpose of the email is. It must be concise and captivating,
most people who receive many emails learn to quickly dismiss many. Make
sure the relation is established and they have a reason to read on. 

Body paragraph:
The main body of the email should be informative and contain the information
of the mail. Take great care not to overwhelm the reader: it must be
logically structured and not too full of facts. The message should remain 
clear and the relation to the greeting and first paragraph must remain clear.
It should not be too long, otherwise it might get skimmed. Links to further
information can be provided.

Conclusion:
Keep this short and sweet. Make sure it has a CLEAR CALL TO ACTION!
Restate the reason the recipient should feel the need to act. Thank them
for their time and/or your ask.

General:
Make sure the formatting isn't too boring. Write in a manner the recipient
would respond well to: Do not argue with them, do not mention views they
probably won't share. Try to play to things they said before and that fit
their persona. Keep the tone consistent and not too emotional. Do not sound
crazy.
`,

	Checklist: `
Checklist Before Sending
Message Verification
    Is the purpose crystal clear?
    Have I provided necessary context?
    Is there a specific, achievable call to action?
    Have I proofread for tone and clarity?
`,

	First_Draft: `
Using the information that will be provided by the user, write the mail 
according to the criteria. Get all the information into the mail. 
Don't worry about it being too long. Keep the message powerful.
`,

	First_Cut: `
You will be provided with an email by the user. 
Remove redundant information and clean up the structure. The point of this pass is 
to have the structure clear and the mail slightly longer than needed. The message 
should be clear, the information still mostly present, with only what is 
absolutely necessary being removed.
`,

	First_Edit: `
You will be provided with an email by the user. The following points are paramount:
Make sure the flow of information is natural. All paragraphs should be
connected in a sensical manner. Remove odd, unfitting or overly emotional
language. Make sure the paragraphs fulfill their roles.
`,

	Tone_Edit: `
You will be provided with an email by the user. The following points are paramount:
Adjust the language to match recipient's communication style. Remove potentially 
offensive or dismissive language. Ensure the tone matches the relationship and 
purpose. Make sure the points and information is relevant for the recipient. 
Assume the recipient's position: How would they react to the mail? What information 
would resonate with them? What wouldn't? Do not compromise on the message.
`,

	Final_Edit: `
You will be provided with an email by the user. Make sure the email matches the 
criteria initially described. Check spelling, grammar and tone.
`,

	Research: `
Please replace all mentions of 'undefined' with the apropriate information that should
go in that space, derived from the rest of the information. 

Important: For any field you fill in that was originally 'undefined' or empty, prefix 
your answer with a robot emoji (🤖) to indicate it was automatically generated.

Example:
Original: "Preferred communication style: undefined"
Your output: "Preferred communication style: 🤖 Formal but approachable"

Please remember that you are addressing this person, and try to make all inferences based on the information provided and your own knowledge. Err on the side of caution: if you are unsure, be polite and neutral.

Output the full information, including your edits. Output nothing else.
`,

	Target: `
Please use your internet search capability to find individuals involved with AI safety who match the following description.

For each person you find (aim for 3-5 people), please provide:
1. Name and current position
2. Why they're relevant to AI safety
3. Their organization
4. Brief note on their public stance on AI safety

Please cite your sources for each person.
`,

	webSearch: `
Please use your internet search capability to research [Person's Name] who is [current role] at [organization/affiliation]. I plan to contact them about AI safety concerns.

Search for and provide:
1. Professional background (education, career history, notable positions)
2. Their involvement with AI issues (policy positions, public statements, initiatives, articles, interviews)
3. Their public views on AI development and safety (with direct quotes where possible)
4. Recent activities related to technology policy or AI (last 6-12 months)
5. Communication style and key terms they use when discussing technology issues
6. Notable connections (organizations, committees, coalitions, or influential individuals they work with)
7. Contact information (professional email or official channels if publicly available)

Please cite all sources you use and only include information you can verify through your internet search. If you encounter conflicting information, note this and provide the most reliable source.

BE BRIEF! This is extremely important. Try to output only a few lines of text for each questions.
`,

	Results: `
Only reply with the final results, a.k.a. the final email, and absolutely nothing else.
`
}

// Step configurations
export const stepConfigs: Record<StepName, StepConfig> = {
	findTarget: {
		toolsEnabled: true,
		maxToolCalls: 5,
		description: 'Find possible targets (using web search)'
	},
	webSearch: {
		toolsEnabled: true,
		maxToolCalls: 3,
		description: 'Research the target (using web search)'
	},
	research: {
		toolsEnabled: false,
		maxToolCalls: 2,
		description: 'Auto-fill missing user inputs'
	},
	firstDraft: { toolsEnabled: false },
	firstCut: { toolsEnabled: false },
	firstEdit: { toolsEnabled: false },
	toneEdit: { toolsEnabled: false },
	finalEdit: { toolsEnabled: false }
}

// Enhanced callClaude function with tool support
export async function callClaude(
	stepName: string,
	promptNames: string[],
	userContent: string,
	toolsEnabled: boolean = false
): Promise<{ text: string; durationSec: number }> {
	const pencil = '✏️'
	const search = '🔍'
	const logPrefix = `${pencil} write:${stepName}`
	const startTime = Date.now()

	console.time(`${logPrefix}`)

	try {
		// Check if the API client is available
		if (!anthropic) {
			throw new Error('Anthropic API client is not initialized. API key is missing.')
		}

		// Combine all the specified prompts
		const systemPrompt = promptNames.map((name) => System_Prompts[name]).join('')

		// Determine if tools should be included in this call
		const shouldUseTools = toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE

		// Log tool usage status
		if (shouldUseTools) {
			console.log(`${search} ${logPrefix}: Tools enabled for this step`)
		}

		// Use correct web search tool definition matching API documentation
		const tools = shouldUseTools
			? [
					{
						type: 'web_search_20250305',
						name: 'web_search',
						max_uses: 3
					}
				]
			: undefined

		// Create API request with conditional tool support
		const requestParams: any = {
			model: 'claude-3-7-sonnet-20250219',
			max_tokens: 4096,
			system: systemPrompt,
			messages: [{ role: 'user', content: userContent }]
		}

		// Add tools to request if enabled
		if (tools) {
			requestParams.tools = tools
		}

		// Implement proper tool execution loop
		let currentMessages = [...requestParams.messages]
		let finalText = ''
		let toolCallCount = 0
		const maxCalls = Math.min(
			MAX_TOOL_CALLS_PER_STEP,
			stepConfigs[stepName as StepName]?.maxToolCalls || MAX_TOOL_CALLS_PER_STEP
		)

		while (toolCallCount < maxCalls) {
			// Create request with current message history
			const currentRequest = {
				...requestParams,
				messages: currentMessages
			}

			const response = await anthropic.messages.create(currentRequest)

			// Log the request ID at debug level
			console.debug(`${logPrefix} requestId: ${response.id}`)

			// Process response content properly
			let hasToolUse = false
			let textContent = ''

			for (const content of response.content) {
				if (content.type === 'text') {
					textContent += content.text
				} else if (content.type === 'server_tool_use' && shouldUseTools) {
					// Handle server-side tool use (web search is executed automatically)
					hasToolUse = true
					toolCallCount++
					console.log(`${search} ${logPrefix}: Web search executed - ${content.name}`)
				} else if (content.type === 'web_search_tool_result') {
					// Handle web search results (automatically provided by API)
					console.log(`${search} ${logPrefix}: Received web search results`)
				}
			}

			// Add assistant's response to conversation history
			currentMessages.push({
				role: 'assistant',
				content: response.content
			})

			// Accumulate text content
			finalText += textContent

			// Break if no tool use or if we've hit limits
			if (!hasToolUse || toolCallCount >= maxCalls) {
				break
			}

			// If there was tool use, Claude might continue in the same turn
			// Check if response has pause_turn stop reason
			if (response.stop_reason === 'pause_turn') {
				// Continue the conversation to let Claude finish its turn
				continue
			} else {
				// Tool use complete, break the loop
				break
			}
		}

		// Ensure we have text content
		if (!finalText) {
			throw new Error('No text content received from Claude')
		}

		const elapsed = (Date.now() - startTime) / 1000 // seconds

		// Log tool usage statistics
		if (shouldUseTools && toolCallCount > 0) {
			console.log(`${search} ${logPrefix}: Used ${toolCallCount} web searches`)
		}

		// Log the full response text at debug level
		console.debug(`${logPrefix} full response:\n---\n${finalText}\n---`)
		return { text: finalText, durationSec: elapsed }
	} catch (error) {
		// Better error handling for tool-related failures
		if (toolsEnabled && (error.message?.includes('tool') || error.message?.includes('search'))) {
			console.warn(
				`${search} ${logPrefix}: Tool error, falling back to text-only mode:`,
				error.message
			)
			// Retry without tools on tool-related errors
			return callClaude(stepName, promptNames, userContent, false)
		}
		throw error // Re-throw non-tool errors
	} finally {
		console.timeEnd(`${logPrefix}`)
	}
}

// Define step handlers in a map for easy lookup
const stepHandlers: Record<
	StepName,
	(state: WriteState) => Promise<{ text: string; durationSec: number }>
> = {
	// Enable tools for target finding
	findTarget: async (state) => {
		System_Prompts['Information'] = state.userInput

		// Check if tools should be enabled for this step
		const stepConfig = stepConfigs.findTarget
		const toolsEnabled = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH

		const result = await callClaude(
			'findTarget',
			['Basic', 'Target', 'Information'],
			'Hello! Please help me find a person to contact!',
			toolsEnabled
		)

		state.information = result.text
		System_Prompts['Information'] = result.text

		return result
	},

	// Enable tools for web search
	webSearch: async (state) => {
		System_Prompts['Information'] = state.userInput

		// Check if tools should be enabled for this step
		const stepConfig = stepConfigs.webSearch
		const toolsEnabled = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH

		const result = await callClaude(
			'webSearch',
			['Basic', 'webSearch', 'Information', 'Results'],
			'Hello! Please research this person!',
			toolsEnabled
		)

		state.information = result.text
		System_Prompts['Information'] = System_Prompts['Information'] + '\n\n' + result.text

		return result
	},

	// Enable tools for research step
	research: async (state) => {
		System_Prompts['Information'] = state.userInput

		// Check if tools should be enabled for this step
		const stepConfig = stepConfigs.research
		const toolsEnabled = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH

		const result = await callClaude(
			'research',
			['Basic', 'Mail', 'Information', 'Research'],
			"Hello! Please update the list of information by replacing all instances of 'undefined' with something that belongs under their respective header based on the rest of the information provided. Thank you!",
			toolsEnabled
		)

		state.information = result.text
		System_Prompts['Information'] = result.text

		return result
	},

	// Text processing steps remain without tools for performance
	firstDraft: async (state) => {
		return await callClaude(
			'firstDraft',
			['Basic', 'Mail', 'First_Draft', 'Results'],
			'Hello! Please write an email draft using the following information. \n' + state.userInput
		)
	},

	firstCut: async (state) => {
		return await callClaude(
			'firstCut',
			['Basic', 'Mail', 'Information', 'First_Cut', 'Results'],
			'Hello! Please cut the following email draft. \n \n' + state.email
		)
	},

	firstEdit: async (state) => {
		return await callClaude(
			'firstEdit',
			['Basic', 'Mail', 'Information', 'First_Edit', 'Results'],
			'Hello! Please edit the following email draft. \n \n' + state.email
		)
	},

	toneEdit: async (state) => {
		return await callClaude(
			'toneEdit',
			['Basic', 'Mail', 'Information', 'Tone_Edit', 'Results'],
			'Hello! Please edit the tone of the following email draft. \n \n' + state.email
		)
	},

	finalEdit: async (state) => {
		return await callClaude(
			'finalEdit',
			['Basic', 'Mail', 'Information', 'Final_Edit', 'Checklist', 'Results'],
			'Hello! Please edit the following email draft. \n \n' + state.email
		)
	}
}

// Process a specific step with storage integration
export async function processStep(jobId: string): Promise<WriteState> {
	const pencil = '✏️'

	try {
		// Load state from storage
		const jobData = await JobStorage.getJob(jobId)
		if (!jobData) {
			throw new Error(`Job ${jobId} not found`)
		}

		let state = jobData.writeState
		console.log(`${pencil} processStep: Processing job ${jobId}, step ${state.nextStep}`)

		// Check if job is already complete or has no next step
		if (!state.nextStep || state.step === 'complete') {
			console.log(`${pencil} processStep: Job ${jobId} already complete`)
			return state
		}

		const currentStep = state.nextStep as StepName
		state.currentStep = currentStep

		// Update remaining steps - remove current step from remaining
		state.remainingSteps = state.remainingSteps.filter((step) => step !== currentStep)

		// Update job status to processing
		await JobStorage.updateJobStatus(jobId, 'processing')

		// Execute the step using the step handler from the map
		const stepHandler = stepHandlers[currentStep]
		if (!stepHandler) {
			throw new Error(`Unknown step: ${currentStep}`)
		}

		console.log(`${pencil} processStep: Executing step ${currentStep} for job ${jobId}`)
		const result = await stepHandler(state)

		// Update email content (except for research-like steps which update information)
		if (!['research'].includes(currentStep)) {
			state.email = result.text
		}

		// Update state with results - current step is now completed
		state.step = currentStep
		state.completedSteps.push({
			name: currentStep,
			durationSec: result.durationSec
		})

		// Set next step based on workflow configuration
		const workflowSteps = getWorkflowSteps(state.workflowType)
		const currentIndex = workflowSteps.indexOf(currentStep)

		if (currentIndex !== -1 && currentIndex < workflowSteps.length - 1) {
			state.nextStep = workflowSteps[currentIndex + 1]
			state.currentStep = workflowSteps[currentIndex + 1]
		} else {
			// Last step completed, mark as complete
			state.nextStep = null
			state.currentStep = null
			state.step = 'complete'
		}

		// Update storage with new state
		await JobStorage.updateWriteState(jobId, state)

		// If there are more steps, continue processing
		if (state.nextStep && state.step !== 'complete') {
			console.log(
				`${pencil} processStep: Continuing to next step ${state.nextStep} for job ${jobId}`
			)
			// Recursively process the next step
			return await processStep(jobId)
		} else {
			// Mark job as completed
			console.log(`${pencil} processStep: Job ${jobId} completed`)
			await JobStorage.completeJob(jobId, state)
		}

		return state
	} catch (error) {
		console.error(`${pencil} processStep: Error processing job ${jobId}:`, error)

		// Mark job as failed
		await JobStorage.failJob(jobId, error.message || 'Unknown error occurred')

		// Re-throw the error for the caller to handle
		throw error
	}
}

// Helper function to get workflow steps
function getWorkflowSteps(workflowType: string): StepName[] {
	return workflowConfigs[workflowType]?.steps || []
}

// SVELTEKIT SUBSTITUTE: Converted to Netlify Function handler
export const handler = async (event: any, context: any) => {
	const pencil = '✏️'

	// SVELTEKIT SUBSTITUTE: Handle CORS for browser requests
	const headers = {
		'Content-Type': 'application/json',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Headers': 'Content-Type',
		'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
	}

	// Handle preflight requests
	if (event.httpMethod === 'OPTIONS') {
		return {
			statusCode: 200,
			headers,
			body: ''
		}
	}

	// Handle GET requests (status check)
	if (event.httpMethod === 'GET') {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({
				status: 'Background processing service is running',
				apiAvailable: IS_API_AVAILABLE
			})
		}
	}

	// Handle POST requests (process job)
	if (event.httpMethod === 'POST') {
		try {
			const { jobId } = JSON.parse(event.body || '{}')

			if (!jobId) {
				return {
					statusCode: 400,
					headers,
					body: JSON.stringify({ error: 'Job ID is required' })
				}
			}

			console.log(`${pencil} background: Starting processing for job ${jobId}`)

			// Check if API is available
			if (!IS_API_AVAILABLE) {
				await JobStorage.failJob(jobId, 'Anthropic API key is not available')
				return {
					statusCode: 500,
					headers,
					body: JSON.stringify({ error: 'API not available' })
				}
			}

			// Process the job
			const finalState = await processStep(jobId)

			console.log(`${pencil} background: Job ${jobId} processing completed`)

			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					success: true,
					jobId,
					complete: finalState.step === 'complete'
				})
			}
		} catch (error) {
			console.error(`${pencil} background: Error in background processing:`, error)

			// Try to update job status if we have a jobId
			try {
				const requestData = JSON.parse(event.body || '{}')
				if (requestData.jobId) {
					await JobStorage.failJob(
						requestData.jobId,
						error.message || 'Background processing failed'
					)
				}
			} catch (parseError) {
				// Ignore parse errors when trying to extract jobId for error handling
			}

			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({
					error: 'Background processing failed',
					message: error.message
				})
			}
		}
	}

	// Handle unsupported methods
	return {
		statusCode: 405,
		headers,
		body: JSON.stringify({ error: 'Method not allowed' })
	}
}
