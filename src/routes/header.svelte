<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	import { page } from '$app/stores'
	import SearchIcon from 'lucide-svelte/icons/search'
	const enableBot = false

	$: logo_animate = $page.url.pathname != '/'
</script>

<nav>
	<NavLink href="/" customClass="logo">
		<Logo animate={logo_animate} />
	</NavLink>

	<div class="nav-right">
		<div class="nav-links">
			<NavLink href="/risks">Risks</NavLink>
			<NavLink href="/proposal">Proposal</NavLink>
			<NavLink href="/protests">Protests</NavLink>
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
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		padding: 2rem 0;
		margin-left: -1rem;
		flex-wrap: wrap;
	}

	:global(.logo) {
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

		:global(.logo) {
			margin-left: -1.75rem;
			margin-bottom: -0.2rem;
		}

		.nav-links {
			margin-left: 2rem;
		}
	}

	:global(.nav-links a) {
		padding-left: 0.5rem;
		margin-left: 0.5rem;
		padding-right: 0.5rem;
		margin-right: -0.5rem;
		font-family: var(--font-heading);
		font-weight: 700;
		color: var(--text);
		text-decoration: none;
		font-size: 1.1rem;
	}

	:global(.nav-links a.c2a) {
		color: var(--brand);
	}

	:global(.nav-links a:hover) {
		color: var(--brand);
		text-decoration: underline;
	}

	:global(.nav-links a.active),
	:global(.nav-links a:active) {
		color: var(--brand-subtle);
	}
</style>
