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

	let open = false
</script>

<nav class={logo_animate ? '' : 'absolute-nav'}>
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
		<div class="hamburger" on:click={() => (open = !open)}>
			<svg
				width="40px"
				height="40px"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M4 18L20 18" stroke="#fff" stroke-width="2" stroke-linecap="round" />
				<path d="M4 12L20 12" stroke="#fff" stroke-width="2" stroke-linecap="round" />
				<path d="M4 6L20 6" stroke="#fff" stroke-width="2" stroke-linecap="round" />
			</svg>
		</div>
	</div>

	<div class="sidebar w-full h-full bg-gray-200 border-r-2 shadow-lg" class:open>
		<div class="sidebar-head">
			<a href="/" class="logo">
				<Logo animate={logo_animate} fill_pause={$page.url.pathname == '/' ? 'black' : ''} />
			</a>
			<div class="hamburger" on:click={() => (open = !open)}>
				<svg
					fill="#000000"
					height="40px"
					width="40px"
					version="1.1"
					id="Layer_1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
					viewBox="0 0 1792 1792"
					xml:space="preserve"
				>
					<path
						d="M1082.2,896.6l410.2-410c51.5-51.5,51.5-134.6,0-186.1s-134.6-51.5-186.1,0l-410.2,410L486,300.4
					c-51.5-51.5-134.6-51.5-186.1,0s-51.5,134.6,0,186.1l410.2,410l-410.2,410c-51.5,51.5-51.5,134.6,0,186.1
					c51.6,51.5,135,51.5,186.1,0l410.2-410l410.2,410c51.5,51.5,134.6,51.5,186.1,0c51.1-51.5,51.1-134.6-0.5-186.2L1082.2,896.6z"
					/>
				</svg>
			</div>
		</div>
		<div class="sidebarlinks">
			<a class="block" href="/risks"><h2>Risques</h2></a>
			<a class="block" href="/proposal"><h2>Propositions</h2></a>
			<a class="block" href="/action"><h2>Agir</h2></a>
			<a class="block" href="/posts"><h2>Blog</h2></a>
			<a class="block" href="/donate"><h2>Dons</h2></a>
			<a class="block" href="/join"><h2>Nous rejoindre</h2></a>
		</div>
	</div>
</nav>

<style>
	.sidebar {
		position: fixed;
		height: 100%;
		width: 100%;
		background: #ff9416;
		top: 0;
		left: 100%;
		padding: 1.95rem 1rem;
		transition: left 0.3s ease-in-out;
	}

	.sidebarlinks {
		display: flex;
		flex-direction: column;
	}

	.sidebarlinks a {
		text-decoration: none;
	}

	.sidebarlinks a:hover {
		color: black;
	}

	.sidebar-head {
		display: flex;
		justify-content: space-between;
	}

	.open {
		left: 0;
	}

	.absolute-nav {
		position: absolute;
		width: 100%;
		height: fit-content;
		z-index: 1000;
	}
	nav {
		display: flex;
		justify-content: space-between;
		/* margin-left: -1rem; */
		flex-wrap: wrap;
		z-index: 1;
		padding: 1.95rem 1rem;
	}

	/* .logo {
		margin-bottom: 1rem;
		margin-left: 1rem;
	} */

	.nav-right {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.nav-links {
		display: none;
		/* text-transform: uppercase; */
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
	}

	.hamburger {
		display: flex;
		align-items: center;
	}

	@media (min-width: 600px) {
		nav {
			flex-direction: row;
			align-items: center;
			padding: 1.95rem 6rem;
			/* margin-left: 1rem; */
		}

		.nav-links {
			display: flex;
		}

		.hamburger {
			display: none;
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
