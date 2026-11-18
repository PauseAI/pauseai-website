<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		/**
		 * Keeps the preview in view while the form scrolls: beside the form on wide screens, above it on phones. The QR
		 * tool's small preview isn't pinned.
		 */
		pinned?: boolean
		preview: Snippet
		controls: Snippet
	}

	let { pinned = true, preview, controls }: Props = $props()
</script>

<!-- A studio: the preview column, then the form column. -->
<div class="studio" class:pinned>
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

	@media (max-width: 899px) {
		.pinned .preview {
			position: sticky;
			top: 0;
			z-index: 5;
			padding: 0.5rem 0;
			background-color: var(--bg);
		}
	}
</style>
