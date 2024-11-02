<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	import { page } from '$app/stores'
	import SearchIcon from 'lucide-svelte/icons/search'
	const enableBot = false

	export let inverted = false

	$: logo_animate = $page.url.pathname != '/'
</script>

<nav class={inverted ? 'inverted-header' : ''}>
	<a href="/" class="logo">
		<Logo animate={logo_animate} {inverted} />
	</a>

	<div class="nav-right">
		<div class="nav-links">
			<NavLink href="/risks">Risks</NavLink>
			<NavLink href="/proposal">Proposal</NavLink>
			<NavLink href="/events">Events</NavLink>
			<NavLink href="/faq">FAQ</NavLink>
			<NavLink href="/action">Act</NavLink>
			<NavLink href="/donate">Donate</NavLink>
			{#if enableBot}
				<NavLink href="/chat">{botName}</NavLink>
			{/if}
			<!-- <NavLink href="/about">About</NavLink> -->
			<NavLink c2a href="/join">Join</NavLink>
			<NavLink href="/search" ariaLabel="Search"><SearchIcon size="0.8em" /></NavLink>
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
		max-height: var(--nav-height);
	}

	.logo {
		margin-bottom: 1rem;
		margin-left: 1rem;
	}

	.nav-links {
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
