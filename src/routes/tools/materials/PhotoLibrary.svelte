<script lang="ts">
	import { LIBRARY_PHOTOS, type LibraryPhoto } from '$lib/materials/photos'

	interface Props {
		/** The library photo in use, if one is. */
		currentId: string | null
		onPick: (item: LibraryPhoto) => void
	}

	let { currentId, onPick }: Props = $props()
</script>

<!-- The library's photos, as buttons. -->
<div class="photos">
	{#each LIBRARY_PHOTOS as item (item.id)}
		<button
			type="button"
			class="photo"
			aria-label={item.label}
			aria-pressed={currentId === item.id}
			title={item.label}
			onclick={() => onPick(item)}
			style:background-image={`url(${item.thumb})`}
		></button>
	{/each}
</div>

<style>
	.photos {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.photo {
		aspect-ratio: 4 / 3;
		padding: 0;
		border: 1px solid var(--grey-300);
		border-radius: 6px;
		background-color: var(--bg-subtle);
		background-position: center;
		background-size: cover;
		cursor: pointer;
	}

	.photo[aria-pressed='true'] {
		border-color: var(--brand);
		box-shadow: 0 0 0 2px var(--brand);
	}

	.photo:focus-visible {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}
</style>
