<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { page } from '$app/state'
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import {
		isOnboardingLocale,
		setOnboardingLocale,
		getMessages
	} from '$lib/components/onboarding/i18n.svelte'

	$effect(() => {
		const locale = page.url.searchParams.get('locale')
		if (locale && isOnboardingLocale(locale)) setOnboardingLocale(locale)
	})

	const msgs = $derived(getMessages())
	const title = $derived(msgs.onboarding_page_title)
	const description = $derived(msgs.onboarding_page_description)

	const initialCountry = $derived(page.url.searchParams.get('country') ?? '')
	const initialCity = $derived(page.url.searchParams.get('city') ?? '')
	// Signup-source attribution, written to `Source page` on the server (create
	// only; the server sanitises it again, so this is only a precedence filter):
	//  - explicit ?source= wins — how a partner labels its embed
	//  - otherwise, when iframed, fall back to the host page from document.referrer
	//    (`example.org/join`), so an embed self-attributes with no param at all.
	//    Set in onMount because document.referrer isn't available during SSR.
	// The strip mirrors the server's accepted charset (see cleanSource): a
	// ?source= that is all punctuation / non-Latin sanitises to nothing there, so
	// don't let it shadow the document.referrer fallback here.
	const explicitSource = $derived(
		(page.url.searchParams.get('source') ?? '').replace(/[^\w \-./]/g, '').trim()
	)
	let referrerSource = $state('')
	const initialSource = $derived(explicitSource || referrerSource)
	const initialLanguages = $derived(
		(page.url.searchParams.get('languages') ?? '')
			.split(',')
			.map((l) => l.trim())
			.filter(Boolean)
	)

	// When iframed, report the rendered height to the host page so it can
	// resize the iframe ({ height: number } via postMessage). '*' target is
	// fine — the height is not sensitive and the host validates event.origin.
	// The ResizeObserver covers step changes, validation errors, and window
	// resizes without hooking each individually.
	let embedded = $state(false)

	onMount(() => {
		embedded = window.self !== window.top
		if (!embedded) return

		// The host page's URL, for source attribution when no ?source= was given.
		// A cross-origin parent can't be read via script, but the browser still
		// exposes its URL here as a plain string (unless the host sends
		// Referrer-Policy: no-referrer, in which case this is empty and the
		// submission records no `Source page`).
		if (document.referrer) {
			try {
				const ref = new URL(document.referrer)
				// Ignore a referrer that is our own embed route (a redirect chain, or
				// the page linking to itself) — it says nothing about the host. The
				// host check keeps a real partner page at a similar path usable.
				const isSelfEmbed =
					ref.host === window.location.host && ref.pathname.startsWith('/embed/onboarding-form')
				if (!isSelfEmbed) {
					referrerSource = `${ref.host}${ref.pathname}`.replace(/\/+$/, '')
				}
			} catch {
				// Unparseable referrer — leave attribution to ?source= or nothing.
			}
		}

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
	<OnboardingFlow {initialCountry} {initialCity} {initialLanguages} {initialSource} />
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
