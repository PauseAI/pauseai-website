<script lang="ts">
	import Image from '../Image.svelte'

	interface Props {
		src: string
		alt: string
	}

	let { src, alt }: Props = $props()
</script>

<Image {src} {alt} />
