<script lang="ts">
	import X from 'lucide-svelte/icons/x'
	import { page } from '$app/stores'
	import { fade } from 'svelte/transition'
	import { deLocalizeHref } from '$lib/paraglide/runtime'
	import { setItem } from '$lib/localStorage'

	export let contrast = false
	export let target: string | null = null
	export let id: string | null = null

	let dismissed = false

	function close() {
		dismissed = true
		if (id) {
			setItem(`banner_${id}_hidden`, 'true')
		}
	}

	// Hide on navigation to the target page
	$: if (target && deLocalizeHref($page.url.pathname) === target) {
		dismissed = true
	}
</script>

<svelte:head>
	{#if id}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<style>html[data-active-banner="${id}"] [data-banner-id="${id}"]{display:flex!important}</style>`}
	{/if}
</svelte:head>

{#if !dismissed}
	<div class="banner" class:contrast data-banner-id={id} transition:fade={{ duration: 200 }}>
		<span class="content">
			<slot></slot>
		</span>

		<button class="close banner-close-btn" on:click={close}>
			<X size="1.2em" />
			<span class="sr-only">Close</span>
		</button>
	</div>
{/if}

<style>
	.banner {
		position: relative;
		display: flex;
		justify-content: center;
		width: 100%;
		background-color: var(--brand);
		padding: 0.5em;
		box-sizing: border-box;
	}

	.banner.contrast {
		color: white;
		background-color: black;
	}

	.banner.contrast .close:hover {
		color: var(--brand);
	}

	.banner.contrast .content::selection {
		color: black;
		background-color: var(--brand);
	}

	.banner :global(a) {
		color: unset;
	}

	.banner :global(a:hover),
	.close:hover {
		color: var(--brand-subtle);
	}

	.content {
		text-align: center;
		margin-inline: 3rem;
	}

	@media (max-width: 40rem) {
		.content {
			margin-left: 1rem;
		}
	}

	.content::selection {
		color: var(--text);
		background-color: var(--bg-subtle);
	}

	.close {
		position: absolute;
		top: 50%;
		right: 0.75em;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0.75em;
		color: inherit;
		border-radius: 50%;
	}

	.close:hover {
		opacity: 0.8;
		background-color: rgba(0, 0, 0, 0.1);
	}

	.close:focus {
		outline: 2px solid currentColor;
	}

	/* Accessibility hidden text */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
