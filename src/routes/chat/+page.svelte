<!-- FILEPATH: /Users/joep/dev/github/joepio/pauseai/src/routes/chat/+page.svelte -->
<script lang="ts">
	import { botName } from '$lib/config'
	import type { ChatResponse, Message } from '../api/chat/+server'
	import { onMount } from 'svelte'

	let messages: Message[] =
		typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('messages') || '[]') : []

	let input = ''
	let loading = false
	const maxMessages = 20

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

	async function sendMessage() {
		if (input.trim() === '') return

		messages = [...messages, { content: input, role: 'user' }]
		input = ''
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
		if (event.key === 'Enter') {
			event.preventDefault()
			sendMessage()
			input = ''
		}
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
		<form on:submit|preventDefault={sendMessage}>
			<textarea placeholder="Type here" bind:value={input} on:keydown={handleKeyDown} />
			<div class="buttons">
				<button on:click={clear} class="button button--alt">Clear chat</button>
				<button on:click={copy} class="button button--alt">Copy chat</button>
				<button type="submit" disabled={loading || input == ''}> Send </button>
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
