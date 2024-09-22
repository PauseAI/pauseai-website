<script lang="ts">
	import { page } from '$app/stores'

	export let href: string
	export let c2a = false
	export let ariaLabel: string | undefined = undefined
	export let customClass: string = '' // Add this line

	$: isActive = $page.url.pathname === href
	$: currentLang = $page.url.searchParams.get('lang') || 'en'
	$: hrefWithLang =
		currentLang !== 'en' ? `${href}${href.includes('?') ? '&' : '?'}lang=${currentLang}` : href
</script>

<a
	href={hrefWithLang}
	class:active={isActive}
	class:c2a
	class={customClass}
	data-sveltekit-preload-data="hover"
	aria-label={ariaLabel}
>
	<slot />
</a>

<style>
	.c2a {
		color: var(--brand);
	}
</style>
