<script lang="ts">
	import UnderlinedTitle from '$lib/components/UnderlinedTitle.svelte'
	import FAQ from '../../../posts/faq.md'

	const label_id = 'faq-title'
</script>

<section class="faq" aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>F.A.Q.</UnderlinedTitle>
	<FAQ />
</section>
