<!-- FILEPATH: /Users/joep/dev/github/joepio/pauseai/src/routes/chat/+page.svelte -->
<script lang="ts">
	import type { ChatResponse, Message } from '../api/chat/+server'
	import { onMount } from 'svelte'

	let messages: Message[] =
		typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('messages') || '[]') : []

	let input = ''
	let loading = false

	function clear() {
		messages = []
		localStorage.setItem('messages', JSON.stringify(messages))
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
			// set the messages in local storage
			localStorage.setItem('messages', JSON.stringify(messages))
		}
	}

	const personality = {
		intro: 'Talk to DoomBot, ask them anything!'
	}
</script>

<main>
	{#if messages.length === 0}
		<p>{personality.intro}</p>
	{/if}
	{#each messages as message}
		<div class="message {message.role}">
			<p>{message.content}</p>
		</div>
	{/each}
	{#if loading}
		<div class="message assistant">
			<p>Loading reply... (can take a while)</p>
		</div>
	{/if}
</main>

<footer>
	<form on:submit|preventDefault={sendMessage}>
		<textarea placeholder="Type here" bind:value={input} on:keydown={handleKeyDown} />
		<div class="buttons">
			<button on:click={clear} class="button button--alt">Clear chat</button>
			<button type="submit" disabled={loading}>
				{#if loading}
					Loading...
				{:else}
					Send
				{/if}
			</button>
		</div>
	</form>
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
	}

	.button--alt {
		background-color: var(--background);
		color: var(--text);
	}

	button:hover {
		background-color: var(--brand-light);
	}
	button:active {
		background-color: var(--brand-dark);
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

	.message p {
		padding: 10px;
		border-radius: 10px;
	}
</style>
