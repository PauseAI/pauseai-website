<script lang="ts">
	import { page } from '$app/stores';
	import Block from '$lib/components/Block.svelte';
	import type { SvelteComponent } from 'svelte/internal';
	export let data: {
		slug: string;
		post: SvelteComponent;
	};
</script>

<h2>slug: {data.slug}</h2>

<post />1
