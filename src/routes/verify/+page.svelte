<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import toast from 'svelte-french-toast'
	import Processing from '$lib/components/Processing.svelte'

	let errorMessage: string | undefined

	onMount(async () => {
		try {
			const apiUrl = `/api/verify${$page.url.search}`

			const response = await fetch(apiUrl)
			if (response.ok) {
				toast.success('Your email has been verified!')
				goto('/')
			} else {
				const errorText = await response.text()
				throw new Error(`Verification failed: ${errorText || response.statusText}`)
			}
		} catch (error) {
			if (error instanceof Error) errorMessage = error.message
			else errorMessage = 'Verification failed with unexpected error.'
			throw error
		}
	})
</script>

<Processing {errorMessage} />
