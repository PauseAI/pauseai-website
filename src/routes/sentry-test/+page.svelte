<script lang="ts">
	let serverStatus = $state<'idle' | 'loading' | 'done'>('idle')
	let serverError = $state<string | null>(null)
	let clientError = $state<string | null>(null)

	async function triggerServerError() {
		serverStatus = 'loading'
		serverError = null
		try {
			const res = await fetch('/api/_test/sentry-error')
			if (!res.ok) {
				serverError = `Server responded with ${res.status} ${res.statusText}`
			}
		} catch (e) {
			serverError = e instanceof Error ? e.message : String(e)
		} finally {
			serverStatus = 'done'
		}
	}

	function triggerClientError() {
		clientError = null
		try {
			throw new Error('Sentry test: intentional client-side error')
		} catch (e) {
			clientError = e instanceof Error ? e.message : String(e)
			// Re-throw so Sentry's global handler captures it
			throw e
		}
	}

	async function triggerBoth() {
		await triggerServerError()
		triggerClientError()
	}
</script>

<svelte:head>
	<title>Sentry Test Page</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Sentry Test Page</h1>
<p>Use the buttons below to trigger errors that should be captured by Sentry.</p>

<section>
	<h2>Server Error</h2>
	<p>Fetches <code>/api/_test/sentry-error</code>, which throws on the server.</p>
	<button id="btn-server-error" onclick={triggerServerError} disabled={serverStatus === 'loading'}>
		{serverStatus === 'loading' ? 'Fetching…' : 'Trigger server error'}
	</button>
	{#if serverError}
		<p class="result error">⚠ {serverError}</p>
	{:else if serverStatus === 'done'}
		<p class="result ok">✓ Request completed (check Sentry for the server-side event)</p>
	{/if}
</section>

<section>
	<h2>Client Error</h2>
	<p>Throws an unhandled error in the browser, captured by Sentry's global handler.</p>
	<button id="btn-client-error" onclick={triggerClientError}>Trigger client error</button>
	{#if clientError}
		<p class="result error">⚠ {clientError} (check Sentry for the client-side event)</p>
	{/if}
</section>

<section>
	<h2>Both</h2>
	<p>Triggers the server error first, then the client error.</p>
	<button id="btn-both" onclick={triggerBoth} disabled={serverStatus === 'loading'}>
		{serverStatus === 'loading' ? 'Running…' : 'Trigger both errors'}
	</button>
</section>

<style>
	section {
		margin-top: 2rem;
		padding: 1.5rem;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
	}

	h2 {
		margin-top: 0;
	}

	code {
		background: #f4f4f4;
		padding: 0.1em 0.4em;
		border-radius: 4px;
		font-size: 0.9em;
	}

	button {
		margin-top: 0.5rem;
		padding: 0.5rem 1.25rem;
		cursor: pointer;
		border: none;
		border-radius: 6px;
		background: #e53935;
		color: #fff;
		font-size: 0.95rem;
		font-weight: 600;
	}

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.result {
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.9rem;
	}

	.result.error {
		background: #fff3f3;
		color: #c62828;
		border: 1px solid #ffcdd2;
	}

	.result.ok {
		background: #f1f8f1;
		color: #2e7d32;
		border: 1px solid #c8e6c9;
	}
</style>
