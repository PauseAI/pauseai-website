<script lang="ts">
	import { onMount } from 'svelte'

	export let tabs: { title: string; content: string }[] = []
	export let activeTab = 0

	let tabButtons: HTMLDivElement
	let tabContents: HTMLDivElement

	onMount(() => {
		// Set initial active tab
		updateActiveTab(activeTab)
	})

	function updateActiveTab(index: number) {
		activeTab = index

		// Update button styles
		if (tabButtons) {
			const buttons = tabButtons.querySelectorAll('.tab-button')
			buttons.forEach((button, i) => {
				if (i === activeTab) {
					button.classList.add('active')
				} else {
					button.classList.remove('active')
				}
			})
		}

		// Update content visibility
		if (tabContents) {
			const contents = tabContents.querySelectorAll('.tab-content')
			contents.forEach((content, i) => {
				if (i === activeTab) {
					content.classList.add('active')
				} else {
					content.classList.remove('active')
				}
			})
		}
	}
</script>

<div class="tabs-container">
	<div class="tab-buttons" bind:this={tabButtons}>
		{#each tabs as tab, i}
			<button class="tab-button" class:active={i === activeTab} on:click={() => updateActiveTab(i)}>
				{tab.title}
			</button>
		{/each}
	</div>
	<div class="tab-contents" bind:this={tabContents}>
		{#each tabs as tab, i}
			<div class="tab-content" class:active={i === activeTab}>
				{@html tab.content}
			</div>
		{/each}
	</div>
</div>

<style>
	.tabs-container {
		border-radius: 8px;
		box-shadow: 0px 5px 20px 0px rgb(0, 0, 0, 0.1);
		background-color: var(--bg-secondary);
		overflow: hidden;
		margin: var(--spacing-md) 0;
	}

	.tab-buttons {
		display: flex;
		background-color: var(--bg-subtle);
		border-bottom: 1px solid var(--brand-subtle);
	}

	.tab-button {
		flex: 1;
		padding: var(--spacing-xs) var(--spacing-sm);
		background: none;
		border: none;
		border-right: 1px solid var(--brand-subtle);
		color: var(--text);
		font-family: var(--font-body);
		font-size: 0.9rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
		border-bottom: 2px solid transparent;
		font-weight: 500;
	}

	.tab-button:last-child {
		border-right: none;
	}

	.tab-button:hover {
		background-color: rgba(255, 255, 255, 0.1);
	}

	.tab-button.active {
		background-color: var(--bg-secondary);
		border-bottom-color: var(--brand);
		color: var(--brand);
		font-weight: bold;
	}

	.tab-contents {
		padding: var(--spacing-md);
	}

	.tab-content {
		display: none;
	}

	.tab-content.active {
		display: block;
	}

	.tab-content :global(h2) {
		margin-top: 0;
		font-size: 1.2rem;
	}

	.tab-content :global(h3) {
		margin-top: 0;
		margin-bottom: var(--spacing-sm);
		font-size: 1.1rem;
	}

	.tab-content :global(ul) {
		margin: var(--spacing-sm) 0;
		padding-left: var(--spacing-md);
	}

	.tab-content :global(li) {
		margin-bottom: var(--spacing-xs);
	}

	.tab-content :global(a) {
		color: var(--brand);
		text-decoration: none;
	}

	.tab-content :global(a:hover) {
		text-decoration: underline;
	}
</style>
