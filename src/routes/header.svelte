<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	import { page } from '$app/stores'
	import SearchIcon from 'lucide-svelte/icons/search'
	import LanguageSwitcher from '$lib/components/LanguageSwitcher.svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { i18n } from '$lib/i18n'

	const enableBot = false

	export let inverted = false

	$: logo_animate = i18n.route($page.url.pathname) != '/'
</script>

<nav class={inverted ? 'inverted-header' : ''}>
	<a href="/" class="logo">
		<Logo animate={logo_animate} {inverted} />
	</a>

	<div class="nav-right">
		<div class="nav-links">
			<NavLink {inverted} href="/learn">{m.header_learn()}</NavLink>
			<NavLink {inverted} href="/proposal">{m.header_proposal()}</NavLink>
			<NavLink {inverted} href="/events">{m.header_events()}</NavLink>
			<NavLink {inverted} href="/faq">{m.header_faq()}</NavLink>
			<NavLink {inverted} href="/action">{m.header_action()}</NavLink>
			<NavLink {inverted} href="/donate">{m.header_donate()}</NavLink>
			{#if enableBot}
				<NavLink {inverted} href="/chat">{botName}</NavLink>
			{/if}
			<!-- <NavLink href="/about">About</NavLink> -->
			<NavLink {inverted} c2a href="/join">{m.header_join()}</NavLink>
			<LanguageSwitcher />
			<NavLink {inverted} href="/search" ariaLabel="Search"><SearchIcon size="0.8em" /></NavLink>
		</div>
	</div>
</nav>

<style>
	.inverted-header {
		color: white;
		z-index: 1;

		--text: white;
	}

	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		padding: 2rem 0;
		margin-left: -1rem;
		flex-wrap: wrap;
		height: calc(var(--nav-height) - 5rem);
	}

	.logo {
		margin-bottom: 1rem;
		margin-left: 1rem;
	}

	.nav-links {
		position: relative;
		display: flex;
		text-transform: uppercase;
		flex-wrap: wrap;
		justify-content: center;
	}

	@media (min-width: 900px) {
		nav {
			flex-direction: row;
			margin-left: 1rem;
		}

		.logo {
			margin-left: -3.4rem;
			margin-bottom: 0;
		}

		.nav-links {
			margin-left: 2rem;
		}
	}
</style>
