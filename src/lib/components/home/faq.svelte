<script lang="ts">
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	import FAQ from '$posts/faq.md'
	import Fly from '$components/Fly.svelte'

	const label_id = 'faq-title'
</script>

<section class="faq" aria-labelledby={label_id}>
	<Fly>
		<UnderlinedTitle id={label_id}>F.A.Q.</UnderlinedTitle>
	</Fly>
	<FAQ />
</section>
