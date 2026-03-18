<script lang="ts">
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import ShareButtons from '$lib/components/ShareButtons.svelte'
	import { getCollagenUid } from '$lib/collagen'

	let uid: string | null = null

	onMount(() => {
		// Try query param first, then localStorage
		uid = $page.url.searchParams.get('uid') || getCollagenUid('sayno')
	})
</script>

<div class="share-page">
	<h1>Share the Say No Campaign</h1>
	<p>Help us reach more people and grow the movement:</p>

	<ShareButtons campaign="sayno" {uid} />
</div>

<style>
	.share-page {
		max-width: 600px;
		margin: 4rem auto;
		padding: 2rem;
		text-align: center;
	}

	h1 {
		margin-bottom: 1rem;
	}

	p {
		color: #6c757d;
		margin-bottom: 2rem;
	}
</style>
