<script lang="ts">
	import { onMount } from 'svelte'
	import type { Node, NodeInfo, Edge } from './supply-chain/types'
	import { nodes, nodeInfo, edges, categoryColors } from './supply-chain/data'
	import {
		getMaxNodesInCategory,
		getYPosition,
		getXPosition,
		calculateConnectionPoints,
		getDomain
	} from './supply-chain/utils'
	import Modal from './supply-chain/Modal.svelte'
	import NodeComponent from './supply-chain/Node.svelte'

	// Reactive state
	let selectedNodeId: string | null = null
	let selectedEdge: Edge | null = null

	// Container size state
	let graphContainer: HTMLDivElement
	let containerWidth = 1200 // default fallback
	let containerHeight = 600 // default fallback
	// Dynamic vertical spacing
	const minNodeSpacing = 80
	const verticalPadding = 40
	const horizontalPadding = 50

	function updateContainerSize() {
		if (graphContainer) {
			containerWidth = graphContainer.offsetWidth
		}
		const maxNodes = getMaxNodesInCategory(nodesByCategory)
		containerHeight = verticalPadding * 2 + (maxNodes + 1) * minNodeSpacing
	}

	onMount(() => {
		updateContainerSize()
		window.addEventListener('resize', updateContainerSize)
		return () => window.removeEventListener('resize', updateContainerSize)
	})

	// Define column positions (as fractions of width)
	const columnKeys = ['equipment', 'foundry', 'design', 'eda_memory', 'assembly', 'end'] as const
	const columns = Object.fromEntries(
		columnKeys.map((key, i) => [key, i / (columnKeys.length - 1)])
	) as Record<(typeof columnKeys)[number], number>

	// Group nodes by category
	const nodesByCategory: Record<keyof typeof columns, Node[]> = {
		equipment: [],
		foundry: [],
		design: [],
		eda_memory: [],
		assembly: [],
		end: []
	}

	function isColumnCategory(category: string): category is keyof typeof columns {
		return Object.keys(columns).includes(category)
	}

	Object.values(nodes).forEach((node) => {
		if (isColumnCategory(node.category)) {
			nodesByCategory[node.category].push(node)
		}
	})

	// Update node positions (in pixels)
	function updateNodePositions() {
		Object.entries(nodesByCategory).forEach(([category, categoryNodes]) => {
			if (!(category in columns)) return // Only position categories that have a column
			categoryNodes.forEach((node, index) => {
				node.x = getXPosition(
					columns[category as keyof typeof columns],
					containerWidth,
					horizontalPadding
				)
				node.y = getYPosition(index, categoryNodes.length, containerHeight, verticalPadding)
			})
		})
	}

	$: updateNodePositions()

	// Click handler
	function handleNodeClick(id: string) {
		selectedEdge = null // Clear selected edge if a node is clicked
		selectedNodeId = id
	}

	function handleEdgeClick(edge: Edge) {
		selectedNodeId = null // Clear selected node if an edge is clicked
		selectedEdge = edge
	}

	// Close modal
	function closeAllModals() {
		selectedNodeId = null
		selectedEdge = null
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && (selectedNodeId || selectedEdge)) {
			closeAllModals()
		}
	}

	// Add these reactive arrays for links
	$: incomingLinks = Array.from(
		new Set(
			([] as string[])
				.concat(
					...edges
						.filter((e) => e.target === selectedNodeId && e.links)
						.map((e) => (e.links as string[]) || [])
				)
				.flat()
		)
	)

	$: outgoingLinks = Array.from(
		new Set(
			([] as string[])
				.concat(
					...edges
						.filter((e) => e.source === selectedNodeId && e.links)
						.map((e) => (e.links as string[]) || [])
				)
				.flat()
		)
	)
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="container">
	<div class="header">
		<h2 class="title">AI Chip Supply Chain</h2>
		<p class="description">Click on any company or connection to learn more about it!</p>
	</div>

	<div class="graph-scroll">
		<div
			class="graph-container"
			bind:this={graphContainer}
			style="height: {containerHeight}px; width: {containerWidth}px; display: inline-block;"
		>
			<!-- Edges -->
			<svg
				class="edges"
				width={containerWidth}
				height={containerHeight}
				style="width: {containerWidth}px; height: {containerHeight}px;"
			>
				<defs>
					<marker
						id="arrowhead"
						markerWidth="10"
						markerHeight="7"
						refX="10"
						refY="3.5"
						orient="auto"
						stroke="#666"
						markerUnits="userSpaceOnUse"
					>
						<polygon points="0 0, 10 3.5, 0 7" fill="#666" />
					</marker>
				</defs>
				{#each edges as edge}
					{@const points = calculateConnectionPoints(nodes[edge.source], nodes[edge.target])}
					<g class="edge-group" on:click={() => handleEdgeClick(edge)}>
						<line
							x1={points.startX}
							y1={points.startY}
							x2={points.endX}
							y2={points.endY}
							stroke="transparent"
							stroke-width="10"
							pointer-events="stroke"
						/>
						<line
							x1={points.startX}
							y1={points.startY}
							x2={points.endX}
							y2={points.endY}
							stroke="#666"
							stroke-width={(edge.weight || 1) / 2.5 + 1}
							marker-end="url(#arrowhead)"
							stroke-dasharray="4,2"
							pointer-events="none"
						/>
					</g>
				{/each}
			</svg>
			<!-- Nodes -->
			{#each Object.values(nodes) as node}
				<NodeComponent
					label={node.label}
					category={node.category}
					x={node.x ?? 0}
					y={node.y ?? 0}
					onClick={() => handleNodeClick(node.id)}
				/>
			{/each}
		</div>
	</div>

	<!-- Node Modal -->
	{#if selectedNodeId && nodeInfo[selectedNodeId]}
		<Modal
			title={nodeInfo[selectedNodeId].title}
			description={nodeInfo[selectedNodeId].description}
			onClose={closeAllModals}
		>
			<ul class="modal-details">
				{#each nodeInfo[selectedNodeId].details as detail}
					<li class="modal-detail-item">{detail}</li>
				{/each}
			</ul>

			{#if edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId).length > 0}
				<div class="modal-connections">
					{#if edges.filter((e) => e.target === selectedNodeId).length > 0}
						<div class="connection-section">
							<h4 class="modal-subtitle">Suppliers:</h4>
							<ul class="connection-list">
								{#each edges.filter((e) => e.target === selectedNodeId) as edge}
									<li class="connection-item">
										<button
											class="connection-button"
											on:click={(e) => {
												handleNodeClick(edge.source)
												e.currentTarget.blur()
											}}
										>
											<span class="connection-label">{nodes[edge.source].label}</span>
											<span class="connection-arrow">→</span>
											<span class="connection-description">{edge.description}</span>
										</button>
									</li>
								{/each}
							</ul>
							{#if incomingLinks.length > 0}
								<div class="connection-sources">
									<strong>Sources:</strong>
									<ul class="connection-links">
										{#each incomingLinks as link}
											<li>
												<a href={link} target="_blank" rel="noopener noreferrer"
													>{getDomain(link)}</a
												>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					{/if}

					{#if edges.filter((e) => e.source === selectedNodeId).length > 0}
						<div class="connection-section">
							<h4 class="modal-subtitle">Customers:</h4>
							<ul class="connection-list">
								{#each edges.filter((e) => e.source === selectedNodeId) as edge}
									<li class="connection-item">
										<button
											class="connection-button"
											on:click={(e) => {
												handleNodeClick(edge.target)
												e.currentTarget.blur()
											}}
										>
											<span class="connection-label">{nodes[edge.target].label}</span>
											<span class="connection-arrow">←</span>
											<span class="connection-description">{edge.description}</span>
										</button>
									</li>
								{/each}
							</ul>
							{#if outgoingLinks.length > 0}
								<div class="connection-sources">
									<strong>Sources:</strong>
									<ul class="connection-links">
										{#each outgoingLinks as link}
											<li>
												<a href={link} target="_blank" rel="noopener noreferrer"
													>{getDomain(link)}</a
												>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</Modal>
	{/if}

	<!-- Edge Modal -->
	{#if selectedEdge}
		<Modal
			title="Connection: {nodes[selectedEdge.source]?.label || selectedEdge.source} → {nodes[
				selectedEdge.target
			]?.label || selectedEdge.target}"
			description={selectedEdge.description || ''}
			onClose={closeAllModals}
		>
			{#if selectedEdge.links && selectedEdge.links.length > 0}
				<div class="connection-sources">
					<strong>Sources:</strong>
					<ul class="connection-links">
						{#each selectedEdge.links as link}
							<li>
								<a href={link} target="_blank" rel="noopener noreferrer">{getDomain(link)}</a>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</Modal>
	{/if}

	<div class="legend">
		<div class="legend-item">
			<div class="legend-swatch node-equipment"></div>
			<span>Equipment</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-foundry"></div>
			<span>Foundry</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-design"></div>
			<span>Chip Design</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-eda"></div>
			<span>EDA</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-memory"></div>
			<span>Memory</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-assembly"></div>
			<span>Assembly</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-end"></div>
			<span>AI Labs</span>
		</div>
	</div>
</div>

<style>
	.container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 0;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.graph-scroll {
		width: 100vw;
		overflow-x: auto;
		overflow-y: visible;
	}

	.graph-container {
		display: inline-block;
		position: relative;
		background: var(--bg);
		box-sizing: border-box;
		max-width: 1200px;
		width: 95vw;
		margin: 0 auto;
	}

	@media (max-width: 600px) {
		.container {
			padding: 1rem 0;
		}
	}

	.header {
		margin-bottom: 2rem;
	}

	.title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
		color: var(--text);
	}

	.description {
		color: var(--brand-subtle);
		margin-bottom: 1rem;
	}

	.edges {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 1;
	}

	.edge-group {
		cursor: pointer;
	}

	.edge-group:hover line {
		stroke: var(--text);
	}

	.modal-details {
		list-style-type: disc;
		padding-left: 1.25rem;
	}

	.modal-detail-item {
		color: var(--text);
		margin-bottom: 0.25rem;
	}

	.legend {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 1rem;
		margin: 2rem 0;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--brand-subtle);
	}

	.legend-swatch {
		width: 1.5rem;
		height: 1rem;
		border-radius: 0.25rem;
	}

	.modal-subtitle {
		font-size: 0.875rem;
		font-weight: bold;
		color: var(--text);
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.modal-connections {
		margin-top: 1.5rem;
		border-top: 1px solid var(--brand-subtle);
		padding-top: 1rem;
	}

	.connection-section {
		margin-bottom: 1rem;
	}

	.connection-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.connection-item {
		margin-bottom: 0.75rem;
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.connection-button {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		width: 100%;
		text-align: left;
		background: none;
		border: none;
		padding: 0.5rem;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.connection-button:hover {
		background-color: var(--bg-subtle);
	}

	.connection-button:focus {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}

	.connection-label {
		font-weight: 500;
		color: var(--brand);
		min-width: 80px;
	}

	.connection-arrow {
		color: var(--brand-subtle);
	}

	.connection-description {
		color: var(--text);
		flex: 1;
	}

	.connection-links {
		margin: 0.25rem 0 0 0;
		padding-left: 1.25rem;
		font-size: 0.8em;
		color: var(--brand);
	}

	.connection-links li {
		margin-bottom: 0.1rem;
	}

	.connection-links a {
		color: var(--brand);
		text-decoration: underline;
		word-break: break-all;
	}

	.connection-links a:hover {
		color: var(--brand-subtle);
	}

	.connection-sources {
		margin-top: 0.5rem;
		font-size: 0.9em;
		color: var(--text);
	}

	/* Node color classes */
	:global(.node-equipment) {
		background-color: hsl(230, 100%, 95%);
		border: 2px solid hsl(230, 100%, 60%);
	}

	:global(.node-equipment:hover) {
		background-color: hsl(230, 100%, 85%);
		border-color: hsl(230, 100%, 50%);
	}

	:global(.node-foundry) {
		background-color: hsl(30, 100%, 95%);
		border: 2px solid hsl(30, 100%, 60%);
	}

	:global(.node-foundry:hover) {
		background-color: hsl(30, 100%, 85%);
		border-color: hsl(30, 100%, 50%);
	}

	:global(.node-design) {
		background-color: hsl(0, 100%, 95%);
		border: 2px solid hsl(0, 100%, 60%);
	}

	:global(.node-design:hover) {
		background-color: hsl(0, 100%, 85%);
		border-color: hsl(0, 100%, 50%);
	}

	:global(.node-eda) {
		background-color: hsl(150, 100%, 95%);
		border: 2px solid hsl(150, 100%, 60%);
	}

	:global(.node-eda:hover) {
		background-color: hsl(150, 100%, 85%);
		border-color: hsl(150, 100%, 50%);
	}

	:global(.node-memory) {
		background-color: hsl(60, 100%, 95%);
		border: 2px solid hsl(60, 100%, 60%);
	}

	:global(.node-memory:hover) {
		background-color: hsl(60, 100%, 85%);
		border-color: hsl(60, 100%, 50%);
	}

	:global(.node-assembly) {
		background-color: hsl(210, 100%, 95%);
		border: 2px solid hsl(210, 100%, 60%);
	}

	:global(.node-assembly:hover) {
		background-color: hsl(210, 100%, 85%);
		border-color: hsl(210, 100%, 50%);
	}

	:global(.node-end) {
		background-color: hsl(270, 100%, 95%);
		border: 2px solid hsl(270, 100%, 60%);
	}

	:global(.node-end:hover) {
		background-color: hsl(270, 100%, 85%);
		border-color: hsl(270, 100%, 50%);
	}

	/* Dark mode overrides */
	:global([color-scheme='dark']) .node-equipment {
		background-color: hsl(230, 100%, 20%);
		border-color: hsl(230, 100%, 40%);
	}

	:global([color-scheme='dark']) .node-foundry {
		background-color: hsl(30, 100%, 20%);
		border-color: hsl(30, 100%, 40%);
	}

	:global([color-scheme='dark']) .node-design {
		background-color: hsl(0, 100%, 20%);
		border-color: hsl(0, 100%, 40%);
	}

	:global([color-scheme='dark']) .node-eda {
		background-color: hsl(150, 100%, 20%);
		border-color: hsl(150, 100%, 40%);
	}

	:global([color-scheme='dark']) .node-memory {
		background-color: hsl(60, 100%, 20%);
		border-color: hsl(60, 100%, 40%);
	}

	:global([color-scheme='dark']) .node-assembly {
		background-color: hsl(210, 100%, 20%);
		border-color: hsl(210, 100%, 40%);
	}

	:global([color-scheme='dark']) .node-end {
		background-color: hsl(270, 100%, 20%);
		border-color: hsl(270, 100%, 40%);
	}

	/* Node text color for contrast */
	:global(.node) {
		color: #111 !important;
	}

	/* Modal dark mode overrides */
	:global([color-scheme='dark']) .modal-content,
	:global([color-scheme='dark']) dialog[open].modal {
		background: #18181b !important;
		color: #f3f4f6 !important;
	}
	:global([color-scheme='dark']) .modal-title,
	:global([color-scheme='dark']) .modal-description,
	:global([color-scheme='dark']) .modal-detail-item {
		color: #f3f4f6 !important;
	}
	:global([color-scheme='dark']) dialog[open].modal::backdrop {
		background: rgba(0, 0, 0, 0.8) !important;
	}
</style>
