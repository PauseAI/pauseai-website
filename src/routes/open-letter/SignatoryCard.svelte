<script lang="ts">
	export let signatory: {
		name: string
		displayName?: string
		type: string
		portrait?: string
		party?: string
		chamber?: string
	}

	// Determine the portrait path based on chamber and processed images
	function getPortraitPath(signatory) {
		if (!signatory.portrait) return null

		// Convert from original path to processed path
		const originalPath = signatory.portrait
		if (originalPath.includes('/portraits/signatories/')) {
			return originalPath.replace('/portraits/signatories/', '/open-letter/portraits/processed/')
		}

		return null
	}

	const portraitPath = getPortraitPath(signatory)
	const displayName = signatory.displayName || signatory.name

	// Convert Lord/Baroness to Peer for display
	function getDisplayType(type: string) {
		if (type === 'Lord' || type === 'Baroness') {
			return 'Peer'
		}
		return type
	}

	const displayType = getDisplayType(signatory.type)
</script>

<div class="signatory-card">
	{#if portraitPath}
		<div class="portrait-container">
			<img src={portraitPath} alt="Portrait of {displayName}" class="portrait" loading="lazy" />
		</div>
	{:else}
		<div class="portrait-placeholder">
			<div class="initials">
				{displayName
					.split(' ')
					.map((n) => n[0])
					.join('')
					.slice(0, 2)}
			</div>
		</div>
	{/if}

	<div class="details">
		<h4 class="name">{displayName}</h4>
		<span class="type">{displayType}</span>
	</div>
</div>

<style>
	.signatory-card {
		background: var(--bg);
		border-radius: 8px;
		padding: 1rem;
		border: 1px solid var(--border-color);
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		position: relative;
	}

	.signatory-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		border-color: var(--brand);
	}

	.portrait-container,
	.portrait-placeholder {
		position: relative;
		margin-bottom: 1rem;
	}

	.portrait {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		object-fit: cover;
	}

	.portrait-placeholder {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		background: var(--bg-subtle);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.initials {
		font-weight: bold;
		font-size: 2.5rem;
		color: var(--text-muted);
	}

	.details {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.name {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text);
		line-height: 1.3;
	}

	.type {
		font-size: 0.85rem;
		color: var(--text-muted);
		font-weight: 500;
	}

	@media (max-width: 600px) {
		.portrait,
		.portrait-placeholder {
			width: 100px;
			height: 100px;
		}

		.initials {
			font-size: 1.8rem;
		}

		.name {
			font-size: 0.9rem;
		}

		.type {
			font-size: 0.8rem;
		}
	}
</style>
