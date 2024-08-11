<script lang="ts">
	import { fly } from 'svelte/transition'

	export let tabs: string[]
	export let id: string
	export let label_id: string

	let active = tabs[0]
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
					aria-controls={`${id}-${i.toString()}`}
					tabindex={active === tab ? 0 : -1}
				>
					<svg class="bullet" width="10" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
						<circle cx="50%" cy="50%" r="1" />
					</svg>
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
				aria-labelledby={`${id}-${i.toString()}`}
				style={`display: ${active === tab ? 'block' : 'none'}`}
				in:fly={{ duration: 500, x: '100%', y: 0 }}
			>
				<h3 class="panel-title" id={`${id}-${i.toString()}`}>
					<slot {tab}></slot>
				</h3>
				<slot name="panel" {tab}></slot>
			</div>
		{/key}
	{/each}
</div>

<style>
	.tabs {
		--padding-side: 1rem;
		overflow-x: hidden;
	}
	ul {
		padding-left: 0;
		margin-bottom: 1rem;
		grid-column: 1 / span 3;
		width: 100%;
		height: fit-content;
		border-radius: 0.625rem;
		background-color: var(--bg-subtle);
		display: flex;
		flex-direction: column;
		width: fit-content;
	}
	li {
		font-weight: 700;
		display: flex;
	}
	button.active {
		left: var(--padding-side);
	}
	button {
		padding: 1rem calc(2 * var(--padding-side)) 1rem var(--padding-side);
		background: none;
		border: none;
		position: relative;
		flex-grow: 1;
		text-align: left;
		cursor: pointer;
		display: flex;
		align-items: center;
	}
	.bullet {
		fill: var(--brand);
		display: none;
	}
	button.active .bullet {
		display: inline;
		position: absolute;
		left: 0;
	}
	.panel {
		grid-column: 4 / span 6;
	}
	.panel-title {
		display: none;
	}

	@media (min-width: 768px) {
		.tabs {
			display: grid;
			grid-template-columns: max-content minmax(2rem, 1fr) minmax(auto, 50rem) 3fr;
		}
		ul {
			grid-column: 1;
		}
		.panel {
			grid-column: 3;
		}
		.panel-title {
			display: block;
			padding-bottom: 1rem;
		}
	}
	@media (min-width: 1024px) {
		.tabs {
			--padding-side: 1.25rem;
		}
		button {
			padding: 2rem calc(2 * var(--padding-side)) 2rem var(--padding-side);
		}
	}
</style>
