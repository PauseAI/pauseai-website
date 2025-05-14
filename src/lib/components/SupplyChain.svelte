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
	import './supply-chain/styles.css'

	// Reactive state
	let selectedNodeId: string | null = null
	let selectedEdge: Edge | null = null

	// Container size state
	let graphContainer: HTMLDivElement
	let containerWidth = 1000 // default fallback
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
	const columns = {
		litho: 0.15,
		fab: 0.35,
		design: 0.55,
		assembly: 0.75,
		end: 0.95
	}

	// Group nodes by category
	const nodesByCategory: Record<string, Node[]> = {}
	Object.values(nodes).forEach((node) => {
		if (!nodesByCategory[node.category]) {
			nodesByCategory[node.category] = []
		}
		nodesByCategory[node.category].push(node)
	})

	// Update node positions (in pixels)
	function updateNodePositions() {
		Object.entries(nodesByCategory).forEach(([category, categoryNodes]) => {
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

	// Add this function to handle backdrop clicks
	function handleBackdropClick(event: MouseEvent) {
		// Only close if clicking the backdrop (dialog element), not its contents
		if (event.target === event.currentTarget) {
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
			style="height: {containerHeight}px; min-width: 900px; width: 1200px;"
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
				<div
					class="node {node.category === 'litho' ? 'node-litho' : categoryColors[node.category]}"
					style="left: {node.x ?? 0}px; top: {node.y ??
						0}px; position: absolute; transform: translate(-50%, -50%);"
					on:click={() => handleNodeClick(node.id)}
					on:keydown={(event) => {
						if (event.key === 'Enter' || event.key === ' ') {
							handleNodeClick(node.id)
						}
					}}
					role="button"
					tabindex="0"
				>
					<span class="node-label">{node.label}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Modal -->
	{#if selectedNodeId && nodeInfo[selectedNodeId]}
		<dialog
			class="modal"
			open
			aria-labelledby="dialog-title"
			aria-describedby="dialog-description"
			on:click={handleBackdropClick}
		>
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title" id="dialog-title">{nodeInfo[selectedNodeId].title}</h3>
					<button class="modal-close" on:click={closeAllModals} autofocus aria-label="Close dialog"
						>×</button
					>
				</div>
				<p class="modal-description" id="dialog-description">
					{nodeInfo[selectedNodeId].description}
				</p>
				<ul class="modal-details">
					{#each nodeInfo[selectedNodeId].details as detail}
						<li class="modal-detail-item">{detail}</li>
					{/each}
				</ul>

				{#if edges.filter((e) => e.source === selectedNodeId || e.target === selectedNodeId).length > 0}
					<div class="modal-connections">
						{#if edges.filter((e) => e.target === selectedNodeId).length > 0}
							<div class="connection-section">
								<h4 class="modal-subtitle">Incoming Connections:</h4>
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
								<h4 class="modal-subtitle">Outgoing Connections:</h4>
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
			</div>
		</dialog>
	{/if}

	<!-- Edge Modal -->
	{#if selectedEdge}
		<dialog
			class="modal"
			open
			aria-labelledby="edge-dialog-title"
			aria-describedby="edge-dialog-description"
			on:click={handleBackdropClick}
		>
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title" id="edge-dialog-title">
						Connection: {nodes[selectedEdge.source]?.label || selectedEdge.source} → {nodes[
							selectedEdge.target
						]?.label || selectedEdge.target}
					</h3>
					<button class="modal-close" on:click={closeAllModals} autofocus aria-label="Close dialog"
						>×</button
					>
				</div>
				{#if selectedEdge.description}
					<p class="modal-description" id="edge-dialog-description">
						{selectedEdge.description}
					</p>
				{/if}
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
			</div>
		</dialog>
	{/if}

	<div class="legend">
		<div class="legend-item">
			<div class="legend-swatch node-litho"></div>
			<span>Lithography</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-fab"></div>
			<span>Foundry</span>
		</div>
		<div class="legend-item">
			<div class="legend-swatch node-design"></div>
			<span>Chip Design</span>
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
	}
	.graph-scroll {
		width: calc(100% + 12rem);
		display: flex;
		justify-content: center;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		margin-left: -8rem;
	}
	.graph-container {
		position: relative;
		background: white;
		width: max-content;
		min-width: 700px;
		margin: 0 auto;
		box-sizing: border-box;
	}
	@media (max-width: 1300px) {
		.graph-container {
		}
	}
	@media (max-width: 1100px) {
		.graph-container {
		}
	}
	@media (max-width: 800px) {
		.graph-container {
		}
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
	}

	.description {
		color: #666;
		margin-bottom: 1rem;
	}

	.edges {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		z-index: 1;
	}

	.node {
		position: absolute;
		cursor: pointer;
		border-radius: 0.5rem;
		padding: 0.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
		width: 100px;
		text-align: center;
		z-index: 2;
		margin: 0;
	}

	.node:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
	}

	.node-label {
		font-size: 0.75rem;
		font-weight: 500;
	}

	.node-litho {
		background-color: #fef3c7;
		border: 2px solid #fcd34d;
	}
	.node-litho:hover {
		background-color: #fde68a;
		border-color: #f59e0b;
	}

	.node-fab {
		background-color: #fed7aa;
		border: 2px solid #fb923c;
	}
	.node-fab:hover {
		background-color: #fdba74;
		border-color: #ea580c;
	}

	.node-design {
		background-color: #fee2e2;
		border: 2px solid #fca5a5;
	}
	.node-design:hover {
		background-color: #fecaca;
		border-color: #ef4444;
	}

	.node-assembly {
		background-color: #dbeafe;
		border: 2px solid #93c5fd;
	}
	.node-assembly:hover {
		background-color: #bfdbfe;
		border-color: #3b82f6;
	}

	.node-end {
		background-color: #f3e8ff;
		border: 2px solid #d8b4fe;
	}
	.node-end:hover {
		background-color: #e9d5ff;
		border-color: #a855f7;
	}

	.modal {
		position: fixed;
		inset: 0;
		background: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
		border: none;
		padding: 0;
		width: 100%;
		height: 100%;
		overflow: hidden; /* Prevent background scrolling */
	}

	.modal::backdrop {
		background: rgba(0, 0, 0, 0.5);
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		width: 28rem;
		margin: 1rem;
		animation: fade-in 0.2s ease-out;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
		max-height: calc(100vh - 2rem); /* Account for margin */
		overflow-y: auto; /* Make content scrollable */
	}

	/* Add smooth scrolling to the modal content */
	.modal-content {
		scrollbar-width: thin;
		scrollbar-color: #cbd5e1 #f1f5f9;
	}

	.modal-content::-webkit-scrollbar {
		width: 8px;
	}

	.modal-content::-webkit-scrollbar-track {
		background: #f1f5f9;
		border-radius: 4px;
	}

	.modal-content::-webkit-scrollbar-thumb {
		background-color: #cbd5e1;
		border-radius: 4px;
	}

	.modal-content::-webkit-scrollbar-thumb:hover {
		background-color: #94a3b8;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.modal-title {
		font-size: 1.25rem;
		font-weight: bold;
	}

	.modal-close {
		color: #6b7280;
		cursor: pointer;
	}

	.modal-close:hover {
		color: #374151;
	}

	.modal-description {
		color: #666;
		margin-bottom: 1rem;
	}

	.modal-details {
		list-style-type: disc;
		padding-left: 1.25rem;
	}

	.modal-detail-item {
		color: #374151;
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
		color: #666;
	}

	.legend-swatch {
		width: 1.5rem;
		height: 1rem;
		border-radius: 0.25rem;
	}

	.edge-group {
		cursor: pointer;
	}

	.edge-group:hover line {
		stroke: #000; /* Darken line significantly on hover to black */
		/* stroke-width: 6px; Keep original stroke-width to prevent marker scaling issues */
	}

	.modal-subtitle {
		font-size: 0.875rem; /* 14px */
		font-weight: bold;
		color: #4b5563; /* gray-600 */
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	.modal-links {
		list-style-type: disc;
		padding-left: 1.25rem;
		max-height: 150px; /* Example max height for scrollable links */
		overflow-y: auto; /* Allow scrolling for links */
	}

	.modal-link-item {
		color: #374151;
		margin-bottom: 0.25rem;
	}

	.modal-link-item a {
		color: #2563eb; /* blue-600 */
		text-decoration: underline;
	}

	.modal-link-item a:hover {
		color: #1d4ed8; /* blue-700 */
	}

	.modal-connections {
		margin-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
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
		background-color: #f3f4f6;
	}

	.connection-button:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}

	.connection-label {
		font-weight: 500;
		color: #2563eb;
		min-width: 80px;
	}

	.connection-arrow {
		color: #6b7280;
	}

	.connection-description {
		color: #4b5563;
		flex: 1;
	}

	.connection-links {
		margin: 0.25rem 0 0 0;
		padding-left: 1.25rem;
		font-size: 0.8em;
		color: #2563eb;
	}
	.connection-links li {
		margin-bottom: 0.1rem;
	}
	.connection-links a {
		color: #2563eb;
		text-decoration: underline;
		word-break: break-all;
	}
	.connection-links a:hover {
		color: #1d4ed8;
	}

	.connection-sources {
		margin-top: 0.5rem;
		font-size: 0.9em;
		color: #374151;
	}

	:global(body) {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
</style>
