<!-- FILEPATH: /Users/joep/dev/github/joepio/pauseai/src/routes/chat/+page.svelte -->
<script lang="ts">
	import type { ChatResponse, Message } from '../api/chat/+server'
	import { onMount } from 'svelte'

	let messages: Message[] = []
	let input = ''
	let loading = false

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
</script>

<main>
	<div class="message assistant">
		<p>
			Hi there! I'm PauseBot, your personal assistant to talk about AI safety. What would you like
			to talk about?
		</p>
	</div>
	{#each messages as message}
		<div class="message {message.role}">
			<p>{message.content}</p>
		</div>
	{/each}
	{#if loading}
		<div class="message assistant">
			<p>One moment please...</p>
		</div>
	{/if}
</main>

<footer>
	<form on:submit|preventDefault={sendMessage}>
		<textarea placeholder="Talk to PauseBot" bind:value={input} />
		<button type="submit" disabled={loading}>
			{#if loading}
				Loading...
			{:else}
				Send
			{/if}
		</button>
	</form>
</footer>

<style>
	main {
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
	}

	.user {
		flex-direction: row-reverse;
		justify-content: flex-end;
	}

	.assistant {
		border-color: var(--brand);
		flex-direction: row;
		justify-content: flex-start;
	}

	.message p {
		padding: 10px;
		border-radius: 10px;
	}
</style>
