<script>
	import { page } from '$app/stores'
	const { status, error } = $page
</script>

<div class="error">
	<h1>{status}: {error?.message}</h1>
</div>

<style>
	.error {
		height: 100%;
		display: grid;
		place-content: center;
	}
</style>
