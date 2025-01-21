<script lang="ts">
	// Types
	interface Node {
		id: string
		label: string
		category: 'litho' | 'fab' | 'design' | 'assembly' | 'end'
		x?: number
		y?: number
	}

	interface NodeInfo {
		title: string
		description: string
		details: string[]
	}

	// Reactive state
	let selectedNode: string | null = null

	// Define column positions (as percentages)
	const columns = {
		litho: 15,
		fab: 35,
		design: 55,
		assembly: 75,
		end: 95
	}

	// Helper function to calculate y position based on index in category
	function getYPosition(index: number, totalInCategory: number): number {
		const spacing = 80 / (totalInCategory + 1)
		return 10 + (index + 1) * spacing
	}

	// First, define the nodes without initial positions
	const nodes: Record<string, Node> = {
		ASML: { id: 'ASML', label: 'ASML', category: 'litho' },
		ZEISS: { id: 'ZEISS', label: 'Zeiss', category: 'litho' },
		SMEE: { id: 'SMEE', label: 'SMEE', category: 'litho' },
		TSMC: { id: 'TSMC', label: 'TSMC', category: 'fab' },
		SAMSUNG: { id: 'SAMSUNG', label: 'Samsung', category: 'fab' },
		INTEL_FAB: { id: 'INTEL_FAB', label: 'Intel', category: 'fab' },
		SMIC: { id: 'SMIC', label: 'SMIC', category: 'fab' },
		NVIDIA: { id: 'NVIDIA', label: 'Nvidia', category: 'design' },
		AMD: { id: 'AMD', label: 'AMD', category: 'design' },
		GROQ: { id: 'GROQ', label: 'Groq', category: 'design' },
		INTEL: { id: 'INTEL', label: 'Intel', category: 'design' },
		CEREBRAS: { id: 'CEREBRAS', label: 'Cerebras', category: 'design' },
		HUAWEI: { id: 'HUAWEI', label: 'Huawei', category: 'design' },
		ASE: { id: 'ASE', label: 'ASE', category: 'assembly' },
		ASE_GROUP: { id: 'ASE_GROUP', label: 'ASE Group', category: 'assembly' },
		OPENAI: { id: 'OPENAI', label: 'OpenAI', category: 'end' },
		GOOGLE: { id: 'GOOGLE', label: 'Google', category: 'end' },
		META: { id: 'META', label: 'Meta', category: 'end' },
		XAI: { id: 'XAI', label: 'X.ai', category: 'end' }
	}

	// Then group and position them
	const nodesByCategory: Record<string, Node[]> = {}
	Object.values(nodes).forEach((node) => {
		if (!nodesByCategory[node.category]) {
			nodesByCategory[node.category] = []
		}
		nodesByCategory[node.category].push(node)
	})

	// Update node positions
	Object.entries(nodesByCategory).forEach(([category, categoryNodes]) => {
		categoryNodes.forEach((node, index) => {
			node.x = columns[category as keyof typeof columns]
			node.y = getYPosition(index, categoryNodes.length)
		})
	})

	// Edge definitions
	const edges = [
		['ASML', 'TSMC'],
		['ASML', 'SAMSUNG'],
		['ASML', 'INTEL_FAB'],
		['ZEISS', 'ASML'],
		['TSMC', 'NVIDIA'],
		['TSMC', 'AMD'],
		['TSMC', 'CEREBRAS'],
		['SAMSUNG', 'NVIDIA'],
		['SAMSUNG', 'AMD'],
		['SAMSUNG', 'GROQ'],
		['INTEL_FAB', 'INTEL'],
		['NVIDIA', 'ASE'],
		['NVIDIA', 'ASE_GROUP'],
		['AMD', 'ASE'],
		['AMD', 'ASE_GROUP'],
		['INTEL', 'ASE_GROUP'],
		['ASE', 'OPENAI'],
		['ASE', 'GOOGLE'],
		['ASE_GROUP', 'OPENAI'],
		['ASE_GROUP', 'META'],
		['SMEE', 'SMIC'],
		['SMIC', 'HUAWEI']
	]

	// Node information
	const nodeInfo: Record<string, NodeInfo> = {
		ASML: {
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
		ZEISS: {
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
		TSMC: {
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
		SAMSUNG: {
			title: 'Samsung Semiconductor',
			description: 'Major player in memory and logic chip manufacturing with advanced facilities.',
			details: [
				'Competes in 3nm and 5nm processes',
				'Strong in memory chip production',
				'Facilities in Korea and US',
				'~17% foundry market share'
			]
		},
		INTEL_FAB: {
			title: 'Intel Foundry',
			description: 'Traditional CPU giant expanding into foundry services with IDM 2.0 strategy.',
			details: [
				'Investing heavily in new fabs',
				'Developing Intel 4 and 3 processes',
				'US-based manufacturing',
				'Focus on regaining technology leadership'
			]
		},
		NVIDIA: {
			title: 'NVIDIA',
			description: 'Leader in GPU design and AI accelerator chips.',
			details: [
				'Designs H100, A100 AI chips',
				'~80% market share in AI chips',
				'Partners with TSMC for manufacturing',
				'Pioneered CUDA ecosystem'
			]
		},
		AMD: {
			title: 'AMD',
			description: 'Major chip designer competing in CPU, GPU, and AI accelerator markets.',
			details: [
				'Designs MI300 AI accelerators',
				'Uses TSMC manufacturing',
				'Growing presence in data centers',
				'ROCm software ecosystem'
			]
		},
		INTEL: {
			title: 'Intel AI',
			description: "Intel's dedicated AI chip design division.",
			details: [
				'Develops Gaudi AI accelerators',
				'Acquired Habana Labs',
				'Internal manufacturing capability',
				'OneAPI software platform'
			]
		},
		ASE: {
			title: 'Foxconn',
			description: "World's largest electronics manufacturer and assembler.",
			details: [
				'Major Apple supplier',
				'Facilities across Asia',
				'Expanding into chip packaging',
				'Handles final product assembly'
			]
		},
		ASE_GROUP: {
			title: 'ASE Group',
			description: "World's largest semiconductor packaging and testing provider.",
			details: [
				'Advanced packaging solutions',
				'Tests final chip products',
				'Key role in supply chain',
				'Facilities in multiple countries'
			]
		},
		OPENAI: {
			title: 'OpenAI',
			description: 'Leading AI research company focused on AGI development.',
			details: [
				'Developed GPT-4, DALL-E',
				'Major compute infrastructure',
				'Partnership with Microsoft',
				'Focus on AI safety research'
			]
		},
		GOOGLE: {
			title: 'Google DeepMind',
			description: 'Pioneer in AI research and large language models.',
			details: [
				'Developed Gemini, PaLM',
				'Massive TPU infrastructure',
				'Leading AI research lab',
				'Focus on multimodal AI'
			]
		},
		META: {
			title: 'Meta AI',
			description: 'Major AI research organization with open source focus.',
			details: [
				'Developed LLaMA models',
				'Large GPU clusters',
				'Open source contributions',
				'Focus on generative AI'
			]
		},
		SMIC: {
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
		HUAWEI: {
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
		SMEE: {
			title: 'SMEE (Shanghai Micro Electronics Equipment)',
			description: 'Chinese lithography equipment manufacturer developing DUV technology.',
			details: [
				'Currently at 28nm DUV process',
				'Working on advanced lithography',
				"Key player in China's chip independence",
				'Cannot yet produce EUV machines',
				'Significant government support'
			]
		},
		GROQ: {
			title: 'Groq',
			description: 'AI chip startup focusing on tensor processing units.',
			details: [
				'Developed LPU architecture',
				'Uses older 14nm process',
				'Claims superior inference speed',
				'Founded by former Google TPU lead'
			]
		},
		CEREBRAS: {
			title: 'Cerebras',
			description: 'Developer of the largest AI chip in the world.',
			details: ['Specialized for AI inference', 'Uses TSMC 5nm nodes']
		},
		XAI: {
			title: 'X.ai',
			description: 'New AI company developing large language models.',
			details: [
				'Developing Grok model',
				'Significant compute investment',
				'Focus on unrestricted AI',
				'Founded by Elon Musk'
			]
		}
	}

	// Category styling
	const categoryColors = {
		litho: 'node-litho',
		fab: 'node-fab',
		design: 'node-design',
		assembly: 'node-assembly',
		end: 'node-end'
	}

	// Calculate connection points on node edges
	function calculateConnectionPoints(startNode: Node, endNode: Node) {
		// Add default values if x/y are undefined
		const startX = startNode.x ?? 0
		const startY = startNode.y ?? 0
		const endX = endNode.x ?? 0
		const endY = endNode.y ?? 0

		const dx = endX - startX
		const nodeWidth = 2

		return {
			startX: startX + (dx > 0 ? nodeWidth / 2 : -nodeWidth / 2),
			startY,
			endX: endX + (dx > 0 ? -nodeWidth / 2 : nodeWidth / 2),
			endY
		}
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

	// Add this function to handle backdrop clicks
	function handleBackdropClick(event: MouseEvent) {
		// Only close if clicking the backdrop (dialog element), not its contents
		if (event.target === event.currentTarget) {
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
		<dialog
			class="modal"
			open
			aria-labelledby="dialog-title"
			aria-describedby="dialog-description"
			on:click={handleBackdropClick}
		>
			<div class="modal-content">
				<div class="modal-header">
					<h3 class="modal-title" id="dialog-title">{nodeInfo[selectedNode].title}</h3>
					<button class="modal-close" on:click={closeModal} autofocus aria-label="Close dialog"
						>×</button
					>
				</div>
				<p class="modal-description" id="dialog-description">
					{nodeInfo[selectedNode].description}
				</p>
				<ul class="modal-details">
					{#each nodeInfo[selectedNode].details as detail}
						<li class="modal-detail-item">{detail}</li>
					{/each}
				</ul>
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
		margin: auto;
		animation: fade-in 0.2s ease-out;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
