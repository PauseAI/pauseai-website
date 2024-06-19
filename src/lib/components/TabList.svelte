<script lang="ts">
	import { fly } from 'svelte/transition'

	export let tabs: string[]
	export let id: string
	export let label_id: string

	let active = tabs[0]
	const tab_id_prefix = `${id}-tab`
</script>

<div class="tabs" {id}>
	<ul role="tablist" aria-labelledby={label_id}>
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
		overflow-x: hidden;
	}
	ul {
		margin-bottom: 2rem;
		grid-column: 1 / span 3;
		width: 100%;
		height: fit-content;
		border-radius: 0.625rem;
		background-color: var(--bg-subtle);
		display: flex;
		flex-direction: column;
	}
	li {
		font-weight: 700;
		display: flex;
	}
	button.active::before {
		content: '⏺ ';
		color: var(--brand);
		position: absolute;
		left: 0;
	}
	button.active {
		left: var(--bullet-offest);
	}
	button {
		--bullet-offest: 1.7ch;
		padding: 2rem calc(1.25rem + var(--bullet-offest)) 2rem 1.25rem;
		background: none;
		border: none;
		position: relative;
		flex-grow: 1;
		text-align: left;
		cursor: pointer;
	}
	.panel {
		grid-column: 4 / span 6;
	}
	.panel-title {
		padding-bottom: 1rem;
	}

	@media (min-width: 600px) {
		.tabs {
			display: grid;
			grid-template-columns: repeat(12, 1fr);
			height: 40rem;
			overflow-x: hidden;
		}
		ul {
			margin: 0;
			width: fit-content;
		}
	}
</style>
