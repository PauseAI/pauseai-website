<script lang="ts">
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js'
	import { i18n } from '$lib/i18n'
	import { page } from '$app/stores'
	import Globe from 'lucide-svelte/icons/globe'
	import Navlink from './Navlink.svelte'
	import { building } from '$app/environment'
	import { onMount } from 'svelte'

	export let inverted = false

	const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

	let open = false
	let button: HTMLButtonElement
	let dropdown: HTMLDivElement

	onMount(() => {
		const clickListener = (event: MouseEvent) => {
			const node = event.target as Node | null
			if (open && !button.contains(node) && !dropdown.contains(node)) {
				open = false
			}
		}
		addEventListener('click', clickListener)
		return () => {
			removeEventListener('click', clickListener)
		}
	})
</script>

<Navlink {inverted} narrow active={open}>
	<button
		class="button reset-button"
		bind:this={button}
		on:click={(e) => {
			e.preventDefault()
			open = !open
		}}
	>
		<Globe size="0.8em" />
	</button>
</Navlink>
{#if open || building}
	<div class="card dropdown" bind:this={dropdown}>
		{#each availableLanguageTags as lang}
			<a
				href={i18n.route($page.url.pathname)}
				hreflang={lang}
				aria-current={lang === languageTag() ? 'page' : undefined}
			>
				{languageNamesInEnglish.of(lang)}
			</a>
		{/each}
	</div>
{/if}

<style>
	a {
		color: unset;
	}
	.button {
		width: 100%;
		cursor: pointer;
		padding: 0 0.5rem;
	}
	.dropdown {
		width: 200px;
		position: absolute;
		top: 100%;
		right: 0;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--text);
		font-family: var(--font-heading);
	}

	.dropdown :global(a) {
		text-decoration: none;
	}

	a[aria-current='page'] {
		color: var(--brand-subtle);
	}
</style>
