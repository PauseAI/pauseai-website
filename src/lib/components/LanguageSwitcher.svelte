<script lang="ts">
	import { languages } from '../../languages'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'

	$: currentLanguage = $page.url.searchParams.get('lang') || 'en'

	let isOpen = false
	let buttonElement: HTMLButtonElement

	function switchLanguage(lang: string) {
		const url = new URL(window.location.href)
		if (lang === 'en') {
			url.searchParams.delete('lang')
		} else {
			url.searchParams.set('lang', lang)
		}
		window.location.href = url.toString()
	}

	function toggleMenu() {
		isOpen = !isOpen
	}

	function handleClickOutside(event: MouseEvent) {
		if (isOpen && buttonElement && !buttonElement.contains(event.target as Node)) {
			isOpen = false
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside)
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})

	$: currentLanguageName =
		languages.find((lang) => lang.code === currentLanguage)?.name || 'English'
</script>

<div class="language-switcher">
	<button
		bind:this={buttonElement}
		class="button-to-link"
		on:click={toggleMenu}
		aria-haspopup="true"
		aria-expanded={isOpen}
	>
		{currentLanguageName} ▼
	</button>
	{#if isOpen}
		<ul class="language-menu">
			{#each languages as language}
				<li>
					<button
						class:active={currentLanguage === language.code}
						on:click={() => switchLanguage(language.code)}
					>
						{language.name}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.language-switcher {
		position: relative;
		display: inline-block;
	}

	.button-to-link {
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
		font-size: inherit;
		padding: 0;
		text-align: left;
	}

	.button-to-link:hover {
		text-decoration: underline;
	}

	.language-menu {
		position: absolute;
		top: 100%;
		left: 0;
		z-index: 1000;
		display: block;
		min-width: 120px;
		padding: 0.5rem 0;
		margin: 0.125rem 0 0;
		font-size: 0.8rem;
		color: var(--text);
		text-align: left;
		list-style: none;
		background-color: var(--bg);
		background-clip: padding-box;
		border: 1px solid var(--brand);
		border-radius: 0.25rem;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.language-menu li {
		padding: 0;
	}

	.language-menu button {
		width: 100%;
		text-align: left;
		padding: 0.5rem 1rem;
		background: none;
		border: none;
		color: var(--text);
		cursor: pointer;
	}

	.language-menu button:hover {
		background-color: var(--bg-subtle);
	}

	.language-menu button.active {
		font-weight: bold;
		color: var(--brand);
	}
</style>
