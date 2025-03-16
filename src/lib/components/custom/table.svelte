<div class="table-container">
	<div class="table-border">
		<table>
			<slot />
		</table>
	</div>
</div>

<style>
	* {
		--border: 2px solid black;
	}

	.table-container {
		overflow-x: auto;
	}

	.table-border {
		border: 1px solid black;
		border-radius: 0.5rem;
		overflow: hidden;
		width: fit-content;
	}

	table {
		border-collapse: collapse;
		width: 100%;
	}

	* :global(th) {
		background-color: var(--brand);
		border-bottom: var(--border);
		min-width: 100px;
	}

	* :global(th),
	* :global(td) {
		border-left: var(--border);
		padding: 0.5rem;
	}

	* :global(th:first-child),
	* :global(td:first-child) {
		border-left: none;
	}

	* :global(tr:nth-child(odd)) {
		background-color: var(--bg-subtle);
	}
</style>
