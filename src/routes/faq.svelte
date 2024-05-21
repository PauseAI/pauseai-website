<script>
	import Accordion from '$lib/components/Accordion.svelte'
</script>

<section class="faq" aria-labelledby="faq-title">
	<h2 id="faq-title">F.A.Q.</h2>
	<Accordion id="accordion1">
		<svelte:fragment slot="head">Êtes-vous contre la technologie ?</svelte:fragment>
		<svelte:fragment slot="details">
			<p>
				In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we
				might be almost there. Superintelligence could be one innovation away, so we should tread
				carefully. In 2020, experts thought we had more than 35 years until AGI. Recent
				breakthroughs show we might be almost there. Superintelligence could be one innovation away,
				so we should tread carefully.
			</p>
		</svelte:fragment>
	</Accordion>
	<Accordion id="accordion2">
		<svelte:fragment slot="head">
			Pensez-vous vraiment que le développement de l’IA peut être mise en pause ?
		</svelte:fragment>
		<svelte:fragment slot="details">
			<p>
				In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we
				might be almost there. Superintelligence could be one innovation away, so we should tread
				carefully. In 2020, experts thought we had more than 35 years until AGI. Recent
				breakthroughs show we might be almost there. Superintelligence could be one innovation away,
				so we should tread carefully.
			</p>
		</svelte:fragment>
	</Accordion>
</section>
