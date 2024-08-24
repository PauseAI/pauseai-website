<script lang="ts">
	import { slide } from 'svelte/transition'
	import { page } from '$app/stores'

	export let open = false
	export let id: string

	const details_id = `${id}-details`
	const title_id = `${id}-title`
	const handleClick = () => (open = !open)

	$: if ($page.url.hash === `#${id}`) {
		open = true
	}

	import { inview } from 'svelte-inview';

	let isInView: boolean = false;

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
</script>

<div class={"accordion "+(isInView ? 'visible' : 'hidden')} {id}   use:inview={{ unobserveOnEnter: true, rootMargin: '-10%' }} on:change={handleChange}>
	<button on:click={handleClick} class="header" aria-expanded={open} aria-controls={details_id}>
		<h3 class="title" id={title_id}>
			<slot name="head" />
		</h3>

		<span class="icon">{open ? '\u2212' : '+'}</span>
	</button>

	{#if open}
		<div class="details textVisible" transition:slide id={details_id} aria-labelledby={title_id}>
			<slot name="details" />
		</div>
	{/if}
</div>

<style>
	.accordion:global(:not(:last-child)) {
		border-bottom: solid 2px #e6e6e6;
	}

	.header {
		cursor: pointer;
		display: flex;
		width: 100%;
		border: none;
		background-color: transparent;
		text-align: left;
		align-items: center;
		padding: 1.5rem 0;
	}

	.header .title {
		flex: 1;
	}

	.details {
		padding: 2rem 0 1.5rem 0;
	}

	.icon {
		font-size: 3rem;
		font-weight: 200;
		line-height: 0;
		margin-left: 1rem;
	}


	.hidden {
		opacity: 0;
	}

	.visible {
		animation: fadeIn 0.5s ease-in-out forwards;
		animation-delay: 0s;
	}

	.textVisible {
		animation: fadeInText 0.3s ease-in-out forwards;
		animation-delay: 0s;
	}

	@keyframes fadeIn {
	  0% { opacity: 0; transform: translateY(60px); }
	  100% { opacity: 1; transform: translateY(0); }
	}

	@keyframes fadeInText {
	  0% { opacity: 0; }
	  100% { opacity: 1; }
	}
</style>
