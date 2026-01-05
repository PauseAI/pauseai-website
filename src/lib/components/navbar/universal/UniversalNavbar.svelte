<script lang="ts">
	import Logo from '$lib/components/logo.svelte'
	import { page } from '$app/stores'
	import { localizeHref } from '$lib/paraglide/runtime'
	import { emulateCqwIfNeeded } from '$lib/container-query-units'
	import { onMount } from 'svelte'

	export let inverted = false
	export let moveUp = false

	$: logo_animate = localizeHref($page.url.pathname) != '/'

	let nav: HTMLElement

	onMount(() => {
		return emulateCqwIfNeeded(nav)
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
		<slot />
	</div>
</nav>

<style>
	:root {
		--logo-offset: 2.4rem;
		--logo-width-big: 11rem;
		--logo-width-small: 10rem;
		--min-space-between: 1rem;

		--cqw: 1cqw;

		/* Vertical spacing: smooth transition from max→min below 600px viewport width */
		--vspace-max: 3rem;
		--vspace-min: 1.5rem;
		--vspace-threshold: 600px;
		--vspace: clamp(
			var(--vspace-min),
			calc(var(--vspace-min) + (100vw - var(--vspace-threshold)) / 2),
			var(--vspace-max)
		);
	}

	.inverted-header {
		color: white;
		z-index: 1;
		position: relative;
		--vspace: 1rem;
	}

	.inverted-header::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100vw;
		background: white;
		z-index: -1;
		pointer-events: none;
	}

	nav {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		container-type: inline-size;
		padding: var(--vspace) 0;
	}

	nav.move-up {
		margin-top: min(-100vh, calc(-1 * var(--hero-min-height)));
		height: 0;
	}

	nav.move-up.inverted-header {
		height: auto;
		overflow: visible;
	}

	nav > * {
		margin-bottom: 0.25rem;
	}

	nav.inverted-header > * {
		margin-bottom: 0;
	}

	.inverted-header .logo-container {
		align-items: center;
	}

	.inverted-header .logo {
		display: flex;
		align-items: center;
	}

	.logo-container {
		flex-grow: 1;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;

		/* 0px or 9999px: wide value when nav wraps, else 0 */
		--wide-if-nav-wrapped: clamp(0px, calc(9999 * (105% - 100 * var(--cqw))), 9999px);
		--wide-if-nav-not-wrapped: calc(9999px - var(--wide-if-nav-wrapped));
		--max-space-between-compensation: calc((100 * var(--cqw) - var(--logo-width)) / 2);
	}

	.compensate-min-space-between {
		width: min(var(--wide-if-nav-wrapped), var(--min-space-between));
		max-width: var(--max-space-between-compensation);
	}

	.compensate-offset {
		width: min(var(--wide-if-nav-wrapped), var(--logo-offset));
	}

	.logo {
		width: clamp(var(--logo-width-small), var(--wide-if-nav-not-wrapped), var(--logo-width-big));
		margin-left: calc(-1 * var(--logo-offset));
		z-index: 1;
	}

	.min-space-between {
		width: var(--min-space-between);
		max-width: var(--max-space-between-compensation);
	}

	.space-between {
		flex-grow: 1;
		max-width: var(--wide-if-nav-not-wrapped);
	}

	.nav-links {
		position: relative;
		display: flex;
		text-transform: uppercase;
		flex-wrap: wrap;
		justify-content: center;
	}
</style>
