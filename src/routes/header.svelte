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

	$: onHomepage = $page.url.pathname == '/'

	let open = false
</script>

<!-- probably have to change nav colors and classes to respond to banner presence instead of route -->
<nav class={onHomepage ? 'absolute-nav' : ''}>
	<a href="/" class="logo">
		<div class="big-logo">
			<Logo animate={!onHomepage} fill_pause={onHomepage ? 'white' : 'black'} />
		</div>
		<div class="small-logo">
			<Logo animate={!onHomepage} only_circle />
		</div>
	</a>

	<div class="nav-right">
		<div class="nav-links">
			<NavLink href="/risques">Risques</NavLink>
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
			<Button href="/join" alt={onHomepage}>Nous rejoindre</Button>
			<!-- <NavLink href="/search" ariaLabel="Search"><SearchIcon size="0.8em" /></NavLink> -->
		</div>
		<button class="hamburger" on:click={() => (open = !open)}>
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
					fill={onHomepage ? 'white' : 'black'}
				/>
				<rect
					y="3.13037"
					width="3.13043"
					height="24"
					transform="rotate(-90 0 3.13037)"
					fill={onHomepage ? 'white' : 'black'}
				/>
				<rect
					y="24"
					width="3.13043"
					height="24"
					transform="rotate(-90 0 24)"
					fill={onHomepage ? 'white' : 'black'}
				/>
			</svg>
		</button>
	</div>

	<div class="sidebar" class:open>
		<div class="sidebar-head">
			<a href="/" class="logo">
				<Logo animate={onHomepage} fill_circle="white" fill_ai="white" />
			</a>
			<button class="hamburger" on:click={() => (open = !open)}>
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
			</button>
		</div>
		<div class="sidebar-links">
			<a href="/risks" on:click={() => (open = !open)}><h2>Risques</h2></a>
			<a href="/proposal" on:click={() => (open = !open)}><h2>Propositions</h2></a>
			<a href="/action" on:click={() => (open = !open)}><h2>Agir</h2></a>
			<a href="/posts" on:click={() => (open = !open)}><h2>Blog</h2></a>
			<a href="/donate" on:click={() => (open = !open)}><h2>Dons</h2></a>
			<a href="/join" on:click={() => (open = !open)}><h2>Nous rejoindre</h2></a>
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
		padding: 2rem 1rem;
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
		margin-bottom: 2rem;
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
		padding: 2rem 1rem;
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

	.nav-links :global(a:last-child) {
		margin-left: 0.5rem;
	}

	.hamburger {
		display: flex;
		align-items: center;
		cursor: pointer;
	}

	.logo {
		line-height: 0;
	}

	.small-logo {
		display: none;
	}

	.small-logo :global(svg) {
		width: 3rem;
	}

	.big-logo {
		display: block;
	}

	@media (min-width: 640px) {
		nav {
			flex-direction: row;
			align-items: center;
			padding: 2rem 2rem;
			/* margin-left: 1rem; */
		}

		.nav-links {
			display: flex;
		}

		.hamburger,
		.big-logo,
		.sidebar {
			display: none;
		}
		.small-logo {
			display: block;
		}

		/* .logo {
			margin-left: -3.4rem;
			margin-bottom: 0;
		} */

		/* .nav-links {
			margin-left: 2rem;
			} */
	}
	@media (min-width: 768px) {
		nav {
			padding: 2rem 4rem;
		}
		.small-logo :global(svg) {
			width: auto;
		}
	}

	@media (min-width: 1024px) {
		nav {
			padding: 2rem 6rem;
		}

		.big-logo {
			display: block;
		}

		.big-logo :global(svg) {
			width: 12rem;
		}

		.small-logo {
			display: none;
		}
	}

	@media (min-width: 1280px) {
		.big-logo :global(svg) {
			width: auto;
		}
	}
</style>
