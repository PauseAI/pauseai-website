<script lang="ts">
	export let animate = false
	export let fill_pause = 'black'
	export let fill_circle = '#FF9416'
	export let fill_ai = '#FF9416'
	export let height: number | undefined = undefined
	export let width: number | undefined = undefined
	export let only_circle = false

	const baseWidth = 255
	const baseHeight = 66
	const aspectRatio = baseWidth / baseHeight

	$: if (width === undefined) {
		height ??= baseHeight
		width = only_circle ? height : height * aspectRatio
	}

	$: if (height === undefined) {
		width ??= baseWidth
		height = only_circle ? width : width / aspectRatio
	}
</script>

<svg
	class="logo"
	class:logo-animate={animate}
	{width}
	{height}
	fill="none"
	role="img"
	xmlns="http://www.w3.org/2000/svg"
>
	<title>Pause IA logo</title>
	<path
		class="logo-circle"
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M66 33a33 33 0 1 1-66 0 33 33 0 0 1 66 0ZM20.79 18.81h8.25v29.37h-8.25zm23.76 0H36.3v29.37h8.25z"
		fill={fill_circle}
	/>
	{#if !only_circle}
		<path
			class="logo-pause"
			d="M56.59 47V19h13.48c2.62 0 4.87.43 6.76 1.28a9.96 9.96 0 0 1 4.44 3.68 9.92 9.92 0 0 1 1.56 5.6c0 2.16-.52 4.03-1.56 5.6a10.32 10.32 0 0 1-4.44 3.68 16.37 16.37 0 0 1-6.76 1.28h-8.24l4.2-4.04V47Zm9.44-9.88-4.2-4.28h7.64c1.3 0 2.27-.3 2.88-.88a3.1 3.1 0 0 0 .96-2.4 3.1 3.1 0 0 0-.96-2.4c-.6-.59-1.57-.88-2.88-.88h-7.64l4.2-4.28zM81.49 47l12.24-28H103l12.24 28h-9.76l-9.04-23.52h3.68L91.09 47Zm7.28-4.88 2.4-6.8h12.88l2.4 6.8zm40.8 5.52c-4.3 0-7.64-1.16-10.04-3.48-2.4-2.32-3.6-5.57-3.6-9.76V19h9.44v15.12c0 2.13.4 3.65 1.16 4.56a3.94 3.94 0 0 0 3.12 1.32c1.34 0 2.38-.44 3.12-1.32.78-.9 1.16-2.43 1.16-4.56V19h9.28v15.4c0 4.19-1.2 7.44-3.6 9.76-2.4 2.32-5.74 3.48-10.04 3.48zm28.4 0a28.6 28.6 0 0 1-6.8-.8 19.34 19.34 0 0 1-5.4-2.08l3.05-6.88a20.2 20.2 0 0 0 4.44 1.88c1.65.45 3.25.68 4.8.68.9 0 1.6-.05 2.12-.16.53-.13.92-.3 1.16-.52.24-.24.36-.52.36-.84 0-.5-.28-.9-.84-1.2a8.5 8.5 0 0 0-2.24-.72 75 75 0 0 0-3-.64 33 33 0 0 1-3.32-.92c-1.1-.37-2.1-.87-3.04-1.48a7.05 7.05 0 0 1-2.2-2.4 7.69 7.69 0 0 1-.84-3.76c0-1.73.48-3.3 1.44-4.72a10.07 10.07 0 0 1 4.36-3.44 18.05 18.05 0 0 1 7.24-1.28c1.9 0 3.76.2 5.6.6 1.84.4 3.5 1.01 4.96 1.84l-2.84 6.84a21.28 21.28 0 0 0-4.04-1.56 14.35 14.35 0 0 0-3.76-.52c-.9 0-1.62.08-2.16.24a2.5 2.5 0 0 0-1.16.64 1.4 1.4 0 0 0-.32.88c0 .48.28.87.84 1.16.56.27 1.3.5 2.2.68l3.04.6c1.12.21 2.23.5 3.32.88 1.1.37 2.1.87 3 1.48a6.91 6.91 0 0 1 2.24 2.4c.56.99.84 2.21.84 3.68 0 1.7-.5 3.28-1.48 4.72a10.17 10.17 0 0 1-4.32 3.44 17.92 17.92 0 0 1-7.24 1.28zm24.5-18.24h12.48v6.8h-12.48zm.64 10.48h14V47h-23.28V19h22.76v7.12H183.1z"
			fill={fill_pause}
		/>
		<path
			class="logo-ia"
			d="m255 47-12.24-28h-9.28l-12.24 28H231l9.04-23.52h-3.68L245.4 47Zm-7.28-4.88-2.4-6.8h-12.88l-2.4 6.8zM219.73 47V19h-9.44v28z"
			fill={fill_ai}
		/>
	{/if}
</svg>

<style>
	.logo {
		overflow: visible;
		height: 100%;
		width: 100%;
	}
	.logo-circle {
		transition: transform 0.1s ease-in-out;
		transform-origin: center;
	}
	.logo-animate:hover .logo-circle {
		transform: scale(1.1);
	}
	.logo-animate:active .logo-circle {
		fill: var(--btn-active-bg);
	}
</style>
