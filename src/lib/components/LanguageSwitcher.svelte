<script lang="ts">
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime.js'
	import { i18n } from '$lib/i18n'
	import { page } from '$app/stores'
	import Globe from 'lucide-svelte/icons/globe'
	import Navlink from './Navlink.svelte'
	import { building } from '$app/environment'

	const languageNamesInEnglish = new Intl.DisplayNames('en', { type: 'language' })

	let open = false
	let button: HTMLButtonElement
	let dropdown: HTMLDivElement
</script>

<Navlink>
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
	<div class="dropdown" bind:this={dropdown}>
		{#each availableLanguageTags as lang}
			<div>
				<a
					href={i18n.route($page.url.pathname)}
					hreflang={lang}
					aria-current={lang === languageTag() ? 'page' : undefined}
				>
					{languageNamesInEnglish.of(lang)}
				</a>
			</div>
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
	}
	.dropdown {
		width: 200px;
		position: absolute;
		top: 100%;
		right: 0;
		background-color: var(--brand);
	}
</style>
