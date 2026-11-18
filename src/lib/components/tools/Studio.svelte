<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		/**
		 * Keeps the preview in view while the form scrolls: beside the form on wide screens, above it on phones. The QR
		 * tool's small preview isn't pinned.
		 */
		pinned?: boolean
		/** On phones, pin the preview's first element above the form. Off for previews too tall to pin. */
		pinOnPhones?: boolean
		preview: Snippet
		controls: Snippet
	}

	let { pinned = true, pinOnPhones = true, preview, controls }: Props = $props()
</script>

<!-- A studio: the preview column, then the form column. In a pinned studio the preview's first element is the
     preview itself. -->
<div class="studio" class:pinned class:pin-phones={pinned && pinOnPhones}>
	<div class="preview">{@render preview()}</div>
	<div class="controls">{@render controls()}</div>
</div>

<style>
	.studio {
		display: grid;
		gap: 2rem;
		align-items: start;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		min-width: 0;
	}

	@media (min-width: 900px) {
		.studio {
			grid-template-columns: minmax(0, 1fr) 380px;
			gap: 3rem;
		}

		.pinned .preview {
			position: sticky;
			top: 1rem;
			max-height: calc(100vh - 2rem);
			overflow-y: auto;
		}
	}

	/* On phones the preview column's parts join the page's one column: the preview itself stays pinned at the top
	   while typing, and what sits under it on wide screens (checks, downloads) moves after the form, where a
	   volunteer finishes. */
	@media (max-width: 899px) {
		.pinned .preview {
			display: contents;
		}

		.pin-phones .preview > :global(:first-child) {
			position: sticky;
			top: 0;
			z-index: 5;
			padding: 0.5rem 0;
			background-color: var(--bg);
			box-shadow: 0 0 0 12px var(--bg);
		}

		.pinned .preview > :global(:not(:first-child)) {
			order: 1;
		}
	}
</style>
