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
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- static content -->
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
		flex-wrap: wrap; /* Allow tabs to wrap to the next line */
	}

	.tab-button {
		flex: 1 1 20%; /* Default: 5 tabs per row on larger screens */
		min-width: 120px; /* Ensure a minimum width for desktop tabs */
		padding: var(--spacing-xs) var(--spacing-sm);
		background: none;
		border: none;
		border-right: 1px solid var(--brand-subtle);
		border-bottom: 1px solid var(--brand-subtle); /* Add bottom border for all tabs by default */
		color: var(--text);
		font-family: var(--font-body);
		font-size: 0.9rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
		font-weight: 500;
		text-align: center; /* Center text in tabs */
	}

	/* Desktop: Remove right border from every 5th tab */
	.tab-button:nth-child(5n) {
		border-right: none;
	}

	/* Desktop: Remove bottom border from the last row (if there are 5 tabs or less) */
	.tab-button:nth-last-child(-n + 5) {
		border-bottom: 2px solid transparent;
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

	/* Mobile-specific adjustments: 2 tabs in the first row, 3 tabs in the second row */
	@media (max-width: 768px) {
		.tab-button {
			font-size: 0.8rem;
			padding: var(--spacing-sm) var(--spacing-xs);
			/* Remove default bottom border from all mobile tabs first */
			border-bottom: none;
		}

		/* First row (tabs 1 and 2) */
		.tab-button:nth-child(-n + 2) {
			flex: 1 1 50%; /* Make them take half width each */
			max-width: 50%; /* Ensure they don't grow beyond 50% */
			border-bottom: 1px solid var(--brand-subtle); /* Add bottom border for the first row */
		}

		/* Second row (tabs 3, 4, and 5) */
		.tab-button:nth-child(n + 3) {
			flex: 1 1 33.33%; /* Make them take roughly one-third width each */
			max-width: 33.33%; /* Ensure they don't grow beyond 33.33% */
			min-width: unset; /* Remove min-width to allow shrinking */
			border-bottom: 2px solid transparent; /* Ensure no bottom border for second row */
		}

		/* Right borders for the first row */
		.tab-button:nth-child(odd):nth-child(-n + 2) {
			border-right: 1px solid var(--brand-subtle);
		}
		.tab-button:nth-child(even):nth-child(-n + 2) {
			border-right: none;
		}

		/* Right borders for the second row */
		.tab-button:nth-child(3) {
			border-right: 1px solid var(--brand-subtle);
		}
		.tab-button:nth-child(4) {
			border-right: 1px solid var(--brand-subtle);
		}
		.tab-button:nth-child(5) {
			border-right: none;
		}
	}
</style>
