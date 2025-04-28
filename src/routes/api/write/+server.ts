import { error, json } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import Anthropic from '@anthropic-ai/sdk'

// Safely access the API key, will be undefined if not set
const ANTHROPIC_API_KEY_FOR_WRITE = env.ANTHROPIC_API_KEY_FOR_WRITE || undefined

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
	| 'begin'
	| 'research'
	| 'firstDraft'
	| 'firstCut'
	| 'firstEdit'
	| 'toneEdit'
	| 'finalEdit'

// Server-side state management interface (not exposed to client)
interface WriteState {
	step: StepName | 'complete' | 'start' // Current/completed step
	userInput: string // Original input from form
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

Output the full information, including your edits. Output nothing else.
`

// Only initialize the client if we have an API key
const anthropic = IS_API_AVAILABLE
	? new Anthropic({
			apiKey: ANTHROPIC_API_KEY_FOR_WRITE
		})
	: null

export async function GET() {
	return json({ apiAvailable: IS_API_AVAILABLE })
}

// Helper function to call Claude API with timing
async function callClaude(
	stepName: string,
	promptNames: string[],
	userContent: string
): Promise<{ text: string; durationSec: number }> {
	const pencil = '✏️'
	const logPrefix = `${pencil} write:${stepName}`
	const startTime = Date.now()

	console.time(`${logPrefix}`)

	try {
		// Combine all the specified prompts
		const systemPrompt = promptNames.map((name) => System_Prompts[name]).join('')

		const response = await anthropic.messages.create({
			model: 'claude-3-7-sonnet-20250219',
			max_tokens: 4096, // Increased to handle all fields
			system: systemPrompt,
			messages: [{ role: 'user', content: userContent }]
		})

		// Log the request ID at debug level
		console.debug(`${logPrefix} requestId: ${response.id}`)

		const result = response.content[0].text
		const elapsed = (Date.now() - startTime) / 1000 // seconds

		// Log the full response text at debug level
		console.debug(`${logPrefix} full response:\n---\n${result}\n---`)
		return { text: result, durationSec: elapsed }
	} finally {
		console.timeEnd(`${logPrefix}`)
	}
}

// Define user-friendly step descriptions
const stepDescriptions: Record<StepName, string> = {
	begin: 'Setup',
	research: 'Auto-fill missing user inputs',
	firstDraft: 'Create initial draft',
	firstCut: 'Remove unnecessary content',
	firstEdit: 'Improve text flow',
	toneEdit: 'Adjust tone and style',
	finalEdit: 'Final polish'
}

// Function to generate a progress string from the state
function generateProgressString(state: WriteState): string {
	const pencil = '✏️'
	const checkmark = '✓'

	// Generate the progress string
	let lis = []

	// Completed steps - use descriptions instead of raw step names
	for (const step of state.completedSteps) {
		lis.push(
			`<li class="complete">${stepDescriptions[step.name]} (${step.durationSec.toFixed(1)}s) ${checkmark}</li>`
		)
	}

	// Current step - only add if not already completed and state isn't complete
	if (
		state.currentStep &&
		state.step !== 'complete' &&
		!state.completedSteps.some((s) => s.name === state.currentStep)
	) {
		lis.push(`<li class="current">${stepDescriptions[state.currentStep]} ${pencil}</li>`)
	}

	// Remaining steps - filter out any that are in completed steps or current step
	const completedAndCurrentSteps = [...state.completedSteps.map((s) => s.name), state.currentStep]
	const filteredRemainingSteps = state.remainingSteps.filter(
		(step) => !completedAndCurrentSteps.includes(step)
	)
	lis = lis.concat(
		filteredRemainingSteps.map((step) => `<li class="pending">${stepDescriptions[step]}</li>`)
	)

	const listItems = lis.join('')
	const totalTime = state.completedSteps.reduce((sum, step) => sum + step.durationSec, 0)

	if (state.nextStep === null) {
		// Process is complete
		return `<strong>Done (${totalTime.toFixed(1)}s):</strong><ul>${listItems}</ul>`
	} else {
		return `<strong>Progress:</strong><ul>${listItems}</ul>`
	}
}

// Initialize a new state for the step-by-step process
function initializeState(userInput: string): WriteState {
	const allSteps: StepName[] = [
		'research',
		'firstDraft',
		'firstCut',
		'firstEdit',
		'toneEdit',
		'finalEdit'
	]

	return {
		step: 'start',
		userInput,
		email: '',
		completedSteps: [],
		currentStep: 'research', // First step
		remainingSteps: allSteps.slice(1), // All steps except research (which is current)
		nextStep: 'research'
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
	research: async (state) => {
		System_Prompts['Information'] = state.userInput

		const result = await callClaude(
			'research',
			['Basic', 'Mail', 'Information', 'Research'],
			"Hello! Please update the list of information by replacing all instances of 'undefined' with something that belongs under their respective header based on the rest of the information provided. Thank you!"
		)

		state.information = result.text
		System_Prompts['Information'] = result.text

		return result
	},

	firstDraft: async (state) => {
		return await callClaude(
			'firstDraft',
			['Basic', 'Mail', 'First_Draft', 'Results'],
			'Hello! Please write an email draft using the following information. \n' + state.information
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

	// Update email content (except for research step which updates information)
	if (currentStep !== 'research') {
		state.email = result.text
	}

	// Update state with results - current step is now completed
	state.step = currentStep
	state.completedSteps.push({
		name: currentStep,
		durationSec: result.durationSec
	})

	// Set next step
	const allSteps: StepName[] = [
		'research',
		'firstDraft',
		'firstCut',
		'firstEdit',
		'toneEdit',
		'finalEdit'
	]
	const currentIndex = allSteps.indexOf(currentStep)

	if (currentIndex !== -1 && currentIndex < allSteps.length - 1) {
		state.nextStep = allSteps[currentIndex + 1]
		state.currentStep = allSteps[currentIndex + 1]
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
				console.log(`${pencil} write: Continuing from step ${state.step}`)
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

			// Initialize new state
			state = initializeState(info)

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
