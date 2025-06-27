import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import Anthropic from '@anthropic-ai/sdk'
import { optionallyLogUsage } from '$lib/usage-logger'

// Safely access the API key, will be undefined if not set
const ANTHROPIC_API_KEY_FOR_WRITE = env.ANTHROPIC_API_KEY_FOR_WRITE || undefined
// NEW: Add global toggle for web search functionality
const ENABLE_WEB_SEARCH = env.ENABLE_WEB_SEARCH !== 'false' // Default to true unless explicitly disabled
// NEW: Add configurable rate limiting for tool calls per step
const MAX_TOOL_CALLS_PER_STEP = parseInt(env.MAX_TOOL_CALLS_PER_STEP || '3')

// Flag to track if API is available
const IS_API_AVAILABLE = !!ANTHROPIC_API_KEY_FOR_WRITE

// Log warning during build if API key is missing
if (!IS_API_AVAILABLE) {
	console.warn(
		'⚠️ ANTHROPIC_API_KEY_FOR_WRITE is not set. The /write page will operate in limited mode.'
	)
}

// Define step types for server-side use
type StepName =
	| 'findTarget'
	| 'webSearch'
	| 'research'
	| 'firstDraft'
	| 'firstCut'
	| 'firstEdit'
	| 'toneEdit'
	| 'finalEdit'

// Define workflow types
type WorkflowType = '1' | '2' | '3' | '4'

// NEW: Define step configuration interface for tool usage
interface StepConfig {
	toolsEnabled?: boolean // Whether this step can use tools
	maxToolCalls?: number // Maximum tool calls for this step (overrides global)
	description?: string // Enhanced description when tools are used
}

// ENHANCED: Extend workflow configuration to support step configs
type WorkflowConfig = {
	steps: StepName[]
	description: string
	stepConfigs?: Record<StepName, StepConfig> // NEW: Optional step-level configuration
}

// NEW: Define step-level tool configurations
const stepConfigs: Record<StepName, StepConfig> = {
	// Research-focused steps that benefit from web search
	findTarget: {
		toolsEnabled: true,
		maxToolCalls: 3,
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
	// Text processing steps remain tool-free for performance
	firstDraft: { toolsEnabled: false },
	firstCut: { toolsEnabled: false },
	firstEdit: { toolsEnabled: false },
	toneEdit: { toolsEnabled: false },
	finalEdit: { toolsEnabled: false }
}

const workflowConfigs: Record<WorkflowType, WorkflowConfig> = {
	'1': {
		steps: ['findTarget'],
		description: 'Find Target Only',
		stepConfigs // NEW: Include step configurations
	},
	'2': {
		steps: ['webSearch', 'research'],
		description: 'Web Search + Autofill',
		stepConfigs // NEW: Include step configurations
	},
	'3': {
		steps: ['research'],
		description: 'Autofill only',
		stepConfigs // NEW: Include step configurations
	},
	'4': {
		steps: ['firstDraft', 'firstCut', 'firstEdit', 'toneEdit', 'finalEdit'],
		description: 'Full Email Generation',
		stepConfigs // NEW: Include step configurations
	}
}
// Server-side state management interface (not exposed to client)
interface WriteState {
	step: StepName | 'complete' | 'start' // Current/completed step
	workflowType: WorkflowType // Type of workflow being executed
	userInput: string // Original input from form (cleaned, without prefix)
	email: string // Current email content
	information?: string // Processed information after research
	completedSteps: Array<{
		name: StepName
		durationSec: number
	}>
	currentStep: StepName | null // Step being processed
	remainingSteps: StepName[] // Steps still to do
	nextStep: StepName | null // Next step to run (null if complete)
}

// Client-facing response type
export type ChatResponse = {
	response: string // Email content to display
	apiAvailable?: boolean // Is API available
	stateToken?: string // Opaque state token to pass to next request
	progressString?: string // Human-readable progress string
	complete?: boolean // Is the process complete
	information?: string // Processed information for form fields
}

// Type safety by Claude
interface AnthropicResponse {
	id: string
	content: Array<{
		type: string
		text?: string
		name?: string
		[key: string]: any
	}>
	stop_reason?: string
	[key: string]: any
}

export type Message = {
	role: 'user' | 'assistant' | 'system'
	content: string
}

const System_Prompts: { [id: string]: string } = {}
System_Prompts['Basic'] = `You are a helpful AI assistant.

Note: Some fields in the information may begin with a robot emoji (🤖). This indicates the field was automatically generated during research. You can use this information normally, just ignore the emoji marker.`

System_Prompts['Mail'] = `
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
`
System_Prompts['Checklist'] = `
Checklist Before Sending
Message Verification
    Is the purpose crystal clear?
    Have I provided necessary context?
    Is there a specific, achievable call to action?
    Have I proofread for tone and clarity?
`

System_Prompts['First_Draft'] = `
Using the information that will be provided by the user, write the mail 
according to the criteria. Get all the information into the mail. 
Don't worry about it being too long. Keep the message powerful.
`

System_Prompts['First_Cut'] = `
You will be provided with an email by the user. 
Remove redundant information and clean up the structure. The point of this pass is 
to have the structure clear and the mail slightly longer than needed. The message 
should be clear, the information still mostly present, with only what is 
absolutely necessary being removed.
`

System_Prompts['First_Edit'] = `
You will be provided with an email by the user. The following points are paramount:
Make sure the flow of information is natural. All paragraphs should be
connected in a sensical manner. Remove odd, unfitting or overly emotional
language. Make sure the paragraphs fulfill their roles.
`

System_Prompts['Tone_Edit'] = `
You will be provided with an email by the user. The following points are paramount:
Adjust the language to match recipient's communication style. Remove potentially 
offensive or dismissive language. Ensure the tone matches the relationship and 
purpose. Make sure the points and information is relevant for the recipient. 
Assume the recipient's position: How would they react to the mail? What information 
would resonate with them? What wouldn't? Do not compromise on the message.
`

System_Prompts['Final_Edit'] = `
You will be provided with an email by the user. Make sure the email matches the 
criteria initially described. Check spelling, grammar and tone.
`

System_Prompts['Making_Template'] = `
Making a template out of an email requires a good email as a base, then punching massive
holes into the email to allow for the fitting of new information, specifically in tone
and style as well as personal connection. The information should be kept, as well as the 
structural flow of the email and especially between the paragraphs. Provide clearly 
denoted comments on what was removed and by what it should be replaced.

The user will provide an email for you to turn into a template using the method described before.
`

System_Prompts['Improving_Template'] = `
Assume the role of someone filling in the email template. How much do you have to 
rewrite text to make you contributions fit? Can you keep the email brief? Are you restricted
by any word choices and sentence structures? Can you instert your own personality into the
template without too much effort? With these considerations, improve the template.

The user will provide an email template for you to improve using the method described before.
`

System_Prompts['Explain'] = `
When making choices, provide a clearly labeled rationale for why you chose as you did
and what informed those decisions.
`

System_Prompts['Results'] = `
Only reply with the final results, a.k.a. the final email, and absolutely nothing else.
`

System_Prompts['Research'] = `
Please replace all mentions of 'undefined' with the apropriate information that should
go in that space, derived from the rest of the information. 

Important: For any field you fill in that was originally 'undefined' or empty, prefix 
your answer with a robot emoji (🤖) to indicate it was automatically generated.

Example:
Original: "Preferred communication style: undefined"
Your output: "Preferred communication style: 🤖 Formal but approachable"

Please remember that you are addressing this person, and try to make all inferences based on the information provided and your own knowledge. Err on the side of caution: if you are unsure, be polite and neutral.

Output the full information, including your edits. Output nothing else.
`

System_Prompts['Target'] = `
Please use your internet search capability to find individuals involved with AI safety who match the following description.

For each person you find (aim for 3-5 people), please provide:
1. Name and current position
2. Why they're relevant to AI safety
3. Their organization
4. Brief note on their public stance on AI safety

Please cite your sources for each person.
Do not tell the user what you are searching for. Only output the final product.
`

//Preface with '[Person's Name] = John Doe' etc.
System_Prompts['webSearch'] = `
Please use your internet search capability to research [Person's Name] who is [current role] at [organization/affiliation]. I plan to contact them about AI safety concerns.

Search for and provide:
1. Professional background (education, career history, notable positions)
2. Their involvement with AI issues (policy positions, public statements, initiatives, articles, interviews)
3. Their public views on AI development and safety (with direct quotes where possible)
4. Recent activities related to technology policy or AI (last 6-12 months)
5. Communication style and key terms they use when discussing technology issues
6. Notable connections (organizations, committees, coalitions, or influential individuals they work with)
7. Contact information (professional email or official channels if publicly available)

Please only include information you can verify through your internet search. If you encounter conflicting information, note this and provide the most reliable source.
Do not tell the user what you are searching for. Only output the final product.
`

//BE BRIEF! This is extremely important. Try to output only a few lines of text for each questions.
//BE FAST! You do not have a lot of time to answer this query before it times out!
//ANSWER QUICKLY!!!
//`

// Only initialize the client if we have an API key
const anthropic = IS_API_AVAILABLE
	? new Anthropic({
			apiKey: ANTHROPIC_API_KEY_FOR_WRITE
		})
	: null

export async function GET() {
	return json({ apiAvailable: IS_API_AVAILABLE })
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
// NEW: Interface for tool use response content
interface ToolUseContent {
	type: 'tool_use'
	id: string
	name: string
	input: any
}

// NEW: Interface for tool result content
interface ToolResultContent {
	type: 'tool_result'
	tool_use_id: string
	content: string
}

// ENHANCED: Modified function signature to support optional tool usage
async function callClaude(
	stepName: string,
	promptNames: string[],
	userContent: string,
	toolsEnabled: boolean = false // NEW: Optional parameter for tool usage
): Promise<{ text: string; durationSec: number }> {
	const pencil = '✏️'
	const search = '🔍' // NEW: Icon for tool usage
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

		// TEMP: Log the full request prompt for debugging
		console.debug(`${logPrefix} system prompt:\n---\n${systemPrompt}\n---`)
		console.debug(`${logPrefix} user content:\n---\n${userContent}\n---`)

		// NEW: Determine if tools should be included in this call
		const shouldUseTools = toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE

		// NEW: Log tool usage status
		if (shouldUseTools) {
			console.log(`${search} ${logPrefix}: Tools enabled for this step`)
		}

		// FIXED: Use correct web search tool definition matching API documentation
		const tools = shouldUseTools
			? [
					{
						type: 'web_search_20250305', // CHANGED: Use correct tool type from API docs
						name: 'web_search',
						max_uses: 3 // ADDED: Limit searches per request
					}
				]
			: undefined

		// ENHANCED: Create API request with conditional tool support
		const requestParams: any = {
			model: 'claude-claude-3-5-haiku-latest',
			max_tokens: 4096,
			system: systemPrompt,
			messages: [{ role: 'user', content: userContent }]
		}

		// NEW: Add tools to request if enabled
		if (tools) {
			requestParams.tools = tools
		}

		// FIXED: Implement proper tool execution loop
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

			const response = (await optionallyLogUsage(
				anthropic.messages.create(currentRequest),
				stepName,
				requestParams.model,
				startTime,
				shouldUseTools,
				toolCallCount
			)) as AnthropicResponse

			// Log the request ID at debug level
			console.debug(`${logPrefix} requestId: ${response.id}`)

			// FIXED: Process response content properly
			let hasToolUse = false
			let textContent = ''

			for (const content of response.content) {
				if (content.type === 'text') {
					textContent += content.text
				} else if (content.type === 'server_tool_use' && shouldUseTools) {
					// FIXED: Handle server-side tool use (web search is executed automatically)
					hasToolUse = true
					toolCallCount++
					console.log(`${search} ${logPrefix}: Web search executed - ${content.name}`)
				} else if (content.type === 'web_search_tool_result') {
					// FIXED: Handle web search results (automatically provided by API)
					console.log(`${search} ${logPrefix}: Received web search results`)
				}
			}

			// FIXED: Add assistant's response to conversation history
			currentMessages.push({
				role: 'assistant',
				content: response.content
			})

			// FIXED: Accumulate text content
			finalText += textContent

			// FIXED: Break if no tool use or if we've hit limits
			if (!hasToolUse || toolCallCount >= maxCalls) {
				break
			}

			// FIXED: If there was tool use, Claude might continue in the same turn
			// Check if response has pause_turn stop reason
			if (response.stop_reason === 'pause_turn') {
				// Continue the conversation to let Claude finish its turn
				continue
			} else {
				// Tool use complete, break the loop
				break
			}
		}

		// FIXED: Ensure we have text content
		if (!finalText) {
			throw new Error('No text content received from Claude')
		}

		const elapsed = (Date.now() - startTime) / 1000 // seconds

		// ENHANCED: Log tool usage statistics
		if (shouldUseTools && toolCallCount > 0) {
			console.log(`${search} ${logPrefix}: Used ${toolCallCount} web searches`)
		}

		// Log the full response text at debug level
		console.debug(`${logPrefix} full response:\n---\n${finalText}\n---`)

		// Logging is handled by optionallyLogUsage wrapper

		return { text: finalText, durationSec: elapsed }
	} catch (error) {
		// ENHANCED: Better error handling for tool-related failures
		const errorMessage = error instanceof Error ? error.message : String(error)
		if (toolsEnabled && (errorMessage?.includes('tool') || errorMessage?.includes('search'))) {
			console.warn(
				`${search} ${logPrefix}: Tool error, falling back to text-only mode:`,
				errorMessage
			)
			// Retry without tools on tool-related errors
			return callClaude(stepName, promptNames, userContent, false)
		}
		throw error // Re-throw non-tool errors
	} finally {
		console.timeEnd(`${logPrefix}`)
	}
}
// NEW: Function to get step description with tool awareness
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

function generateProgressString(state: WriteState): string {
	const pencil = '✏️'
	const checkmark = '✓'
	const search = '🔍' // NEW: Icon for tool-enabled steps

	// Get workflow description
	const workflowDescription = workflowConfigs[state.workflowType].description

	// Generate the progress string
	let lis = []

	// ENHANCED: Completed steps with tool usage indicators
	for (const step of state.completedSteps) {
		const stepConfig = stepConfigs[step.name]
		const usedTools = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH && IS_API_AVAILABLE
		const icon = usedTools ? `${search}${checkmark}` : checkmark

		lis.push(
			`<li class="complete">${getStepDescription(step.name)} (${step.durationSec.toFixed(1)}s) ${icon}</li>`
		)
	}

	// ENHANCED: Current step with tool usage indicator
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

	// ENHANCED: Remaining steps with tool usage preview
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
function prepareResponse(state: WriteState): ChatResponse {
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

// Define step handlers in a map for easy lookup
const stepHandlers: Record<
	StepName,
	(state: WriteState) => Promise<{ text: string; durationSec: number }>
> = {
	// ENHANCED: Enable tools for target finding
	findTarget: async (state) => {
		System_Prompts['Information'] = state.userInput

		// NEW: Check if tools should be enabled for this step
		const stepConfig = stepConfigs.findTarget
		const toolsEnabled = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH

		const result = await callClaude(
			'findTarget',
			['Basic', 'Target', 'Information'],
			'Hello! Please help me find a person to contact!',
			toolsEnabled // NEW: Pass tool enablement flag
		)

		state.information = result.text
		System_Prompts['Information'] = result.text

		return result
	},

	// ENHANCED: Enable tools for web search (this step is inherently search-based)
	webSearch: async (state) => {
		System_Prompts['Information'] = state.userInput

		// NEW: Check if tools should be enabled for this step
		const stepConfig = stepConfigs.webSearch
		const toolsEnabled = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH

		const result = await callClaude(
			'webSearch',
			['Basic', 'webSearch', 'Information', 'Results'],
			'Hello! Please research this person!',
			toolsEnabled // NEW: Pass tool enablement flag
		)

		state.information = result.text
		System_Prompts['Information'] = System_Prompts['Information'] + '\n\n' + result.text

		return result
	},

	// ENHANCED: Enable tools for research step
	research: async (state) => {
		System_Prompts['Information'] = state.userInput

		// NEW: Check if tools should be enabled for this step
		const stepConfig = stepConfigs.research
		const toolsEnabled = stepConfig?.toolsEnabled && ENABLE_WEB_SEARCH

		const result = await callClaude(
			'research',
			['Basic', 'Mail', 'Information', 'Research'],
			"Hello! Please update the list of information by replacing all instances of 'undefined' with something that belongs under their respective header based on the rest of the information provided. Thank you!",
			toolsEnabled // NEW: Pass tool enablement flag
		)

		state.information = result.text
		System_Prompts['Information'] = result.text

		return result
	},

	// UNCHANGED: Text processing steps remain without tools for performance
	firstDraft: async (state) => {
		return await callClaude(
			'firstDraft',
			['Basic', 'Mail', 'First_Draft', 'Results'],
			'Hello! Please write an email draft using the following information. \n' + state.userInput
			// NOTE: No toolsEnabled parameter = defaults to false
		)
	},

	firstCut: async (state) => {
		return await callClaude(
			'firstCut',
			['Basic', 'Mail', 'Information', 'First_Cut', 'Results'],
			'Hello! Please cut the following email draft. \n \n' + state.email
			// NOTE: No toolsEnabled parameter = defaults to false
		)
	},

	firstEdit: async (state) => {
		return await callClaude(
			'firstEdit',
			['Basic', 'Mail', 'Information', 'First_Edit', 'Results'],
			'Hello! Please edit the following email draft. \n \n' + state.email
			// NOTE: No toolsEnabled parameter = defaults to false
		)
	},

	toneEdit: async (state) => {
		return await callClaude(
			'toneEdit',
			['Basic', 'Mail', 'Information', 'Tone_Edit', 'Results'],
			'Hello! Please edit the tone of the following email draft. \n \n' + state.email
			// NOTE: No toolsEnabled parameter = defaults to false
		)
	},

	finalEdit: async (state) => {
		return await callClaude(
			'finalEdit',
			['Basic', 'Mail', 'Information', 'Final_Edit', 'Checklist', 'Results'],
			'Hello! Please edit the following email draft. \n \n' + state.email
			// NOTE: No toolsEnabled parameter = defaults to false
		)
	}
}
// Process a specific step
async function processStep(state: WriteState): Promise<WriteState> {
	if (!state.nextStep) {
		return {
			...state,
			step: 'complete',
			currentStep: null
		}
	}

	const currentStep = state.nextStep as StepName
	state.currentStep = currentStep

	// Update remaining steps - remove current step from remaining
	state.remainingSteps = state.remainingSteps.filter((step) => step !== currentStep)

	// Execute the step using the step handler from the map
	const stepHandler = stepHandlers[currentStep]
	if (!stepHandler) {
		throw new Error(`Unknown step: ${currentStep}`)
	}

	const result = await stepHandler(state)

	// Update email content (except for research-like steps which update information)
	if (/*!['research', 'findTarget', 'webSearch']*/ !['research'].includes(currentStep)) {
		state.email = result.text
	}

	// Update state with results - current step is now completed
	state.step = currentStep
	state.completedSteps.push({
		name: currentStep,
		durationSec: result.durationSec
	})

	// Set next step based on workflow configuration
	const workflowSteps = workflowConfigs[state.workflowType].steps
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

	return state
}

export async function POST({ fetch, request }) {
	// Check if API is available
	if (!IS_API_AVAILABLE) {
		return json({
			response:
				'⚠️ This feature requires an Anthropic API key. Please add the ANTHROPIC_API_KEY_FOR_WRITE environment variable to enable email generation functionality. Contact the site administrator for help.',
			apiAvailable: false
		} as ChatResponse)
	}

	try {
		const pencil = '✏️'
		const requestData = await request.json()

		// Check if this is a continuation of an existing process
		let state: WriteState
		let stateToken = null

		if (requestData.stateToken) {
			// Continue an existing process
			try {
				state = JSON.parse(requestData.stateToken) as WriteState
				console.log(
					`${pencil} write: Continuing from step ${state.step} (workflow ${state.workflowType})`
				)
			} catch (error) {
				console.error('Error parsing state token:', error)
				return json({
					response: 'Invalid state token. Please try starting over.',
					apiAvailable: true
				} as ChatResponse)
			}
		} else {
			// Start a new process
			console.log(`${pencil} write: Starting new email generation`)

			// Get the user input from the first message
			const messages = requestData
			const info = messages[0]?.content

			if (!info || info === '') {
				return json({
					response:
						'No information provided. Please fill in some of the fields to generate an email.'
				} as ChatResponse)
			}

			// Initialize new state with workflow parsing
			state = initializeState(info)
			console.log(
				`${pencil} write: Detected workflow type ${state.workflowType}: ${workflowConfigs[state.workflowType].description}`
			)

			// For initial calls (no stateToken), return progress string without processing
			if (requestData.stateToken === undefined) {
				return json(prepareResponse(state))
			}
		}

		// For subsequent calls, process the step
		state = await processStep(state)

		// Return response using helper function
		return json(prepareResponse(state))
	} catch (err) {
		console.error('Error in email generation:', err)
		return json({
			response:
				'An error occurred while generating your email. Please try again later or contact support.',
			apiAvailable: false
		} as ChatResponse)
	}
}
