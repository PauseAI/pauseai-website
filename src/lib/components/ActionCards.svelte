<div class="action-cards-grid">
	<slot></slot>
</div>

<style>
	.action-cards-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}
</style>
