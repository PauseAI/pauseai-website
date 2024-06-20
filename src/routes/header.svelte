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
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<rect
					y="13.5686"
					width="3.13043"
					height="24"
					transform="rotate(-90 0 13.5686)"
					fill="white"
				/>
				<rect
					y="3.13037"
					width="3.13043"
					height="24"
					transform="rotate(-90 0 3.13037)"
					fill="white"
				/>
				<rect y="24" width="3.13043" height="24" transform="rotate(-90 0 24)" fill="white" />
			</svg>
		</div>
	</div>

	<div class="sidebar" class:open>
		<div class="sidebar-head">
			<a href="/" class="logo">
				<Logo animate={logo_animate} fill_pause={$page.url.pathname == '/' ? 'black' : ''} />
			</a>
			<div class="hamburger" on:click={() => (open = !open)}>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						y="2.21387"
						width="3.13043"
						height="30.8142"
						transform="rotate(-45 0 2.21387)"
						fill="black"
					/>
					<rect
						x="21.7891"
						y="0.000244141"
						width="3.13043"
						height="30.8142"
						transform="rotate(45 21.7891 0.000244141)"
						fill="black"
					/>
				</svg>
			</div>
		</div>
		<div class="sidebar-links">
			<a href="/risks"><h2>Risques</h2></a>
			<a href="/proposal"><h2>Propositions</h2></a>
			<a href="/action"><h2>Agir</h2></a>
			<a href="/posts"><h2>Blog</h2></a>
			<a href="/donate"><h2>Dons</h2></a>
			<a href="/join"><h2>Nous rejoindre</h2></a>
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

	.sidebar-links {
		display: flex;
		flex-direction: column;
	}

	.sidebar-links a {
		text-decoration: none;
	}

	.sidebar-links a:hover {
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
		cursor: pointer;
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
