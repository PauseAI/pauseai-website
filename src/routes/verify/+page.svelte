<script lang="ts">
	import { onMount } from 'svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { verificationParameter } from '$lib/config'
	import toast from 'svelte-french-toast'

	onMount(async () => {
		const urlParams = new URLSearchParams($page.url.search)
		const verificationKey = urlParams.get(verificationParameter)
		const table = urlParams.get('table')

		if (!verificationKey) {
			console.error('Verification key is missing.')
			return
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
			console.error(`Verification failed: ${errorText || response.statusText}`)
		}
	})
</script>

<h1>Processing your request...</h1>
