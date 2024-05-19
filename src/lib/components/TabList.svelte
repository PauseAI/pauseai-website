<script lang="ts">
	export let tabs: string[]
	export let id: string
	export let active = tabs[0]
	export let tabs_title_id: string
	const tab_id_prefix = `${id}-tab`
</script>

<ul role="tablist" aria-labelledby={tabs_title_id}>
	{#each tabs as tab, i}
		<li class:active={active === tab} role="presentation">
			<button
				type="button"
				role="tab"
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
	<div
		role="tabpanel"
		tabindex="0"
		aria-labelledby={`${tab_id_prefix}-${i.toString()}`}
		s
		style={`display: ${active === tab ? 'block' : 'none'}`}
	>
		<slot name="panel" {tab}></slot>
	</div>
{/each}
