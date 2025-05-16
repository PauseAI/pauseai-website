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
	import './supply-chain/styles.css'

	// Reactive state
	let selectedNodeId: string | null = null
	let selectedEdge: Edge | null = null

	// Container size state
	let graphContainer: HTMLDivElement
	let containerWidth = 1600 // default fallback
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
		equipment: 0.08,
		foundry: 0.2,
		design: 0.34,
		eda: 0.46,
		memory: 0.58,
		assembly: 0.72,
		end: 0.88
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
		background: white;
		box-sizing: border-box;
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

	.edge-group {
		cursor: pointer;
	}

	.edge-group:hover line {
		stroke: #000;
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

	.modal-subtitle {
		font-size: 0.875rem;
		font-weight: bold;
		color: #4b5563;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
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
