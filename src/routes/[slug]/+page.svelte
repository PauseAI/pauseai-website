<script lang="ts">
	import { page } from '$app/stores';
	import Block from '$lib/components/Block.svelte';
	export let data: {
		slug: string;
	};
</script>

<h2>slug: {data.slug}</h2>
