<script lang="ts">
	import { page } from '$app/state'
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'

	const title = 'Get involved'
	const description =
		'Find the highest-impact way for you to help pause the development of superhuman AI.'

	const initialCountry = $derived(page.url.searchParams.get('country') ?? '')

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

<div class="embed-wrap" style:background-color={background || undefined}>
	<OnboardingFlow {initialCountry} />
</div>

<style>
	.embed-wrap {
		padding: 1rem;
		min-height: 100dvh;
		box-sizing: border-box;
	}
</style>
