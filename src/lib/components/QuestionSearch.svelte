<script lang="ts">
	let query = ''
	let results: Result[] = []

	type Result = {
		id: string
		pageId: string
		score: number
		status: 'Live on site' | 'Draft'
		title: string
		url: string
	}

	const search = async () => {
		const res = await fetch(`https://nlp.stampy.ai/api/search?query=${query}`)
		const json = await res.json()
		results = json
	}

	const clear = () => {
		query = ''
		results = []
	}

	$: {
		if (query.length > 0) {
			search()
		} else {
			results = []
		}
	}
</script>

<div>
	<input type="text" placeholder="Search for a question" bind:value={query} />
	<button on:click={clear}>Clear</button>
</div>

{#if results.length > 0}
	<ul>
		{#each results as result}
			<li><a href={result.url}>{result.title}</a></li>
		{/each}
	</ul>
{/if}

<style>
	div {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
	}
	input {
		flex: 1;
		padding: 0.5rem;
		background-color: var(--bg);
		border: solid 1px var(--text);
		font-family: var(--font-body);
		font-size: 1rem;
		border-top-left-radius: 5px;
		border-bottom-left-radius: 5px;
		box-sizing: border-box;
	}
	input::placeholder {
		color: var(--text-subtle);
	}
	button {
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
		padding: 0.5rem;
		font-family: var(--font-body);
		font-size: 1rem;
		background-color: var(--text-subtle);
		outline: none;
		border: none;
	}
</style>
