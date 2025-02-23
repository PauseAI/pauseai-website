<script lang="ts">
	import SearchIcon from 'lucide-svelte/icons/search'
	import Modal from './Modal.svelte'
	import Search from './Search.svelte'
	import Navlink from './Navlink.svelte'
	import { onNavigate } from '$app/navigation'

	export let inverted = false

	let open = false

	onNavigate(() => {
		open = false
	})
</script>

<Navlink {inverted} narrow ariaLabel="Search">
	<button class="reset-button" on:click={() => (open = true)}>
		<SearchIcon size="0.8em" />
	</button>
</Navlink>

{#if open}
	<Modal bind:open focus={false} style="top: 2.5rem; left: 50%; transform: translateX(-50%);">
		<h2 slot="title">Search</h2>
		<Search />
	</Modal>
{/if}

<style>
	button {
		cursor: pointer;
		padding: 0 0.5rem;
	}
</style>
