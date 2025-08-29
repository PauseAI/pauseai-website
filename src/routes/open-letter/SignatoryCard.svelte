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
	function getPortraitPath(signatory: { portrait?: string }) {
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
		background: rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		border-radius: 20px;
		padding: 1.25rem 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		position: relative;
		min-height: 200px;
		overflow: hidden;
	}

	.signatory-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.signatory-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		border-color: var(--brand);
		background: rgba(255, 255, 255, 0.08);
	}

	.signatory-card:hover::before {
		opacity: 1;
	}

	.portrait-container,
	.portrait-placeholder {
		position: relative;
		margin-bottom: 0.5rem;
	}

	.portrait {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		object-fit: cover;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
	}

	.portrait-placeholder {
		width: 140px;
		height: 140px;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.initials {
		font-weight: bold;
		font-size: 2.2rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.details {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: auto;
		padding-top: 0.5rem;
	}

	.name {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: white;
		line-height: 1.3;
	}

	.type {
		font-size: 0.8rem;
		color: var(--brand);
		font-weight: 500;
		letter-spacing: 0.05em;
		opacity: 0.9;
	}

	@media (max-width: 600px) {
		.signatory-card {
			padding: 1rem 0.5rem;
			min-height: 180px;
		}

		.portrait,
		.portrait-placeholder {
			width: 90px;
			height: 90px;
			margin-bottom: 0.4rem;
		}

		.initials {
			font-size: 1.6rem;
		}

		.name {
			font-size: 0.85rem;
		}

		.type {
			font-size: 0.7rem;
		}
	}
</style>
