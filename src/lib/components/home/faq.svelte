<script lang="ts">
	import UnderlinedTitle from '$components/UnderlinedTitle.svelte'
	import FAQ from '$posts/faq.md'
	import { inview } from 'svelte-inview';

	const label_id = 'faq-title'

	let isInView: boolean = false;
	let contentIsInView: boolean = false;

  interface ChangeEventDetail {
    inView: boolean;
  }

  function handleChange(event: Event) {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      const detail = customEvent.detail as ChangeEventDetail;
      isInView = detail.inView;
    }
  }

  function handleChangeContent(event: Event) {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      const detail = customEvent.detail as ChangeEventDetail;
      contentIsInView = detail.inView;
    }
  }
</script>

<section class="faq" aria-labelledby={label_id}
  use:inview={{ unobserveOnEnter: true, rootMargin: '-20%' }}
  on:change={handleChange}>
  <div class={isInView ? 'visible' : 'hidden'}>
		<UnderlinedTitle id={label_id}
			>F.A.Q.
		</UnderlinedTitle>
	</div>
	<div use:inview={{ unobserveOnEnter: true, rootMargin: '-50%' }} on:change={handleChangeContent}>
		<FAQ />
	</div>
</section>

<style>
	.hidden {
		opacity: 0;
	}

	.visible {
	  animation: fadeIn 0.5s ease-in-out forwards;
		animation-delay: 0s;
	}

	@keyframes fadeIn {
	  0% { opacity: 0; transform: translateY(60px); }
	  100% { opacity: 1; transform: translateY(0); }
	}
</style>