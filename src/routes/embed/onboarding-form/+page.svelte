<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { page } from '$app/state'
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import * as m from '$lib/paraglide/messages.js'
	import { isLocale, setLocale } from '$lib/paraglide/runtime'

	$effect(() => {
		const locale = page.url.searchParams.get('locale')
		if (locale && isLocale(locale)) setLocale(locale)
	})

	const title = $derived(m.onboarding_page_title())
	const description = $derived(m.onboarding_page_description())

	const initialCountry = $derived(page.url.searchParams.get('country') ?? '')

	// When iframed, report the rendered height to the host page so it can
	// resize the iframe ({ height: number } via postMessage). '*' target is
	// fine — the height is not sensitive and the host validates event.origin.
	// The ResizeObserver covers step changes, validation errors, and window
	// resizes without hooking each individually.
	let embedded = $state(false)

	onMount(() => {
		embedded = window.self !== window.top
		if (!embedded) return

		const sendHeight = () => {
			window.parent.postMessage({ height: Math.ceil(document.documentElement.scrollHeight) }, '*')
		}

		const observer = new ResizeObserver(sendHeight)
		// `embedded` drops the wrapper's min-height; measure after that applies.
		void tick().then(() => {
			sendHeight()
			observer.observe(document.documentElement)
			observer.observe(document.body)
		})
		return () => observer.disconnect()
	})

	// Optional ?bg= so the embed blends into the host page — hex (with or
	// without #) or a CSS color name. Anything else is ignored, which also
	// keeps arbitrary CSS out of the inline style.
	const background = $derived.by(() => {
		const value = page.url.searchParams.get('bg')?.trim() ?? ''
		if (/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
			return value.startsWith('#') ? value : `#${value}`
		}
		if (/^[a-z]{1,30}$/i.test(value)) return value
		return ''
	})
</script>

<PostMeta {title} {description} />

<div class="embed-wrap" class:embedded style:background-color={background || undefined}>
	<OnboardingFlow {initialCountry} />
</div>

<style>
	.embed-wrap {
		padding: 1rem;
		min-height: 100dvh;
		box-sizing: border-box;
	}

	/* The host sizes the iframe to our reported height — a viewport-based
	   min-height would ratchet it upward and never let it shrink. */
	.embed-wrap.embedded {
		min-height: 0;
	}
</style>
