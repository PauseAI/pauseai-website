<script lang="ts">
	import { onMount } from 'svelte'
	import { dev } from '$app/environment'
	import { page } from '$app/state'
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import {
		isOnboardingLocale,
		setOnboardingLocale,
		getMessages
	} from '$lib/components/onboarding/i18n.svelte'
	import { loadChapterSiteCountry } from '$lib/components/onboarding/chapterShare'

	// Query params read here (locale, country, city, source, languages, bg) are
	// listed in CACHE_VARY_PARAMS in +page.server.ts for the CDN cache key. Add
	// any new one there too.
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

	// Set when the referrer host matches a chapter's own website, so the
	// chapter question can drop the "separate organisation" disclosure that
	// makes sense on the global site but reads as a double confirmation when
	// the visitor is already on that chapter's page. See chapterShare.ts.
	let chapterSiteCountry = $state<string | null>(null)

	// DEV-only override for local testing, since a real cross-origin referrer
	// can't be faked without actually serving a test page from a chapter's own
	// domain: ?dev_chapter_site=Germany forces the detected chapter straight to
	// a country name, skipping the referrer match in onMount below. `dev` is a
	// build-time constant, so this block is stripped from production bundles —
	// it never runs on pauseai.info.
	let devChapterSite: string | null = null
	if (dev) {
		$effect(() => {
			devChapterSite = page.url.searchParams.get('dev_chapter_site')
			if (devChapterSite) chapterSiteCountry = devChapterSite
		})
	}

	onMount(() => {
		if (window.self === window.top) return

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
					if (!devChapterSite) {
						void loadChapterSiteCountry(ref.hostname).then((country) => {
							chapterSiteCountry = country
						})
					}
				}
			} catch {
				// Unparseable referrer — leave attribution to ?source= or nothing.
			}
		}
	})

	// Tell the host page a signup completed, so it can fire its own conversion
	// tracking (a cross-origin host can't see inside the iframe). No form data in
	// the payload; '*' is fine for the same reason as the height message. Keyed
	// by `event`, so it never collides with the height messages (see the embed layout).
	function reportSignup() {
		if (window.parent !== window) {
			window.parent.postMessage({ event: 'onboarding_signup_complete', version: 1 }, '*')
		}
	}

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

<svelte:head>
	{#if background}
		<!-- The whole document, so the layout's padding around the form takes the colour too. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- `background` is a hex value or a bare colour name -->
		{@html `<${'style'}>:root,:root body{background-color:${background}}</style>`}
	{/if}
</svelte:head>

<OnboardingFlow
	{initialCountry}
	{initialCity}
	{initialLanguages}
	{initialSource}
	{chapterSiteCountry}
	onSignup={reportSignup}
/>
