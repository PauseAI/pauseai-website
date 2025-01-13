<script lang="ts">
	// Types
	interface Node {
		id: string
		label: string
		x: number
		y: number
		category: 'raw' | 'litho' | 'fab' | 'design' | 'assembly' | 'end'
	}

	interface NodeInfo {
		title: string
		description: string
		details: string[]
	}

	// Reactive state
	let selectedNode: string | null = null

	// Node definitions
	const nodes: Record<string, Node> = {
		L1: { id: 'L1', label: 'ASML', x: 20, y: 30, category: 'litho' },
		L2: { id: 'L2', label: 'Zeiss', x: 20, y: 60, category: 'litho' },
		L3: { id: 'L3', label: 'SMEE', x: 20, y: 90, category: 'litho' },
		W1: { id: 'W1', label: 'TSMC', x: 40, y: 15, category: 'fab' },
		W2: { id: 'W2', label: 'Samsung', x: 40, y: 40, category: 'fab' },
		W3: { id: 'W3', label: 'Intel', x: 40, y: 65, category: 'fab' },
		D1: { id: 'D1', label: 'NVIDIA', x: 60, y: 25, category: 'design' },
		D2: { id: 'D2', label: 'AMD', x: 60, y: 50, category: 'design' },
		D3: { id: 'D3', label: 'Intel AI', x: 60, y: 75, category: 'design' },
		A1: { id: 'A1', label: 'Foxconn', x: 80, y: 35, category: 'assembly' },
		A2: { id: 'A2', label: 'ASE Group', x: 80, y: 65, category: 'assembly' },
		E1: { id: 'E1', label: 'Research Labs', x: 95, y: 30, category: 'end' },
		E2: { id: 'E2', label: 'Tech Companies', x: 95, y: 50, category: 'end' },
		E3: { id: 'E3', label: 'Universities', x: 95, y: 70, category: 'end' },
		W4: { id: 'W4', label: 'SMIC', x: 40, y: 90, category: 'fab' },
		D4: { id: 'D4', label: 'Huawei', x: 60, y: 90, category: 'design' }
	}

	// Edge definitions
	const edges = [
		['L1', 'W1'],
		['L1', 'W2'],
		['L1', 'W3'],
		['L2', 'L1'],
		['W1', 'D1'],
		['W1', 'D2'],
		['W2', 'D1'],
		['W2', 'D2'],
		['W3', 'D3'],
		['D1', 'A1'],
		['D1', 'A2'],
		['D2', 'A1'],
		['D2', 'A2'],
		['D3', 'A2'],
		['A1', 'E1'],
		['A1', 'E2'],
		['A2', 'E1'],
		['A2', 'E3'],
		['L3', 'W4'],
		['W4', 'D4']
	]

	// Node information
	const nodeInfo: Record<string, NodeInfo> = {
		L1: {
			title: 'ASML',
			description:
				'Global monopoly in EUV lithography machines required for advanced chip manufacturing.',
			details: [
				'Only manufacturer of EUV lithography machines',
				'Machines cost ~$200 million each',
				'Has remote kill-switch capability',
				'Critical choke point in AI chip supply chain',
				'Subject to export controls from NL government'
			]
		},
		L2: {
			title: 'Zeiss',
			description: "Exclusive provider of critical optical systems for ASML's EUV machines.",
			details: [
				'Produces specialized optics for EUV machines',
				'25% owned by ASML',
				'Only company capable of producing EUV optics',
				'Located in Germany',
				'Essential for advanced chip manufacturing'
			]
		},
		W1: {
			title: 'TSMC (Taiwan Semiconductor)',
			description:
				"World's largest dedicated semiconductor foundry, specializing in advanced process nodes.",
			details: [
				'Market leader in 3nm and 5nm processes',
				'Supplies to NVIDIA, AMD, Apple',
				'Located primarily in Taiwan',
				'~54% market share in foundry services'
			]
		},
		W2: {
			title: 'Samsung Semiconductor',
			description: 'Major player in memory and logic chip manufacturing with advanced facilities.',
			details: [
				'Competes in 3nm and 5nm processes',
				'Strong in memory chip production',
				'Facilities in Korea and US',
				'~17% foundry market share'
			]
		},
		W3: {
			title: 'Intel Foundry',
			description: 'Traditional CPU giant expanding into foundry services with IDM 2.0 strategy.',
			details: [
				'Investing heavily in new fabs',
				'Developing Intel 4 and 3 processes',
				'US-based manufacturing',
				'Focus on regaining technology leadership'
			]
		},
		D1: {
			title: 'NVIDIA',
			description: 'Leader in GPU design and AI accelerator chips.',
			details: [
				'Designs H100, A100 AI chips',
				'~80% market share in AI chips',
				'Partners with TSMC for manufacturing',
				'Pioneered CUDA ecosystem'
			]
		},
		D2: {
			title: 'AMD',
			description: 'Major chip designer competing in CPU, GPU, and AI accelerator markets.',
			details: [
				'Designs MI300 AI accelerators',
				'Uses TSMC manufacturing',
				'Growing presence in data centers',
				'ROCm software ecosystem'
			]
		},
		D3: {
			title: 'Intel AI',
			description: "Intel's dedicated AI chip design division.",
			details: [
				'Develops Gaudi AI accelerators',
				'Acquired Habana Labs',
				'Internal manufacturing capability',
				'OneAPI software platform'
			]
		},
		A1: {
			title: 'Foxconn',
			description: "World's largest electronics manufacturer and assembler.",
			details: [
				'Major Apple supplier',
				'Facilities across Asia',
				'Expanding into chip packaging',
				'Handles final product assembly'
			]
		},
		A2: {
			title: 'ASE Group',
			description: "World's largest semiconductor packaging and testing provider.",
			details: [
				'Advanced packaging solutions',
				'Tests final chip products',
				'Key role in supply chain',
				'Facilities in multiple countries'
			]
		},
		E1: {
			title: 'Research Labs',
			description:
				'Dedicated AI research laboratories pushing the boundaries of artificial intelligence.',
			details: [
				'Advanced AI model development',
				'Specialized research facilities',
				'High-performance computing clusters',
				'Focus on fundamental AI research'
			]
		},
		E2: {
			title: 'Tech Companies',
			description: 'Commercial organizations developing and deploying AI solutions.',
			details: [
				'Product-focused AI development',
				'Large-scale model training',
				'Applied AI research',
				'Commercial applications'
			]
		},
		E3: {
			title: 'Universities',
			description: 'Academic institutions conducting AI research and education.',
			details: [
				'Academic research programs',
				'Student training facilities',
				'Collaborative research projects',
				'Theoretical and applied research'
			]
		},
		W4: {
			title: 'SMIC (Semiconductor Manufacturing International Corporation)',
			description: "China's largest chip manufacturer, developing advanced process nodes.",
			details: [
				'Achieved 7nm process using DUV',
				'Working on 5nm development',
				'Subject to US export controls',
				'Limited by access to EUV technology',
				'Located in mainland China'
			]
		},
		D4: {
			title: 'Huawei',
			description: 'Chinese technology company developing AI chips through its HiSilicon division.',
			details: [
				'Designs Ascend AI processors',
				'Partners with SMIC for manufacturing',
				'Subject to US trade restrictions',
				'Focusing on domestic supply chain',
				'Major investments in AI development'
			]
		},
		L3: {
			title: 'SMEE (Shanghai Micro Electronics Equipment)',
			description: 'Chinese lithography equipment manufacturer developing DUV technology.',
			details: [
				'Currently at 28nm DUV process',
				'Working on advanced lithography',
				"Key player in China's chip independence",
				'Cannot yet produce EUV machines',
				'Significant government support'
			]
		}
	}

	// Category styling
	const categoryColors = {
		raw: 'node-raw',
		litho: 'node-litho',
		fab: 'node-fab',
		design: 'node-design',
		assembly: 'node-assembly',
		end: 'node-end'
	}

	// Calculate connection points on node edges
	function calculateConnectionPoints(startNode: Node, endNode: Node) {
		// Node dimensions in percentages (the colored rectangle)
		const nodeWidth = 2 // 50px in ~2500px container

		// Calculate vector between nodes
		const dx = endNode.x - startNode.x

		// For this layout, we know connections are primarily horizontal
		// Calculate intersection with vertical node borders
		const startX = startNode.x + (dx > 0 ? nodeWidth / 2 : -nodeWidth / 2)
		const startY = startNode.y
		const endX = endNode.x + (dx > 0 ? -nodeWidth / 2 : nodeWidth / 2)
		const endY = endNode.y

		return { startX, startY, endX, endY }
	}
	// Click handler
	function handleNodeClick(id: string) {
		selectedNode = id
	}

	// Close modal
	function closeModal() {
		selectedNode = null
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && selectedNode) {
			closeModal()
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />
<div class="container">
	<div class="header">
		<h2 class="title">AI Chip Supply Chain</h2>
		<p class="description">Click on any node to learn more about its role in the supply chain.</p>
	</div>

	<div class="graph-container">
		<!-- Edges -->
		<svg class="edges">
			<defs>
				<marker
					id="arrowhead"
					markerWidth="10"
					markerHeight="7"
					refX="5"
					refY="3.5"
					orient="auto"
					stroke="#666"
				>
					<polygon points="0 0, 10 3.5, 0 7" fill="#666" />
				</marker>
			</defs>
			{#each edges as [start, end]}
				{@const points = calculateConnectionPoints(nodes[start], nodes[end])}
				<line
					x1="{points.startX}%"
					y1="{points.startY}%"
					x2="{points.endX}%"
					y2="{points.endY}%"
					stroke="#666"
					stroke-width="1"
					marker-end="url(#arrowhead)"
					stroke-dasharray="4,2"
				/>
			{/each}
		</svg>
		<!-- Nodes -->
		{#each Object.values(nodes) as node}
			<div
				class="node {node.category === 'litho' ? 'node-litho' : categoryColors[node.category]}"
				style="left: {node.x}%; top: {node.y}%;"
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

	<!-- Modal -->
	{#if selectedNode && nodeInfo[selectedNode]}
		<div class="modal-overlay" aria-modal="true" role="dialog">
			<div class="modal-content" role="document">
				<div class="modal-header">
					<h3 class="modal-title">{nodeInfo[selectedNode].title}</h3>
					<button
						class="modal-close"
						on:click={closeModal}
						on:keydown={(event) => {
							if (event.key === 'Enter' || event.key === ' ') {
								closeModal()
							}
						}}>×</button
					>
				</div>
				<p class="modal-description">{nodeInfo[selectedNode].description}</p>
				<ul class="modal-details">
					{#each nodeInfo[selectedNode].details as detail}
						<li class="modal-detail-item">{detail}</li>
					{/each}
				</ul>
			</div>
		</div>
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
		max-width: 56rem;
		margin: 0 auto;
		padding: 1rem;
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

	.graph-container {
		position: relative;
		background: white;
		padding: 1rem;
		height: 600px;
	}

	.edges {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
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
		/* Position from the center of the node */
		margin-left: -50px;
		margin-top: -20px;
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

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.modal-content {
		background: white;
		border-radius: 0.5rem;
		padding: 1.5rem;
		max-width: 28rem;
		width: 100%;
		margin: 1rem;
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

	:global(body) {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
</style>
