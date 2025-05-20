<script>
	import './Card.css'

	export let className = ''
</script>

<div class="card {className}">
	<slot />
</div>
