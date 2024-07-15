<script lang="ts">
	const width = 468
	const height = 74
</script>

<svg
	{width}
	{height}
	viewBox={`0 0 ${width.toString()}} ${height.toString()}`}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<path d="M0.5 74H468V0C397 62 0.5 74 0.5 74Z" fill="white" />
</svg>

<style>
	svg {
		position: absolute;
		bottom: 0;
		right: 0;
		z-index: 1;
		transform: scale(0.4);
		transform-origin: bottom right;
	}
	@media (min-width: 480px) {
		svg {
			transform: scale(0.6);
		}
	}
	@media (min-width: 768px) {
		svg {
			transform: scale(0.8);
		}
	}
	@media (min-width: 1024px) {
		svg {
			transform: scale(1);
		}
	}
</style>
