<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	import { page } from '$app/stores'
	import TikTok from '$lib/components/icons/tiktok.svelte'
	import Instagram from '$lib/components/icons/instagram.svelte'
	import Facebook from '$lib/components/icons/facebook.svelte'
	import Youtube from '$lib/components/icons/youtube.svelte'
	import Discord from '$lib/components/icons/discord.svelte'
	import Linkedin from '$lib/components/icons/linkedin.svelte'
	import X from '$lib/components/icons/x.svelte'
	import SearchIcon from 'lucide-svelte/icons/search'
	import Button from '$lib/components/Button.svelte'
	const enableBot = false

	$: logo_animate = $page.url.pathname != '/'
</script>

<nav>
	<a href="/" class="logo">
		<Logo animate={logo_animate} fill_pause={$page.url.pathname == '/' ? 'white' : ''} />
	</a>

	<div class="nav-right">
		<div class="nav-links">
			<NavLink href="/risks">Risques</NavLink>
			<NavLink href="/proposal">Propositions</NavLink>
			<!-- <NavLink href="/protests">Protests</NavLink> -->
			<!-- <NavLink href="/faq">FAQ</NavLink> -->
			<NavLink href="/action">Agir</NavLink>
			<NavLink href="/posts">Blog</NavLink>
			<NavLink href="/donate">Dons</NavLink>
			{#if enableBot}
				<NavLink href="/chat">{botName}</NavLink>
			{/if}
			<!-- <NavLink href="/about">About</NavLink> -->
			<NavLink href="/join"><Button alt={$page.url.pathname == '/'}>Nous rejoindre</Button></NavLink
			>
			<!-- <NavLink href="/search" ariaLabel="Search"><SearchIcon size="0.8em" /></NavLink> -->
		</div>
	</div>
</nav>

<style>
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-direction: column;
		padding: 1.95rem 6rem;
		/* margin-left: -1rem; */
		flex-wrap: wrap;
		z-index: 1;
	}

	/* .logo {
		margin-bottom: 1rem;
		margin-left: 1rem;
	} */

	.nav-links {
		display: flex;
		/* text-transform: uppercase; */
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	@media (min-width: 850px) {
		nav {
			flex-direction: row;
			/* margin-left: 1rem; */
		}

		/* .logo {
			margin-left: -3.4rem;
			margin-bottom: 0;
		} */

		/* .nav-links {
			margin-left: 2rem;
		} */
	}

	.logo {
		line-height: 0;
	}
</style>
