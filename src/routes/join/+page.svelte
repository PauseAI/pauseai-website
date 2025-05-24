<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import { meta } from './meta'
	import { onMount } from 'svelte'
	import NewsletterSignup from '$lib/components/NewsletterSignup.svelte'
	
	const { title, description, date } = meta

	// Load Tally script after component mounts
	onMount(() => {
		const d = document
		const w = "https://tally.so/widgets/embed.js"
		const v = function() {
			if (typeof window.Tally !== "undefined") {
				window.Tally.loadEmbeds()
			} else {
				d.querySelectorAll("iframe[data-tally-src]:not([src])").forEach((e) => {
					e.src = e.dataset.tallySrc
				})
			}
		}
		
		if (typeof window.Tally !== "undefined") {
			v()
		} else if (d.querySelector(`script[src="${w}"]`) === null) {
			const s = d.createElement("script")
			s.src = w
			s.onload = v
			s.onerror = v
			d.body.appendChild(s)
		}
	})
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>

<p>This is our nuclear moment.
Rapid AI advancement represents one of history's most consequential and dangerous technological shifts.
We demand politicians and companies pause AGI development until international safety agreements are established.
Join our global network standing for democratic oversight of AI.</p>

<p>PauseAI Global unites concerned citizens—scientists, parents, students, workers, and community leaders—who believe transformative technologies require public input before they progress beyond human control.
Whether you can spare 5 minutes (sharing posts), an hour (flyering, writing letters), 5 hours (protests, meeting politicians) or 5 days weekly (strategy development), your voice matters.</p>

<p>After signing up, join our onboarding session online or locally to learn about current actions.
The future of AI belongs to all of us.</p>

<div class="tally-form-container">
	<iframe data-tally-src="https://tally.so/embed/wbGvKe?alignLeft=1&hideTitle=1&dynamicHeight=1" loading="lazy" width="100%" height="1821" frameborder="0" marginheight="0" marginwidth="0" title="Get involved!"></iframe>
</div>

<h2>Stay Updated</h2>

<NewsletterSignup />

<style>
	.tally-form-container {
		margin: 2rem 0;
		padding: 1.5rem;
		background-color: #f8f9fa;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.tally-form-container iframe {
		border-radius: 4px;
	}
</style>