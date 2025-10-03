<script lang="ts">
	import Image from '../Image.svelte'

	export let src: string
	export let alt: string
</script>

<Image {src} {alt} />
