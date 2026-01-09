<script lang="ts">
	import Navbar from '$lib/components/navbar/Navbar.svelte'
	import Navlink from '$lib/components/navbar/Navlink.svelte'
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'
	import * as m from '$lib/paraglide/messages.js'
	import SearchIcon from 'lucide-svelte/icons/search'

	export let inverted = false
	export let moveUp = false
</script>

<Navbar {inverted} {moveUp}>
	<Navlink {inverted} first href="/join">{m.header_join()}</Navlink>
	<Navlink {inverted} href="/about">About Us</Navlink>
	<Navlink {inverted} href="/learn">{m.header_learn()}</Navlink>
	<Navlink {inverted} href="/proposal">{m.header_proposal()}</Navlink>
	<Navlink {inverted} href="/action">Act</Navlink>
	<Navlink {inverted} href="/communities">Groups</Navlink>
	<LanguageSwitcher {inverted} />
	<Navlink {inverted} href="/search" ariaLabel="Search"><SearchIcon size="0.8em" /></Navlink>
</Navbar>
