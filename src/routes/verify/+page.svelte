<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import toast from 'svelte-french-toast'

	onMount(async () => {
		const apiUrl = `/api/verify${$page.url.search}`

		const response = await fetch(apiUrl)
		if (response.ok) {
			toast.success('Your email has been verified!')
			goto('/')
		} else {
			const errorText = await response.text()
			console.error(`Verification failed: ${errorText || response.statusText}`)
		}
	})
</script>

<h1>Processing your request...</h1>
