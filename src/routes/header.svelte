<script lang="ts">
	import Navbar from '$lib/components/navbar/Navbar.svelte'
	import Navlink from '$lib/components/navbar/Navlink.svelte'
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'
	import { getNavItems } from '$lib/components/navbar/navItems'
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
</Navbar>
