<script>
	export let className = ''
</script>

<div class="card {className}">
	<slot />
</div>

<style>
	.card {
		border-radius: 5px;
		box-shadow: 0px 5px 20px 0px rgb(0, 0, 0, 0.1);
		background-color: var(--bg-secondary);
	}
</style>
