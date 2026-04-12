<script lang="ts">
	import Navbar from '$lib/components/navbar/Navbar.svelte'
	import Navlink from '$lib/components/navbar/Navlink.svelte'
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'
	import SearchModal from '$lib/components/SearchModal.svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { botName } from '$lib/config'
	import SearchIcon from 'lucide-svelte/icons/search'

	const enableBot = false

	export let inverted = false

	let searchOpen = false

	const openSearch = (e: MouseEvent) => {
		e.preventDefault()
		searchOpen = true
	}
</script>

<Navbar {inverted}>
	<Navlink {inverted} first href="/learn">{m.header_learn()}</Navlink>
	<Navlink {inverted} href="/proposal">{m.header_proposal()}</Navlink>
	<Navlink {inverted} href="/communities">{m.header_events()}</Navlink>
	<Navlink {inverted} href="/faq">{m.header_faq()}</Navlink>
	<Navlink {inverted} href="/action">{m.header_action()}</Navlink>
	<Navlink {inverted} href="/donate">{m.header_donate()}</Navlink>
	{#if enableBot}
		<Navlink {inverted} href="/chat">{botName}</Navlink>
	{/if}
	<!-- <NavLink href="/about">About</NavLink> -->
	<Navlink {inverted} c2a href="/join">{m.header_join()}</Navlink>
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
</Navbar>

<SearchModal bind:open={searchOpen} />
