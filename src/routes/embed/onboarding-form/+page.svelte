<script lang="ts">
	import { page } from '$app/state'
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'

	let { data } = $props()

	const title = 'Get involved'
	const description =
		'Find the highest-impact way for you to help pause the development of superhuman AI.'

	const initialCountry = $derived(page.url.searchParams.get('country') ?? '')
</script>

<PostMeta {title} {description} />

<div class="embed-wrap">
	<OnboardingFlow {initialCountry} live={data.live} />
</div>

<style>
	.embed-wrap {
		padding: 1rem;
	}
</style>
