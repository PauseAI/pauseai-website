<span>
	<slot />
</span>

<style>
	span {
		position: relative;
	}

	span::after {
		content: '';
		position: absolute;
		left: 0;
		bottom: 0.4rem;
		width: 100%;
		height: 4px;
		background-color: var(--brand);
	}
</style>
