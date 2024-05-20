<script lang="ts">
	import { fly } from 'svelte/transition'

	export let tabs: string[]
	export let id: string
	export let active = tabs[0]
	export let tabs_title_id: string
	const tab_id_prefix = `${id}-tab`
</script>

<div class="tabs" {id}>
	<ul role="tablist" aria-labelledby={tabs_title_id}>
		{#each tabs as tab, i}
			<li role="presentation">
				<button
					type="button"
					role="tab"
					class:active={active === tab}
					on:click={() => (active = tab)}
					aria-selected={active === tab}
					aria-controls={`${tab_id_prefix}-${i.toString()}`}
					tabindex={active === tab ? 0 : -1}
				>
					<slot {tab}></slot>
				</button>
			</li>
		{/each}
	</ul>

	{#each tabs as tab, i}
		{#key active}
			<div
				role="tabpanel"
				class="panel"
				tabindex="0"
				aria-labelledby={`${tab_id_prefix}-${i.toString()}`}
				style={`display: ${active === tab ? 'block' : 'none'}`}
				in:fly={{ duration: 500, x: '100%', y: 0 }}
			>
				<h3 class="panel-title">
					<slot {tab}></slot>
				</h3>
				<slot name="panel" {tab}></slot>
			</div>
		{/key}
	{/each}
</div>

<style>
	.tabs {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		height: 40rem;
		overflow-x: hidden;
	}
	ul {
		margin: 0;
		grid-column: 1 / span 3;
		width: fit-content;
		height: fit-content;
		border-radius: 0.625rem;
		background-color: var(--bg-subtle);
	}
	li {
		font-weight: 700;
		padding: 2rem calc(1.25rem + 2ch) 2rem 1.25rem;
	}
	button.active::before {
		content: '⏺ ';
		color: var(--brand);
		position: absolute;
		left: -2ch;
	}
	button.active {
		left: 2ch;
	}
	button {
		background: none;
		border: none;
		position: relative;
	}
	.panel {
		grid-column: 4 / span 6;
	}
	.panel-title {
		font-size: 2em;
		font-weight: 700;
		padding-bottom: 2rem;
	}
</style>
