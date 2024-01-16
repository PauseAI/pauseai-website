<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	const enableBot = false
</script>

<nav>
	<a href="/">
		<Logo />
	</a>

	<div class="nav-links">
		<NavLink href="/risks">Risks</NavLink>
		<NavLink href="/proposal">Proposal</NavLink>
		<NavLink href="/protests">Protests</NavLink>
		<NavLink href="/faq">FAQ</NavLink>
		<NavLink href="/action">Take Action</NavLink>
		{#if enableBot}
			<NavLink href="/chat">{botName}</NavLink>
		{/if}
		<!-- <NavLink href="/about">About</NavLink> -->
		<NavLink c2a href="/join">Join</NavLink>
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

	.nav-links {
		display: flex;
		text-transform: uppercase;
		flex-wrap: wrap;
		justify-content: center;
	}

	@media (min-width: 850px) {
		nav {
			flex-direction: row;
			margin-left: 1rem;
		}

		.nav-links {
			margin-left: 2rem;
		}
	}
</style>
