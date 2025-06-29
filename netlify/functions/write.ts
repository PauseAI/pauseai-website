// SVELTEKIT SUBSTITUTE: Removed SvelteKit imports and replaced with Netlify Function structure
// SVELTEKIT SUBSTITUTE: Changed from '@sveltejs/kit' to standard Response objects
// SVELTEKIT SUBSTITUTE: Changed env import to process.env
// SVELTEKIT SUBSTITUTE: Changed import paths to netlify/functions

import { JobStorage, generateJobId } from './storage'

// Type definitions
export type StepName =
	| 'findTarget'
	| 'webSearch'
	| 'research'
	| 'firstDraft'
	| 'firstCut'
	| 'firstEdit'
	| 'toneEdit'
	| 'finalEdit'

export type WorkflowType = '1' | '2' | '3' | '4'

export interface StepConfig {
	toolsEnabled?: boolean
	maxToolCalls?: number
	description?: string
}

export type WorkflowConfig = {
	steps: StepName[]
	description: string
	stepConfigs?: Record<StepName, StepConfig>
}

export interface WriteState {
	step: StepName | 'complete' | 'start'
	workflowType: WorkflowType
	userInput: string
	email: string
	information?: string
	completedSteps: Array<{
		name: StepName
		durationSec: number
	}>
	currentStep: StepName | null
	remainingSteps: StepName[]
	nextStep: StepName | null
}

export type ChatResponse = {
	response: string
	apiAvailable?: boolean
	stateToken?: string
	progressString?: string
	complete?: boolean
	information?: string
	jobId?: string
	status?: string
}

export type Message = {
	role: 'user' | 'assistant' | 'system'
	content: string
}

export interface JobStorage {
	jobId: string
	status: 'pending' | 'processing' | 'completed' | 'failed'
	writeState: WriteState
	error?: string
	createdAt: Date
	completedAt?: Date
}

// SVELTEKIT SUBSTITUTE: Changed from env imports to process.env
const ANTHROPIC_API_KEY_FOR_WRITE = process.env.ANTHROPIC_API_KEY_FOR_WRITE || undefined
const ENABLE_WEB_SEARCH = process.env.ENABLE_WEB_SEARCH !== 'false'
const IS_API_AVAILABLE = !!ANTHROPIC_API_KEY_FOR_WRITE
const NETLIFY_BACKGROUND_FUNCTION_URL =
	process.env.NETLIFY_BACKGROUND_FUNCTION_URL || '/.netlify/functions/process-step-background'

// Step configurations (imported from background file)
const stepConfigs: Record<StepName, StepConfig> = {
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

// Workflow configurations
const workflowConfigs: Record<WorkflowType, WorkflowConfig> = {
	'1': {
		steps: ['findTarget'],
		description: 'Find Target Only',
		stepConfigs
	},
	'2': {
		steps: ['webSearch', 'research'],
		description: 'Web Search + Autofill',
		stepConfigs
	},
	'3': {
		steps: ['research'],
		description: 'Autofill only',
		stepConfigs
	},
	'4': {
		steps: ['firstDraft', 'firstCut', 'firstEdit', 'toneEdit', 'finalEdit'],
		description: 'Full Email Generation',
		stepConfigs
	}
}

// Log warning during build if API key is missing
if (!IS_API_AVAILABLE) {
	console.warn(
		'⚠️ ANTHROPIC_API_KEY_FOR_WRITE is not set. The /write page will operate in limited mode.'
	)
}

// Helper function to parse workflow type from user input
function parseWorkflowType(userInput: string): {
	workflowType: WorkflowType
	cleanedInput: string
} {
	const workflowMatch = userInput.match(/^\[([1-4])\](.*)$/s)

	if (workflowMatch) {
		const workflowType = workflowMatch[1] as WorkflowType
		const cleanedInput = workflowMatch[2].trim()
		return { workflowType, cleanedInput }
	}

	// Default to workflow 4 if no prefix is found
	return { workflowType: '4', cleanedInput: userInput }
}

// Function to get step description with tool awareness
function getStepDescription(stepName: StepName): string {
	const stepConfig = stepConfigs[stepName]
	const toolsWillBeUsed = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE

	// Return enhanced description if tools are enabled and available
	if (toolsWillBeUsed && stepConfig?.description) {
		return stepConfig.description
	}

	// Fallback to standard descriptions
	const stepDescriptions: Record<StepName, string> = {
		findTarget: 'Find possible targets',
		webSearch: 'Research the target',
		research: 'Auto-fill missing user inputs',
		firstDraft: 'Create initial draft',
		firstCut: 'Remove unnecessary content',
		firstEdit: 'Improve text flow',
		toneEdit: 'Adjust tone and style',
		finalEdit: 'Final polish'
	}

	return stepDescriptions[stepName]
}

// Function to generate a progress string from the state
export function generateProgressString(state: WriteState): string {
	const pencil = '✏️'
	const checkmark = '✓'
	const search = '🔍'

	// Get workflow description
	const workflowDescription = workflowConfigs[state.workflowType].description

	// Generate the progress string
	let lis = []

	// Completed steps with tool usage indicators
	for (const step of state.completedSteps) {
		const stepConfig = stepConfigs[step.name]
		const usedTools = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE
		const icon = usedTools ? `${search}${checkmark}` : checkmark

		lis.push(
			`<li class="complete">${getStepDescription(step.name)} (${step.durationSec.toFixed(1)}s) ${icon}</li>`
		)
	}

	// Current step with tool usage indicator
	if (
		state.currentStep &&
		state.step !== 'complete' &&
		!state.completedSteps.some((s) => s.name === state.currentStep)
	) {
		const stepConfig = stepConfigs[state.currentStep]
		const willUseTools = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE
		const icon = willUseTools ? `${search}${pencil}` : pencil

		lis.push(`<li class="current">${getStepDescription(state.currentStep)} ${icon}</li>`)
	}

	// Remaining steps with tool usage preview
	const completedAndCurrentSteps = [...state.completedSteps.map((s) => s.name), state.currentStep]
	const filteredRemainingSteps = state.remainingSteps.filter(
		(step) => !completedAndCurrentSteps.includes(step)
	)

	lis = lis.concat(
		filteredRemainingSteps.map((step) => {
			const stepConfig = stepConfigs[step]
			const willUseTools = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE
			const description = getStepDescription(step)
			const indicator = willUseTools ? ` ${search}` : ''

			return `<li class="pending">${description}${indicator}</li>`
		})
	)

	const listItems = lis.join('')
	const totalTime = state.completedSteps.reduce((sum, step) => sum + step.durationSec, 0)

	if (state.nextStep === null) {
		// Process is complete
		return `<strong>${workflowDescription} - Done (${totalTime.toFixed(1)}s):</strong><ul>${listItems}</ul>`
	} else {
		return `<strong>${workflowDescription} - Progress:</strong><ul>${listItems}</ul>`
	}
}

// Initialize a new state for the step-by-step process
function initializeState(userInput: string): WriteState {
	const { workflowType, cleanedInput } = parseWorkflowType(userInput)
	const workflowSteps = workflowConfigs[workflowType].steps

	const firstStep = workflowSteps[0]
	const remainingSteps = workflowSteps.slice(1)

	return {
		step: 'start',
		workflowType,
		userInput: cleanedInput,
		email: '',
		completedSteps: [],
		currentStep: firstStep,
		remainingSteps,
		nextStep: firstStep
	}
}

// Helper function to prepare consistent responses
export function prepareResponse(state: WriteState): ChatResponse {
	// Generate progress string
	const progressString = generateProgressString(state)

	// Prepare response
	const isComplete = state.nextStep === null
	return {
		response: state.email || '',
		apiAvailable: true,
		stateToken: JSON.stringify(state),
		progressString,
		complete: isComplete,
		information: state.information || state.userInput
	}
}

// Trigger background function processing
async function triggerBackgroundProcessing(jobId: string): Promise<void> {
	try {
		// Call the background function endpoint
		await fetch(NETLIFY_BACKGROUND_FUNCTION_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ jobId })
		})
	} catch (error) {
		console.error('Error triggering background processing:', error)
		// Mark job as failed if we can't trigger the background function
		await JobStorage.failJob(jobId, 'Failed to trigger background processing')
	}
}

// SVELTEKIT SUBSTITUTE: Converted to Netlify Function handler
export const handler = async (event: any, context: any) => {
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

	// Handle GET requests
	if (event.httpMethod === 'GET') {
		return {
			statusCode: 200,
			headers,
			body: JSON.stringify({ apiAvailable: IS_API_AVAILABLE })
		}
	}

	// Handle POST requests
	if (event.httpMethod === 'POST') {
		// Check if API is available
		if (!IS_API_AVAILABLE) {
			return {
				statusCode: 200,
				headers,
				body: JSON.stringify({
					response:
						'⚠️ This feature requires an Anthropic API key. Please add the ANTHROPIC_API_KEY_FOR_WRITE environment variable to enable email generation functionality. Contact the site administrator for help.',
					apiAvailable: false
				} as ChatResponse)
			}
		}

		try {
			const pencil = '✏️'
			const requestData = JSON.parse(event.body || '{}')

			// Check if this is a continuation of an existing process
			let state: WriteState
			let jobId: string

			if (requestData.stateToken) {
				// Continue an existing process - extract jobId from stateToken or request
				try {
					const parsedState = JSON.parse(requestData.stateToken) as WriteState

					// If jobId is provided in the request, use it; otherwise we need to handle legacy stateTokens
					if (requestData.jobId) {
						jobId = requestData.jobId
						// Get the latest state from storage
						const jobData = await JobStorage.getJob(jobId)
						if (!jobData) {
							return {
								statusCode: 200,
								headers,
								body: JSON.stringify({
									response: 'Job not found. Please try starting over.',
									apiAvailable: true
								} as ChatResponse)
							}
						}
						state = jobData.writeState
					} else {
						// Legacy support - use the state from stateToken directly
						state = parsedState
						// For legacy requests, we still need to create a job for future processing
						jobId = generateJobId()
						await JobStorage.createJob(jobId, state)
					}

					console.log(
						`${pencil} write: Continuing from step ${state.step} (workflow ${state.workflowType}) - Job ID: ${jobId}`
					)
				} catch (error) {
					console.error('Error parsing state token:', error)
					return {
						statusCode: 200,
						headers,
						body: JSON.stringify({
							response: 'Invalid state token. Please try starting over.',
							apiAvailable: true
						} as ChatResponse)
					}
				}
			} else {
				// Start a new process
				console.log(`${pencil} write: Starting new email generation`)

				// Get the user input from the first message
				const messages = requestData
				const info = messages[0]?.content

				if (!info || info === '') {
					return {
						statusCode: 200,
						headers,
						body: JSON.stringify({
							response:
								'No information provided. Please fill in some of the fields to generate an email.'
						} as ChatResponse)
					}
				}

				// Initialize new state with workflow parsing
				state = initializeState(info)
				console.log(
					`${pencil} write: Detected workflow type ${state.workflowType}: ${workflowConfigs[state.workflowType].description}`
				)

				// Create a new job in storage
				jobId = generateJobId()
				await JobStorage.createJob(jobId, state)
				console.log(`${pencil} write: Created job ${jobId}`)

				// For initial calls (no stateToken), return progress string without processing
				if (requestData.stateToken === undefined) {
					const response = prepareResponse(state)
					return {
						statusCode: 200,
						headers,
						body: JSON.stringify({
							...response,
							jobId,
							status: 'pending'
						})
					}
				}
			}

			// For subsequent calls or continuation, trigger background processing
			if (state.nextStep && state.step !== 'complete') {
				// Trigger background processing (non-blocking)
				triggerBackgroundProcessing(jobId)

				// Update job status to processing
				await JobStorage.updateJobStatus(jobId, 'processing')

				// Return current state with job info
				const response = prepareResponse(state)
				return {
					statusCode: 200,
					headers,
					body: JSON.stringify({
						...response,
						jobId,
						status: 'processing'
					})
				}
			} else {
				// Job is complete
				const response = prepareResponse(state)
				return {
					statusCode: 200,
					headers,
					body: JSON.stringify({
						...response,
						jobId,
						status: 'completed'
					})
				}
			}
		} catch (err) {
			console.error('Error in email generation:', err)
			return {
				statusCode: 500,
				headers,
				body: JSON.stringify({
					response:
						'An error occurred while generating your email. Please try again later or contact support.',
					apiAvailable: false
				} as ChatResponse)
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
