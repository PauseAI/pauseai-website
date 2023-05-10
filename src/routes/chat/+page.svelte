<!-- FILEPATH: /Users/joep/dev/github/joepio/pauseai/src/routes/chat/+page.svelte -->
<script lang="ts">
	type Message = {
		text: string
		sender: 'user' | 'bot'
	}
	let messages: Message[] = []
	let input = ''

	async function sendMessage() {
		if (input.trim() === '') return

		messages = [...messages, { text: input, sender: 'user' }]
		input = ''

		const response = await fetch('api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ message: input })
		})

		const data = await response.json()

		messages = [...messages, { text: data.message, sender: 'bot' }]
	}
</script>

<main>
	{#each messages as message}
		<div class="message {message.sender}">
			<p>{message.text}</p>
		</div>
	{/each}
</main>

<footer>
	<form on:submit|preventDefault={sendMessage}>
		<input type="text" bind:value={input} />
		<button type="submit">Send</button>
	</form>
</footer>

<style>
	.message {
		display: flex;
		justify-content: center;
		margin: 10px;
		border: solid 1px var(--text);
	}

	.user {
		flex-direction: row-reverse;
	}

	.bot {
		flex-direction: row;
	}

	.message p {
		padding: 10px;
		border-radius: 10px;
	}
</style>
