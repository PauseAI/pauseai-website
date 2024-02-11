<script>
	import { goto } from '$app/navigation'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'

	if (browser) {
		const url = $page.url
		url.pathname = url.pathname.substring(0, url.pathname.length - '.html'.length)
		goto(url, {
			replaceState: true
		})
	}
</script>
