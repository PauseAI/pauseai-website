<script lang="ts">
	import Navbar from '$lib/components/navbar/Navbar.svelte'
	import Navlink from '$lib/components/navbar/Navlink.svelte'
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'
	import { getNavItems } from '$lib/components/navbar/navItems'
	import * as m from '$lib/paraglide/messages.js'
	import { searchOpen } from '$lib/stores/searchModal'
	import SearchIcon from '@lucide/svelte/icons/search'

	interface Props {
		inverted?: boolean
	}

	let { inverted = false }: Props = $props()

	let items = $derived(getNavItems())

	const openSearch = (e: MouseEvent) => {
		e.preventDefault()
		searchOpen.set(true)
	}
</script>

<Navbar {inverted} {items}>
	{#snippet extras()}
		<LanguageSwitcher {inverted} />
		<button
			id="search-button"
			onclick={openSearch}
			class="reset-button"
			aria-label="Search"
			data-hydrate-click
		>
			<Navlink {inverted}>
				<SearchIcon size="0.8em" />
			</Navlink>
		</button>
	{/snippet}

	{#snippet panelExtras(closePanel: () => void)}
		<button
			class="reset-button panel-search"
			onclick={(e) => {
				closePanel()
				openSearch(e)
			}}
		>
			<SearchIcon size="1em" />
			<span>{m.header_search()}</span>
		</button>
		<LanguageSwitcher />
	{/snippet}
</Navbar>

<style>
	.panel-search {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem;
		border-radius: 4px;
		cursor: pointer;
		text-transform: uppercase;
	}

	.panel-search:hover {
		background: var(--bg);
		color: var(--brand);
	}
</style>
