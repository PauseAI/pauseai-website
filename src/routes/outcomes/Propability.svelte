<script lang="ts">
	export let probability: number = 0.5
	$: num = probability * 100
	$: decimals = num < 10 ? 1 : 0
</script>

{num.toFixed(decimals)}%
