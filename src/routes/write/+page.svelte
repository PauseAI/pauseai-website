<script lang="ts">
	import { botName } from '$lib/config'
	import type { ChatResponse } from '../api/write/+server'
	import { onMount } from 'svelte'

	// Define local Message type to include 'progress' role and complete flag
	type Message = {
		role: 'user' | 'assistant' | 'system' | 'progress'
		content: string
		complete?: boolean // Flag to indicate if processing is complete
	}

	// Define field section structure
	interface FieldSection {
		title: string
		subsections: FieldSubsection[]
	}

	interface FieldSubsection {
		title: string
		questions: string[]
	}

	// Use a unique localStorage key to avoid conflicts with other pages
	const STORAGE_KEY = 'email_writer_messages'
	// CLAUDE CHANGE: Added storage key for form data
	const FORM_DATA_STORAGE_KEY = 'email_writer_form_data'
	// UPDATED: Storage key for collapsed sections
	const COLLAPSED_SECTIONS_STORAGE_KEY = 'email_writer_collapsed_sections'

	let messages: Message[] =
		typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') : []

	// Array for form
	let loading = false
	let apiAvailable = true // Default to true, will be updated after first API call
	const maxMessages = 20

	// UPDATED: Simple array-based state management for collapsed sections
	let collapsedSections = {
		form1: [false], // 1 section in Research form
		form2: [false, true, true], // 3 sections in Target form
		form3: [false], // 1 section in Message form
		form4: [true, true, true] // 3 sections in MessageDetails form
	}

	// Organizing the form questions into sections and subsections
	const formSections_Target: FieldSection[] = [
		{
			title: 'Researching a person',
			subsections: [
				{
					title: 'To research a person, fill out the following fields.',
					questions: ["Person's Name", 'Current Role', 'Organization/Affiliation']
				}
			]
		},
		{
			title: 'Personal Context',
			subsections: [
				{
					title: 'Professional Title and Status',
					questions: [
						'Appropriate salutation and level of formality',
						'Understanding their role and potential authority',
						'How they might perceive communication'
					]
				},
				{
					title: 'Prior Interactions/Background',
					questions: [
						'Known positions or statements',
						'Recent actions or achievements relevant to your message'
					]
				},
				{
					title: 'Communication Preferences',
					questions: ['Preferred communication style']
				},
				{
					title: 'Potential Motivations',
					questions: ['What might incentivize them to act', 'Their likely concerns or interests'] /*
					questions: [
						'What might incentivize them to act',
						'Their likely concerns or interests',
						'Potential alignment with your request'
					]*/
				}
			]
		},
		{
			title: 'Psychological Considerations',
			subsections: [
				{
					title: 'Emotional Landscape',
					questions: [
						'Potential receptiveness to your message',
						'Avoiding triggers that might create resistance'
					] /*
					questions: [
						'Current potential mood or state of mind',
						'Potential receptiveness to your message',
						'Avoiding triggers that might create resistance'
					]*/
				},
				{
					title: 'Perspective Alignment',
					questions: [
						'Shared values or goals',
						'Ways to frame your message to resonate with them',
						'Avoiding controversial or dismissive language'
					]
				}
			]
		}
	]

	// Flatten the questions array for accessing by index
	const paragraphText_Target: string[] = []
	formSections_Target.forEach((section) => {
		section.subsections.forEach((subsection) => {
			subsection.questions.forEach((question) => {
				paragraphText_Target.push(question)
			})
		})
	})

	const formSections_Research: FieldSection[] = [
		{
			title: 'Finding a target',
			subsections: [
				{
					title: "Specify what sort of target you're looking for, and where.",
					questions: [
						'If you have certain institutions in mind, mention those. Otherwise, your local representative could be a good place to start.'
					]
				}
			]
		}
	]

	// Flatten the questions array for accessing by index
	const paragraphText_Research: string[] = []
	formSections_Research.forEach((section) => {
		section.subsections.forEach((subsection) => {
			subsection.questions.forEach((question) => {
				paragraphText_Research.push(question)
			})
		})
	})

	const formSections_MessageDetails: FieldSection[] = [
		{
			title: 'Message Details',
			subsections: [
				{
					title: 'Logical Structure',
					questions: [
						'Chronological flow',
						'Cause-and-effect relationships',
						'Anticipated questions or objections'
					]
				}
			]
		},
		{
			title: 'Practical Elements',
			subsections: [
				{
					title: 'Timeframe',
					questions: ['Urgency of the request', 'Specific deadlines'] /*
					questions: [
						'Urgency of the request',
						'Specific deadlines',
						'Expected timeline for response or action'
					]*/
				},
				{
					title: 'Supplementary Information',
					questions: ['Attachments needed', 'Links to additional resources']
					//questions: ['Attachments needed', 'Links to additional resources', 'Reference materials']
				}
			]
		},
		{
			title: 'Communication Strategy',
			subsections: [
				{
					title: 'Tone Calibration',
					questions: [
						"Matching recipient's communication style",
						'Balancing professionalism and approachability'
					]
				},
				{
					title: 'Persuasion Techniques',
					questions: [
						'Highlighting benefits',
						'Creating a sense of urgency',
						'Making the action feel achievable'
					]
				}
			]
		}
	]

	// CLAUDE CHANGE: Fixed the population of paragraphText_MessageDetails - was incorrectly using formSections_Research
	const paragraphText_MessageDetails: string[] = []
	formSections_MessageDetails.forEach((section) => {
		section.subsections.forEach((subsection) => {
			subsection.questions.forEach((question) => {
				paragraphText_MessageDetails.push(question)
			})
		})
	})

	const formSections_Message: FieldSection[] = [
		{
			title: 'What is your Message?',
			subsections: [
				{
					title: 'Content Requirements',
					questions: ['Specific outcome desired', 'Concrete action requested'] /*
					questions: [
						'Clear, singular objective',
						'Specific outcome desired',
						'Concrete action requested'
					]*/
				},
				{
					title: 'Supporting Evidence',
					questions: [
						'Relevant facts',
						'Context for the request',
						'Potential impact or consequences'
					]
				}
			]
		}
	]

	// Flatten the questions array for accessing by index
	const paragraphText_Message: string[] = []
	formSections_Message.forEach((section) => {
		section.subsections.forEach((subsection) => {
			subsection.questions.forEach((question) => {
				paragraphText_Message.push(question)
			})
		})
	})

	// UPDATED: Simplified section management functions
	function toggleSection(formId: 'form1' | 'form2' | 'form3' | 'form4', sectionIndex: number) {
		collapsedSections[formId][sectionIndex] = !collapsedSections[formId][sectionIndex]
		collapsedSections = collapsedSections // Trigger reactivity
		saveCollapsedState()
	}

	function saveCollapsedState() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(COLLAPSED_SECTIONS_STORAGE_KEY, JSON.stringify(collapsedSections))
		}
	}

	function loadCollapsedState() {
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(COLLAPSED_SECTIONS_STORAGE_KEY)
			if (saved) {
				collapsedSections = JSON.parse(saved)
			} else {
				// Reset to default if no saved state
				collapsedSections = {
					form1: [false],
					form2: [false, true, true],
					form3: [false],
					form4: [true, true, true]
				}
			}
		} else {
			collapsedSections = {
				form1: [false],
				form2: [false, true, true],
				form3: [false],
				form4: [true, true, true]
			}
		}
	}

	// CLAUDE CHANGE: Added mapping functions to get correct arrays based on active form
	function getCurrentInputArray(): string[] {
		switch (activeForm) {
			case 'form1':
				return form1_input_arr
			case 'form2':
				return form2_input_arr
			case 'form3':
				return form3_input_arr
			case 'form4':
				return form4_input_arr
			case 'form5':
				return form2_input_arr.concat(form3_input_arr, form4_input_arr)
			default:
				return form2_input_arr
		}
	}

	function getCurrentQuestionArray(): string[] {
		switch (activeForm) {
			case 'form1':
				return paragraphText_Research
			case 'form2':
				return paragraphText_Target
			case 'form3':
				return paragraphText_Message
			case 'form4':
				return paragraphText_MessageDetails
			case 'form5':
				let allText = paragraphText_Target.concat(
					paragraphText_Message,
					paragraphText_MessageDetails
				)
				return allText
			default:
				return paragraphText_Target
		}
	}

	function clear_arr(arr: string[]) {
		for (var i in arr) {
			arr[i] = ''
		}
	}

	// CLAUDE CHANGE: Updated clear function to clear current form and reset to form1
	function clear() {
		messages = []
		localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))

		// Clear all form arrays
		clear_arr(form1_input_arr)
		clear_arr(form2_input_arr)
		clear_arr(form3_input_arr)
		clear_arr(form4_input_arr)

		// Clear form data from localStorage
		localStorage.removeItem(FORM_DATA_STORAGE_KEY)
		// UPDATED: Reset collapsed sections to default state
		localStorage.removeItem(COLLAPSED_SECTIONS_STORAGE_KEY)
		collapsedSections = {
			form1: [false],
			form2: [false, true, true],
			form3: [false],
			form4: [true, true, true]
		}

		// Force Svelte to detect the changes
		form1_input_arr = form1_input_arr
		form2_input_arr = form2_input_arr
		form3_input_arr = form3_input_arr
		form4_input_arr = form4_input_arr
	}

	function copy() {
		const role = (message: Message) => (message.role === 'user' ? 'You' : 'Writer')
		const text = messages.map((message) => `${role(message)}:\n${message.content}`).join('\n\n')
		navigator.clipboard.writeText(text)
		window.alert(
			"Copied to clipboard\n\nDisclaimer: Check all text content carefully before sending anything!\n\nYou are the one sending the email and expressing an opinion. You've simply had some assistance in writing it."
		)
	}

	// CLAUDE CHANGE: Updated runTest to work with currently active form and provide appropriate test data
	function runTest() {
		// Clear any existing chat
		clear()

		// Get current form arrays
		const currentInputArray = getCurrentInputArray()
		const currentQuestionArray = getCurrentQuestionArray()

		// Clear current input fields
		clear_arr(currentInputArray)

		// Provide test data based on active form
		switch (activeForm) {
			case 'form1':
				// Test data for research form
				if (currentInputArray.length > 0) {
					currentInputArray[0] =
						'Local city council member or school board representative who handles education policy and child safety issues. Location: California, Los Angeles.'
				}
				break

			case 'form2':
				// Test data for target/personal context form
				const roleAuthorityIndex = currentQuestionArray.findIndex(
					(q) => q === 'Understanding their role and potential authority'
				)
				if (roleAuthorityIndex >= 0) {
					currentInputArray[roleAuthorityIndex] =
						'You are writing for a local government official with decision-making authority over education and safety policies.'
				}
				break

			case 'form3':
				// Test data for message form
				const objectiveIndex = currentQuestionArray.findIndex(
					(q) => q === 'Concrete action requested'
				)
				const outcomeIndex = currentQuestionArray.findIndex((q) => q === 'Specific outcome desired')

				if (objectiveIndex >= 0) {
					currentInputArray[objectiveIndex] =
						'Official takes action to ensure AI safety education and policies are implemented in local institutions.'
				}
				if (outcomeIndex >= 0) {
					currentInputArray[outcomeIndex] =
						'Local community becomes informed about AI risks and appropriate safety measures are put in place.'
				}
				break

			case 'form4':
				// Test data for message details form
				const urgencyIndex = currentQuestionArray.findIndex((q) => q === 'Urgency of the request')
				const toneIndex = currentQuestionArray.findIndex(
					(q) => q === 'Balancing professionalism and approachability'
				)

				if (urgencyIndex >= 0) {
					currentInputArray[urgencyIndex] =
						'High urgency due to rapidly advancing AI development timeline.'
				}
				if (toneIndex >= 0) {
					currentInputArray[toneIndex] =
						'Professional but accessible tone that conveys seriousness without being alarmist.'
				}
				break
		}

		sendMessage()
	}

	// CLAUDE CHANGE: Updated sendMessage to work with currently active form only
	async function sendMessage() {
		const currentInputArray = getCurrentInputArray()
		const currentQuestionArray = getCurrentQuestionArray()

		let input = ''
		switch (activeForm) {
			case 'form1':
				input = input + '[1]'
				break

			case 'form2':
				input = input + '[2]'
				break

			case 'form4':
				input = input + '[3]'
				break

			case 'form5':
				input = input + '[4]'
				break
		}
		for (let i = 0; i < currentQuestionArray.length; i++) {
			input =
				input + currentQuestionArray[i] + ':\n' + (currentInputArray[i] || 'undefined') + '\n\n'
		}

		messages = [...messages, { content: input, role: 'user' }]

		// Clear current form fields
		clear_arr(currentInputArray)
		loading = true
		console.log(input)

		try {
			// First request - get initial progress message (no stateToken)
			const initialResponse = await fetch('api/write', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify([{ content: input, role: 'user' }])
			})

			const initialData = await initialResponse.json()

			// Add server-generated progress message with complete flag
			messages = [
				...messages,
				{
					content: initialData.progressString,
					role: 'progress',
					complete: initialData.complete // Track completion status
				}
			]

			// Scroll to progress message
			setTimeout(() => {
				const progressMessage = document.querySelector('.message.progress')
				if (progressMessage) {
					progressMessage.scrollIntoView({ behavior: 'smooth', block: 'center' })
				}
			}, 100)

			// Continue with the normal process, but pass the stateToken
			await processSteps(null, initialData.stateToken)
		} catch (error) {
			console.error('Error calling email API:', error)
			messages = [
				...messages,
				{
					content:
						'Sorry, there was an error generating your email. Please try again later or contact support.',
					role: 'assistant'
				}
			]
		} finally {
			loading = false
		}
	}

	async function processSteps(inputMessages: Message[] | null, stateToken = null) {
		// Set loading indicator
		loading = true

		try {
			// Prepare the request body
			const requestBody = stateToken ? { stateToken } : inputMessages

			// Make the API call
			const response = await fetch('api/write', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			})

			// Process the response
			const data = await response.json()
			console.log('DATA: \n' + data)
			console.log(data.information)

			// Update API availability
			apiAvailable = data.apiAvailable !== false

			// Show progress if available
			if (data.progressString) {
				// Find existing progress message or create one
				const progressIndex = messages.findIndex((m) => m.role === 'progress')
				if (progressIndex >= 0) {
					// Update existing progress message
					messages[progressIndex].content = data.progressString
					messages[progressIndex].complete = data.complete // Update complete flag
				} else {
					// Add new progress message
					messages = [
						...messages,
						{
							content: data.progressString,
							role: 'progress',
							complete: data.complete // Add complete flag
						}
					]
				}
			}

			// Update the UI with the current state of the email
			if (data.response) {
				// Find existing assistant message or create one
				const assistantIndex = messages.findIndex((m) => m.role === 'assistant')
				if (assistantIndex >= 0) {
					// Update existing assistant message
					messages[assistantIndex].content = data.response
				} else {
					// Add new assistant message
					messages = [{ content: data.response, role: 'assistant' }, ...messages]
				}
			}

			// CLAUDE CHANGE: Updated auto-fill logic to work with currently active form
			if (data.information) {
				const currentInputArray = getCurrentInputArray()
				const currentQuestionArray = getCurrentQuestionArray()

				// Parse the information string to extract field values
				const lines = data.information.split('\n')
				let currentField = -1

				for (let line of lines) {
					// Look for field headers matching our current question array
					const fieldIndex = currentQuestionArray.findIndex((text) =>
						line.trim().startsWith(text + ':')
					)

					if (fieldIndex >= 0) {
						currentField = fieldIndex
					} else if (currentField >= 0 && line.trim()) {
						// Only update when there's actual content and the field is empty
						const lineContent = line.trim()
						if (
							lineContent &&
							(!currentInputArray[currentField] || currentInputArray[currentField] === '')
						) {
							currentInputArray[currentField] = lineContent
						}
					}
				}
			}

			// Save messages to localStorage
			localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
			// CLAUDE CHANGE: Also save form data
			saveFormData()

			// If not complete, continue with the next step
			if (!data.complete && data.stateToken) {
				// Short delay to allow UI to update
				await new Promise((resolve) => setTimeout(resolve, 100))

				// Process the next step
				await processSteps(null, data.stateToken)
			} else {
				// Process is complete, update UI
				loading = false
			}
		} catch (error) {
			console.error('Error in step processing:', error)
			loading = false
			throw error
		}
	}

	// CLAUDE CHANGE: Added form data persistence functions
	function saveFormData() {
		const formData = {
			form1_input_arr,
			form2_input_arr,
			form3_input_arr,
			form4_input_arr,
			activeForm
		}
		localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData))
	}

	function loadFormData() {
		const saved = localStorage.getItem(FORM_DATA_STORAGE_KEY)
		if (saved) {
			const formData = JSON.parse(saved)
			form1_input_arr = formData.form1_input_arr || new Array<string>(paragraphText_Research.length)
			form2_input_arr = formData.form2_input_arr || new Array<string>(paragraphText_Target.length)
			form3_input_arr = formData.form3_input_arr || new Array<string>(paragraphText_Message.length)
			form4_input_arr =
				formData.form4_input_arr || new Array<string>(paragraphText_MessageDetails.length)
			activeForm = formData.activeForm || 'form1'
		}
	}

	onMount(async () => {
		// CLAUDE CHANGE: Load form data on mount
		loadFormData()
		// UPDATED: Load collapsed state on mount
		loadCollapsedState()

		// Check API availability on component mount
		try {
			const response = await fetch('api/write')
			const data = await response.json()
			apiAvailable = !!data.apiAvailable
		} catch (error) {
			console.error('Error checking API availability:', error)
			apiAvailable = false
		}
	})

	function handleKeyDown(event: KeyboardEvent) {
		/*
		if (event.key === 'Enter') {
			event.preventDefault()
			sendMessage()
			clear_arr(input_arr);
		}
		*/
	}

	// FORM FUNCTIONS //

	// Add these variables for form toggling
	let activeForm = 'form1' // Default active form

	// CLAUDE CHANGE: Updated setActiveForm to save form data when switching
	function setActiveForm(formId: string) {
		saveFormData() // Save current state before switching
		activeForm = formId
		saveFormData() // Save current state after switching to save activeForm
		console.log(formId)
	}

	function writeMail() {
		setActiveForm('form5')
		sendMessage()
	}

	// UNTESTED AND GENERATED BY AI
	// Create separate arrays for each form's inputs
	//let input_arr = Array(formSections_Target.flatMap(s => s.subsections.flatMap(ss => ss.questions)).length).fill('');
	// CLAUDE CHANGE: Fixed form array initialization to use correct lengths
	let form1_input_arr = Array(paragraphText_Research.length).fill('')
	let form2_input_arr = Array(paragraphText_Target.length).fill('')
	let form3_input_arr = Array(paragraphText_Message.length).fill('')
	let form4_input_arr = Array(paragraphText_MessageDetails.length).fill('')

	// Top of the page
	const title = `Write Email Content`
	const description = `This (beta!) webpage lets you write email content (with LLM assistance.)`
	const warning = `This feature is currently in beta testing. It is accessible, but the URL isn't advertised. Pause AI folk testing, contact the software team on Discord to report issues.`
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="robots" content="noindex, nofollow" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
</svelte:head>

<main>
	<div class="header-section">
		<h1>{title}</h1>
		<div class="warning-box">
			<p class="warning">{warning}</p>
			{#if !apiAvailable}
				<p class="warning error">
					⚠️ API key not available. This feature is currently disabled. Please contact the site
					administrator.
				</p>
			{/if}
		</div>
		<p>
			Answer questions / fill fields after researching your target. Undefined fields will be
			auto-filled. Check the generated email content carefully, as we're bound to make some
			mistakes!
		</p>
		<p class="notes">
			You can switch tabs by click on any of the top 4 buttons. This will show new fields: you can
			switch back and forth at any time, inputs are saved! If you clicked on "Autofill" and nothing
			happened, switch back and forth to refresh the content. The button is grayed out when
			unavailable.
		</p>
		<p class="notes">
			First, fill in the topmost prompts. You can then ask to autofill content. The AI assistant
			will auto-fill any fields you didn't define, based on the ones you did. The UX for this part
			is still rough as this feature isn't universally available, so please give us feedback!
		</p>
		<p class="notes">
			To generate the entire email, click the "Write Mail" button. This will take from all input
			fields and empty them!
		</p>

		<!-- Form toggle bar -->
		<div class="control-buttons">
			<button
				class="button {activeForm === 'form1' ? 'active' : ''}"
				on:click={() => setActiveForm('form1')}
			>
				Finding A Target
			</button>
			<button
				class="button {activeForm === 'form2' ? 'active' : ''}"
				on:click={() => setActiveForm('form2')}
			>
				Personal Context
			</button>
			<button
				class="button {activeForm === 'form3' ? 'active' : ''}"
				on:click={() => setActiveForm('form3')}
			>
				The Message
			</button>
			<button
				class="button {activeForm === 'form4' ? 'active' : ''}"
				on:click={() => setActiveForm('form4')}
			>
				Message details
			</button>
		</div>

		<div class="control-buttons">
			<button
				on:click={sendMessage}
				disabled={!apiAvailable || loading || activeForm === 'form3'}
				class="button {!apiAvailable ? 'button--disabled' : ''}"
			>
				AI Help (Research / Autofill)
			</button>
			<button on:click={copy} class="button" disabled={!apiAvailable || loading}>
				Copy Content
			</button>
			<button on:click={clear} class="button" disabled={loading}> Reset All </button>
			<button
				on:click={writeMail}
				disabled={!apiAvailable || loading}
				class="button {!apiAvailable ? 'button--disabled' : ''}"
			>
				Write Mail
			</button>
		</div>
	</div>

	{#each messages as { role, content, complete }, i}
		{#if role === 'progress'}
			<div class="message progress {complete ? 'completed' : ''}">
				<p>{@html content}</p>
			</div>
		{:else if role === 'assistant'}
			<div class="message {role}">
				<p>{@html content}</p>
			</div>
		{/if}
	{/each}
</main>

<hr />

<p>Here is the grab bag of input fields...</p>

<footer>
	{#if messages.length > maxMessages}
		<p>You reached the maximum amount of messages, you can either copy or reset</p>
		<button class="button" on:click={copy}>Copy Content</button>
		<button class="button" on:click={clear}>Reset All</button>
	{:else}
		<!-- Form container with conditional display based on active form -->
		<!-- UPDATED: Modified the form container section to show forms with array-based collapsible sections -->
		<div class="form-container">
			<!-- Form 1 - Research -->
			{#if activeForm === 'form1'}
				<form on:submit|preventDefault>
					{#each formSections_Research as section, sectionIndex}
						<div class="section-container">
							<button
								class="section-header"
								type="button"
								on:click={() => toggleSection('form1', sectionIndex)}
								aria-expanded={!collapsedSections.form1[sectionIndex]}
								aria-controls="section-{sectionIndex}-content"
							>
								<h1>{section.title}</h1>
								<span
									class="chevron {collapsedSections.form1[sectionIndex] ? 'collapsed' : 'expanded'}"
								>
									▼
								</span>
							</button>
							{#if !collapsedSections.form1[sectionIndex]}
								<div class="section-content" id="section-{sectionIndex}-content">
									{#each section.subsections as subsection, subsectionIndex}
										<h2>{subsection.title}</h2>

										{#each subsection.questions as question, questionIndex}
											{@const globalIndex = paragraphText_Research.findIndex(
												(text) => text === question
											)}

											<p>{question}</p>
											<textarea
												placeholder="Type here"
												bind:value={form1_input_arr[globalIndex]}
												on:keydown={handleKeyDown}
											></textarea>
										{/each}
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</form>
			{/if}

			<!-- Form 2 - Personal Context -->
			{#if activeForm === 'form2'}
				<form on:submit|preventDefault>
					{#each formSections_Target as section, sectionIndex}
						<div class="section-container">
							<button
								class="section-header"
								type="button"
								on:click={() => toggleSection('form2', sectionIndex)}
								aria-expanded={!collapsedSections.form2[sectionIndex]}
								aria-controls="section-{sectionIndex}-content"
							>
								<h1>{section.title}</h1>
								<span
									class="chevron {collapsedSections.form2[sectionIndex] ? 'collapsed' : 'expanded'}"
								>
									▼
								</span>
							</button>
							{#if !collapsedSections.form2[sectionIndex]}
								<div class="section-content" id="section-{sectionIndex}-content">
									{#each section.subsections as subsection, subsectionIndex}
										<h2>{subsection.title}</h2>

										<!-- Special handling for 'Content Requirements' to add an h3 for 'Precise Purpose' -->
										{#if subsection.title === 'Content Requirements'}
											<h3>Precise Purpose</h3>
										{/if}

										{#each subsection.questions as question, questionIndex}
											<!-- Calculate the global index for this question -->
											{@const globalIndex = paragraphText_Target.findIndex(
												(text) => text === question
											)}

											<!-- Add special h3 headers for specific subsections -->
											{#if subsection.title === 'Supporting Evidence' && questionIndex === 0}
												<h3>Supporting Evidence</h3>
											{:else if subsection.title === 'Logical Structure' && questionIndex === 0}
												<h3>Logical Structure</h3>
											{/if}

											<p>{question}</p>
											<textarea
												placeholder="Type here"
												bind:value={form2_input_arr[globalIndex]}
												on:keydown={handleKeyDown}
											></textarea>
										{/each}
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</form>
			{/if}

			<!-- Form 3 - The Message -->
			{#if activeForm === 'form3'}
				<form on:submit|preventDefault>
					{#each formSections_Message as section, sectionIndex}
						<div class="section-container">
							<button
								class="section-header"
								type="button"
								on:click={() => toggleSection('form3', sectionIndex)}
								aria-expanded={!collapsedSections.form3[sectionIndex]}
								aria-controls="section-{sectionIndex}-content"
							>
								<h1>{section.title}</h1>
								<span
									class="chevron {collapsedSections.form3[sectionIndex] ? 'collapsed' : 'expanded'}"
								>
									▼
								</span>
							</button>
							{#if !collapsedSections.form3[sectionIndex]}
								<div class="section-content" id="section-{sectionIndex}-content">
									{#each section.subsections as subsection, subsectionIndex}
										<h2>{subsection.title}</h2>

										{#each subsection.questions as question, questionIndex}
											{@const globalIndex = paragraphText_Message.findIndex(
												(text) => text === question
											)}

											<p>{question}</p>
											<textarea
												placeholder="Type here"
												bind:value={form3_input_arr[globalIndex]}
												on:keydown={handleKeyDown}
											></textarea>
										{/each}
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</form>
			{/if}

			<!-- Form 4 - Message Details -->
			{#if activeForm === 'form4'}
				<form on:submit|preventDefault>
					{#each formSections_MessageDetails as section, sectionIndex}
						<div class="section-container">
							<button
								class="section-header"
								type="button"
								on:click={() => toggleSection('form4', sectionIndex)}
								aria-expanded={!collapsedSections.form4[sectionIndex]}
								aria-controls="section-{sectionIndex}-content"
							>
								<h1>{section.title}</h1>
								<span
									class="chevron {collapsedSections.form4[sectionIndex] ? 'collapsed' : 'expanded'}"
								>
									▼
								</span>
							</button>
							{#if !collapsedSections.form4[sectionIndex]}
								<div class="section-content" id="section-{sectionIndex}-content">
									{#each section.subsections as subsection, subsectionIndex}
										<h2>{subsection.title}</h2>

										{#each subsection.questions as question, questionIndex}
											{@const globalIndex = paragraphText_MessageDetails.findIndex(
												(text) => text === question
											)}

											<p>{question}</p>
											<textarea
												placeholder="Type here"
												bind:value={form4_input_arr[globalIndex]}
												on:keydown={handleKeyDown}
											></textarea>
										{/each}
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</form>
			{/if}
		</div>
	{/if}
</footer>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		max-width: 100%;
	}

	.header-section {
		border-bottom: 1px solid var(--text-subtle);
	}

	.header-section h1 {
		margin-top: 0;
		margin-bottom: 1rem;
		font-size: 2rem;
	}

	.header-section .notes {
		font-size: 0.7rem;
	}

	.warning-box {
		margin: 0.5rem 0;
		padding: 0.75rem 1.25rem;
		background-color: #fff3cd;
		border: 1px solid #ffeeba;
		border-radius: 0.25rem;
	}

	.warning {
		color: #856404;
		margin: 0.5rem 0;
	}

	.warning.error {
		color: #721c24;
		background-color: #f8d7da;
		border-color: #f5c6cb;
	}

	.top-buttons {
		display: flex;
		gap: 1rem;
		margin-top: 1.5rem;
		align-items: center;
	}

	.button--disabled,
	button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none; /* Prevents hover effects */
		background-color: #cccccc !important; /* Override other background colors */
		color: #666666 !important; /* Darker text */
		border: 1px solid #999999;
	}

	form {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 100%;
	}

	textarea {
		width: 100%;
		height: 100px;
		border: solid 1px var(--text);
		border-radius: 10px;
		padding: 10px;
		font-size: var(--font-size);
		box-sizing: border-box;
		font-family: var(--font-body);
		max-width: 100%;
	}

	.control-buttons {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin: 0.5rem 0;
		flex-wrap: wrap;
	}

	/* Common button styles across all buttons */
	button {
		background-color: var(--brand);
		color: var(--bg);
		border: none;
		border-radius: 10px;
		padding: 10px;
		font-size: var(--font-size);
		font-family: var(--font-body);
		cursor: pointer;
		display: flex;
		align-self: flex-end;
		font-weight: bold;
		transition: background-color 0.2s ease;
	}

	button:hover {
		background-color: var(--brand-subtle);
	}

	button.button.active {
		background-color: var(--brand-subtle);
	}

	/* UPDATED: Collapsible section styles */
	.section-container {
		margin-bottom: 1rem;
		border: 1px solid var(--text-subtle);
		border-radius: 8px;
		overflow: hidden;
	}

	.section-header {
		width: 100%;
		background-color: var(--bg-subtle);
		border: none;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-weight: normal;
	}

	.section-header:hover {
		background-color: var(--brand-subtle);
		color: var(--bg);
	}

	.section-header h1 {
		margin: 0;
		font-size: 1.5rem;
		font-weight: bold;
	}

	.chevron {
		font-size: 1.2rem;
		transition: transform 0.3s ease;
		user-select: none;
	}

	.chevron.collapsed {
		transform: rotate(-90deg);
	}

	.chevron.expanded {
		transform: rotate(0deg);
	}

	.section-content {
		padding: 1rem;
		border-top: 1px solid var(--text-subtle);
		animation: expandSection 0.3s ease-out;
	}

	@keyframes expandSection {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 1000px;
		}
	}

	.message {
		display: flex;
		border-radius: 10px;
		border: solid 1px var(--text);
		justify-content: flex-start;
		white-space: pre-wrap;
		max-width: 100%;
	}

	.message p {
		margin: 0;
	}

	.user {
		flex-direction: row-reverse;
		justify-content: flex-end;
		margin-left: auto;
	}

	.assistant {
		border-color: var(--brand);
		flex-direction: row;
		justify-content: flex-start;
		margin-right: auto;
		width: 100%;
		max-width: 100%;
		height: 300px; /* Approximately 10 lines */
		overflow-y: auto;
	}

	.assistant p {
		padding: 10px;
		border-radius: 10px;
		/* Remove margin to prevent layout issues with fixed height */
		margin: 0;
		/* Allow the paragraph to expand within the container */
		height: auto;
		overflow-wrap: break-word;
	}

	:global(.progress) {
		border-color: var(--text-subtle);
		background-color: var(--bg-subtle);
		color: var(--text);
		width: 100%;
		margin: 0.5rem 0;
		padding: 0.5rem 1rem;
		text-align: left;
		font-family: monospace;
		/* Add the loading animation while in progress */
		background-image: linear-gradient(90deg, var(--bg) 0%, var(--bg-subtle) 50%, var(--bg) 100%);
		background-size: 200% 100%;
		animation: loading 3s linear infinite;
	}

	:global(.progress ul) {
		margin: 0.5rem 0;
		padding-left: 1.5rem;
		list-style-type: square;
	}

	:global(.progress li) {
		margin: 0.25rem 0;
		position: relative;
	}

	:global(.progress li.current) {
		font-weight: bold;
	}

	:global(.progress li.pending) {
		font-style: italic;
	}

	:global(.progress strong) {
		display: block;
		margin-bottom: 0.5rem;
		font-size: 1.5em;
		font-weight: bold;
		text-align: center;
	}

	/* Only apply completed style when the 'Done' text is present */
	.progress.completed {
		animation: none;
		background-image: none;
		background-color: #c0ffc0; /* Light green background */
		border-color: #c3e6cb;
		color: #155724;
	}

	.loading {
		/* message loading bg animated */
		background-image: linear-gradient(90deg, var(--bg) 0%, var(--bg-subtle) 50%, var(--bg) 100%);
		background-size: 200% 100%;
		animation: loading 3s linear infinite;
	}

	@keyframes loading {
		0% {
			background-position: 100% 0;
		}
		100% {
			background-position: -100% 0;
		}
	}

	.message p {
		padding: 10px;
		border-radius: 10px;
	}
</style>
