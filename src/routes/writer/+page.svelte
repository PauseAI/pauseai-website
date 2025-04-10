<!-- FILEPATH: /Users/joep/dev/github/joepio/pauseai/src/routes/writer/+page.svelte -->
<script lang="ts">
	import { botName } from '$lib/config'
	import type { ChatResponse, Message } from '../api/writer/+server'
	import { onMount } from 'svelte'

	let messages: Message[] =
		typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('messages') || '[]') : []

	// Array for form
	let input_arr = new Array<string>(35)
	console.log(input_arr)

	let loading = false
	const maxMessages = 20

	function clear_arr(arr) {
		for (var i in arr) {
			arr[i] = ''
		}
	}

	function clear() {
		messages = []
		localStorage.setItem('messages', JSON.stringify(messages))
	}

	function copy() {
		const role = (message: Message) => (message.role === 'user' ? 'You' : { botName })
		const text = messages.map((message) => `${role(message)}:\n${message.content}`).join('\n\n')
		navigator.clipboard.writeText(text)
		window.alert('Copied to clipboard!')
	}

	// Storing the questions so I can more easily add them to the input
	const paragraphText: string[] = [
		'Appropriate salutation and level of formality',
		'Understanding their role and potential authority',
		'How they might perceive communication',
		'Known positions or statements',
		'Recent actions or achievements relevant to your message',
		'Preferred communication style',
		'What might incentivize them to act',
		'Their likely concerns or interests',
		'Potential alignment with your request',
		'Current potential mood or state of mind',
		'Potential receptiveness to your message',
		'Avoiding triggers that might create resistance',
		'Shared values or goals',
		'Ways to frame your message to resonate with them',
		'Avoiding controversial or dismissive language',
		'Clear, singular objective',
		'Specific outcome desired',
		'Concrete action requested',
		'Relevant facts',
		'Context for the request',
		'Potential impact or consequences',
		'Chronological flow',
		'Cause-and-effect relationships',
		'Anticipated questions or objections',
		'Urgency of the request',
		'Specific deadlines',
		'Expected timeline for response or action',
		'Attachments needed',
		'Links to additional resources',
		'Reference materials',
		"Matching recipient's communication style",
		'Balancing professionalism and approachability',
		'Highlighting benefits',
		'Creating a sense of urgency',
		'Making the action feel achievable'
	]

	async function sendMessage() {
		let input = ''
		for (var i in paragraphText) {
			input = input + paragraphText[i] + ': ' + input_arr[i] + '\n'
		}
		console.log(input)
		messages = [...messages, { content: input, role: 'user' }]
		clear_arr(input_arr)
		loading = true

		const response = await fetch('api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(messages)
		})

		const data = (await response.json()) as ChatResponse

		messages = [...messages, { content: data.response, role: 'assistant' }]
		// set the messages in local storage
		localStorage.setItem('messages', JSON.stringify(messages))

		loading = false
	}

	onMount(() => {
		const footer = document.querySelector('footer')
		footer?.scrollIntoView({ behavior: 'smooth' })
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

	const personality = {
		intro: `Meet ${botName}! You can chat with them about AI safety, the dangers of AI, how it wants to take over the world or how we can stop this from happening!`
	}

	const title = `Chat with ${botName}`
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta property="og:description" content={personality.intro} />
</svelte:head>

<main>
	{#if messages.length === 0}
		<p>{personality.intro}</p>
	{/if}
	{#each messages as { role, content }}
		<div class="message {role}">
			<p>{content}</p>
		</div>
	{/each}
	{#if loading}
		<div class="message assistant loading">
			<p>Thinking...</p>
		</div>
	{/if}
</main>

<footer>
	{#if messages.length > maxMessages}
		<p>You reached the maximum amount of messages, you can clear the chat</p>
		<button class="button" on:click={clear}>Clear chat</button>
		<button class="button" on:click={copy}>Copy chat</button>
	{:else}
		<form on:submit|preventDefault>
			<h1>Personal Context</h1>
			<h2>Professional Title and Status</h2>
			<p>Appropriate salutation and level of formality</p>
			<textarea
				placeholder="Type here (Question 1)"
				bind:value={input_arr[0]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Understanding their role and potential authority</p>
			<textarea
				placeholder="Type here (Question 2)"
				bind:value={input_arr[1]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>How they might perceive communication</p>
			<textarea
				placeholder="Type here (Question 3)"
				bind:value={input_arr[2]}
				on:keydown={handleKeyDown}
			></textarea>

			<h2>Prior Interactions/Background</h2>
			<p>Known positions or statements</p>
			<textarea
				placeholder="Type here (Question 4)"
				bind:value={input_arr[3]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Recent actions or achievements relevant to your message</p>
			<textarea
				placeholder="Type here (Question 5)"
				bind:value={input_arr[4]}
				on:keydown={handleKeyDown}
			></textarea>

			<h2>Communication Preferences</h2>
			<p>Preferred communication style</p>
			<textarea
				placeholder="Type here (Question 6)"
				bind:value={input_arr[5]}
				on:keydown={handleKeyDown}
			></textarea>

			<h2>Potential Motivations</h2>
			<p>What might incentivize them to act</p>
			<textarea
				placeholder="Type here (Question 7)"
				bind:value={input_arr[6]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Their likely concerns or interests</p>
			<textarea
				placeholder="Type here (Question 8)"
				bind:value={input_arr[7]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Potential alignment with your request</p>
			<textarea
				placeholder="Type here (Question 9)"
				bind:value={input_arr[8]}
				on:keydown={handleKeyDown}
			></textarea>

			<h1>Psychological Considerations</h1>
			<h2>Emotional Landscape</h2>
			<p>Current potential mood or state of mind</p>
			<textarea
				placeholder="Type here (Question 10)"
				bind:value={input_arr[9]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Potential receptiveness to your message</p>
			<textarea
				placeholder="Type here (Question 11)"
				bind:value={input_arr[10]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Avoiding triggers that might create resistance</p>
			<textarea
				placeholder="Type here (Question 12)"
				bind:value={input_arr[11]}
				on:keydown={handleKeyDown}
			></textarea>

			<h2>Perspective Alignment</h2>
			<p>Shared values or goals</p>
			<textarea
				placeholder="Type here (Question 13)"
				bind:value={input_arr[12]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Ways to frame your message to resonate with them</p>
			<textarea
				placeholder="Type here (Question 14)"
				bind:value={input_arr[13]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Avoiding controversial or dismissive language</p>
			<textarea
				placeholder="Type here (Question 15)"
				bind:value={input_arr[14]}
				on:keydown={handleKeyDown}
			></textarea>

			<h1>Information Needed About the Message</h1>
			<h2>Content Requirements</h2>
			<h3>Precise Purpose</h3>
			<p>Clear, singular objective</p>
			<textarea
				placeholder="Type here (Question 16)"
				bind:value={input_arr[15]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Specific outcome desired</p>
			<textarea
				placeholder="Type here (Question 17)"
				bind:value={input_arr[16]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Concrete action requested</p>
			<textarea
				placeholder="Type here (Question 18)"
				bind:value={input_arr[17]}
				on:keydown={handleKeyDown}
			></textarea>

			<h3>Supporting Evidence</h3>
			<p>Relevant facts</p>
			<textarea
				placeholder="Type here (Question 19)"
				bind:value={input_arr[18]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Context for the request</p>
			<textarea
				placeholder="Type here (Question 20)"
				bind:value={input_arr[19]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Potential impact or consequences</p>
			<textarea
				placeholder="Type here (Question 21)"
				bind:value={input_arr[20]}
				on:keydown={handleKeyDown}
			></textarea>

			<h3>Logical Structure</h3>
			<p>Chronological flow</p>
			<textarea
				placeholder="Type here (Question 22)"
				bind:value={input_arr[21]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Cause-and-effect relationships</p>
			<textarea
				placeholder="Type here (Question 23)"
				bind:value={input_arr[22]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Anticipated questions or objections</p>
			<textarea
				placeholder="Type here (Question 24)"
				bind:value={input_arr[23]}
				on:keydown={handleKeyDown}
			></textarea>

			<h2>Practical Elements</h2>
			<h3>Timeframe</h3>
			<p>Urgency of the request</p>
			<textarea
				placeholder="Type here (Question 25)"
				bind:value={input_arr[24]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Specific deadlines</p>
			<textarea
				placeholder="Type here (Question 26)"
				bind:value={input_arr[25]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Expected timeline for response or action</p>
			<textarea
				placeholder="Type here (Question 27)"
				bind:value={input_arr[26]}
				on:keydown={handleKeyDown}
			></textarea>

			<h3>Supplementary Information</h3>
			<p>Attachments needed</p>
			<textarea
				placeholder="Type here (Question 28)"
				bind:value={input_arr[27]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Links to additional resources</p>
			<textarea
				placeholder="Type here (Question 29)"
				bind:value={input_arr[28]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Reference materials</p>
			<textarea
				placeholder="Type here (Question 30)"
				bind:value={input_arr[29]}
				on:keydown={handleKeyDown}
			></textarea>

			<h1>Communication Strategy</h1>
			<h2>Tone Calibration</h2>
			<p>Matching recipient's communication style</p>
			<textarea
				placeholder="Type here (Question 31)"
				bind:value={input_arr[30]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Balancing professionalism and approachability</p>
			<textarea
				placeholder="Type here (Question 32)"
				bind:value={input_arr[31]}
				on:keydown={handleKeyDown}
			></textarea>

			<h2>Persuasion Techniques</h2>
			<p>Highlighting benefits</p>
			<textarea
				placeholder="Type here (Question 33)"
				bind:value={input_arr[32]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Creating a sense of urgency</p>
			<textarea
				placeholder="Type here (Question 34)"
				bind:value={input_arr[33]}
				on:keydown={handleKeyDown}
			></textarea>
			<p>Making the action feel achievable</p>
			<textarea
				placeholder="Type here (Question 35)"
				bind:value={input_arr[34]}
				on:keydown={handleKeyDown}
			></textarea>

			<div class="buttons">
				<button on:click={clear} class="button button--alt">Clear chat</button>
				<button on:click={copy} class="button button--alt">Copy chat</button>
				<button on:click={sendMessage}> Send </button>
			</div>
		</form>
	{/if}
	<div class="disclaimer">
		Disclaimer: {botName} is just a cheeky chatbot, don't take it too seriously.
	</div>
</footer>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-left: auto;
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
		margin-top: 1rem;
		max-width: 24rem;
		margin-left: auto;
	}

	.buttons {
		display: flex;
		gap: 1rem;
		align-items: end;
		align-self: flex-end;
	}

	button {
		background-color: var(--brand);
		color: var(--background);
		border: none;
		border-radius: 10px;
		padding: 10px;
		font-size: var(--font-size);
		font-family: var(--font-body);
		cursor: pointer;
		display: flex;
		align-self: flex-end;
		font-weight: bold;
		color: var(--bg);
	}

	.button--alt {
		background-color: var(--background);
		color: var(--text);
	}

	button:hover {
		background-color: var(--brand-subtle);
	}
	button:active {
		background-color: var(--brand);
	}

	.button--alt:hover {
		background-color: var(--bg-subtle);
	}

	.disclaimer {
		font-size: 0.8rem;
		color: var(--text-subtle);
		margin-top: 1rem;
	}

	.message {
		display: flex;
		border-radius: 10px;
		border: solid 1px var(--text);
		justify-content: flex-start;
		white-space: pre-wrap;
		max-width: 24rem;
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
