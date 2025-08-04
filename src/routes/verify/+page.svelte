<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { verificationParameter } from '$lib/config'
	import toast from 'svelte-french-toast'
	import Processing from '$lib/components/Processing.svelte'

	let errorMessage: string | undefined

	onMount(async () => {
		try {
			const urlParams = new URLSearchParams($page.url.search)
			const verificationKey = urlParams.get(verificationParameter)
			const table = urlParams.get('table')

			if (!verificationKey) {
				throw new Error('Verification key is missing.')
			}

			const apiSearchParams = new URLSearchParams()
			apiSearchParams.append(verificationParameter, verificationKey)
			if (table) {
				apiSearchParams.append('table', table)
			}
			const apiUrl = `/api/verify?${apiSearchParams.toString()}`

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
