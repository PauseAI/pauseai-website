<script lang="ts">
	export let id = ''
</script>

<h2 {id}>
	<span>
		<slot />
	</span>
</h2>

<style>
	@media (min-width: 640px) {
		:root {
			/* Increasing thickness gorws the underline towards the top */
			--underline-thickness: 1.1875rem;
			--x-offset: 1.375rem;
			/* Vertical offset is calculated from bottom of the underline */
			--y-offset: 0.3rem;
		}

		h2 span {
			/* Create underline using background gradient */
			background-image: linear-gradient(
				transparent,
				/* Transparent from top... */ transparent calc(100% - var(--underline-thickness)),
				/* ...until the start of underline */ var(--brand) calc(100% - var(--underline-thickness)),
				/* Start of underline color */ var(--brand) 100% /* Full underline color to bottom */
			);
			background-repeat: no-repeat;

			background-size: calc(100% + var(--x-offset)) calc(100% + var(--y-offset));
			background-position: var(--x-offset) calc(var(--y-offset) * -1);

			/* Ensure background is applied consistently across line breaks */
			box-decoration-break: clone;
			-webkit-box-decoration-break: clone;

			/* Extend underline past text on the right */
			padding-right: var(--x-offset);
			/* Shift underline vertically */
			padding-bottom: var(--y-offset);
		}
	}
</style>
