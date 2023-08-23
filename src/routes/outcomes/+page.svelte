<script lang="ts">
	import TreeNode from './TreeNode.svelte'
	import { tree } from './tree'
</script>

<h1>AI outcomes</h1>
<TreeNode node={tree} />

<style>
	button {
		margin-top: 2rem;
	}
</style>
