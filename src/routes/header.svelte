<script lang="ts">
	import NavLink from '$lib/components/Navlink.svelte'
	import Logo from '$lib/components/logo.svelte'
	import { botName } from '$lib/config'
	import { page } from '$app/stores'
	import SearchIcon from 'lucide-svelte/icons/search'
	import { initializeCqwResizeObserver } from '$lib/container-query-units'
	import { onMount } from 'svelte'
	const enableBot = false

	export let inverted = false
	export let moveUp = false

	$: logo_animate = $page.url.pathname != '/'

	let nav: HTMLElement

	onMount(() => {
		if (CSS.supports('container-type: inline-size')) return
		const observer = initializeCqwResizeObserver(nav)
		return () => observer.disconnect()
	})
</script>

<nav class:inverted-header={inverted} class:move-up={moveUp} bind:this={nav}>
	<div class="logo-container">
		<div class="compensate-min-space-between" />
		<div class="compensate-offset" />
		<a href="/" class="logo">
			<Logo animate={logo_animate} {inverted} />
		</a>
		<div class="min-space-between" />
		<div class="space-between" />
	</div>

	<div class="nav-links">
		<NavLink {inverted} first href="/learn">Learn</NavLink>
		<NavLink {inverted} href="/proposal">Proposal</NavLink>
		<NavLink {inverted} href="/events">Events</NavLink>
		<NavLink {inverted} href="/faq">FAQ</NavLink>
		<NavLink {inverted} href="/action">Act</NavLink>
		<NavLink {inverted} href="/donate">Donate</NavLink>
		{#if enableBot}
			<NavLink {inverted} href="/chat">{botName}</NavLink>
		{/if}
		<!-- <NavLink href="/about">About</NavLink> -->
		<NavLink {inverted} c2a href="/join">Join</NavLink>
		<NavLink {inverted} href="/search" ariaLabel="Search"><SearchIcon size="0.8em" /></NavLink>
	</div>
</nav>

<style>
	:root {
		--logo-offset: 2.4rem;
		--logo-width-big: 11rem;
		--logo-width-small: 10rem;
		--min-space-between: 3rem;

		--cqw: 1cqw;
	}

	.inverted-header {
		color: white;
		z-index: 1;
		--text: white;
	}

	nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		container-type: inline-size;
		padding-top: 3rem;
	}

	nav.move-up {
		margin-top: -100vh;
		height: 0;
	}

	nav > * {
		margin-bottom: 1rem;
	}

	.logo-container {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;

		--big-number: 9999;
		/** 1px if desktop, 0px if mobile */
		--check-desktop: clamp(0px, calc(var(--big-number) * (100 * var(--cqw) - 105%)), 1px);
		--check-mobile: calc(1px - var(--check-desktop));
		--max-space-between-compensation: calc((100 * var(--cqw) - var(--logo-width)) / 2);
	}

	.compensate-min-space-between {
		width: min(calc(var(--big-number) * var(--check-mobile)), var(--min-space-between));
		max-width: var(--max-space-between-compensation);
	}

	.compensate-offset {
		width: min(calc(var(--big-number) * var(--check-mobile)), var(--logo-offset));
	}

	.logo {
		width: clamp(
			var(--logo-width-small),
			calc(var(--big-number) * var(--check-desktop)),
			var(--logo-width-big)
		);
		margin-left: calc(-1 * var(--logo-offset));
	}

	.min-space-between {
		width: var(--min-space-between);
		max-width: var(--max-space-between-compensation);
	}

	.space-between {
		flex-grow: 1;
		max-width: calc(var(--big-number) * var(--check-desktop));
	}

	.nav-links {
		display: flex;
		text-transform: uppercase;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
