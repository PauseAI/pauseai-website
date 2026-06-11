<script lang="ts">
	import OnboardingFlow from '$lib/components/onboarding/OnboardingFlow.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'

	const title = 'Get involved'
	const description =
		'Find the highest-impact way for you to help pause the development of superhuman AI.'
</script>

<PostMeta {title} {description} />

<OnboardingFlow headingLevel={1} />
