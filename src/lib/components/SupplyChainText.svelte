<script lang="ts">
	import { nodes, nodeInfo, edges } from './supply-chain/data'
	import type { Node } from './supply-chain/types'
	import { getDomain } from './supply-chain/utils'

	// Group nodes by category
	const nodesByCategory: Record<string, Record<string, Node>> = {}
	Object.values(nodes).forEach((node) => {
		if (!nodesByCategory[node.category]) {
			nodesByCategory[node.category] = {}
		}
		nodesByCategory[node.category][node.id] = node
	})

	// Get outgoing edges for a node
	function getOutgoingEdges(nodeId: string) {
		return edges.filter((edge) => edge.source === nodeId)
	}

	// Get incoming edges for a node
	function getIncomingEdges(nodeId: string) {
		return edges.filter((edge) => edge.target === nodeId)
	}

	// Get all unique links for a node
	function getNodeLinks(nodeId: string) {
		const outgoingLinks = edges
			.filter((edge) => edge.source === nodeId && edge.links)
			.flatMap((edge) => edge.links || [])
		const incomingLinks = edges
			.filter((edge) => edge.target === nodeId && edge.links)
			.flatMap((edge) => edge.links || [])
		return [...new Set([...outgoingLinks, ...incomingLinks])]
	}

	// Category titles
	const categoryTitles: Record<string, string> = {
		litho: 'Lithography Equipment',
		fab: 'Foundries',
		design: 'Chip Designers',
		assembly: 'Assembly & Testing',
		end: 'AI Labs & End Users'
	}
</script>

<div class="container">
	{#each Object.entries(nodesByCategory) as [category, categoryNodes]}
		<h2>{categoryTitles[category]}</h2>
		{#each Object.values(categoryNodes) as node}
			<div class="company-section">
				<h3>{nodeInfo[node.id].title}</h3>
				<p class="description">{nodeInfo[node.id].description}</p>

				{#if nodeInfo[node.id].details.length > 0}
					<ul class="details">
						{#each nodeInfo[node.id].details as detail}
							<li>{detail}</li>
						{/each}
					</ul>
				{/if}

				{#if getOutgoingEdges(node.id).length > 0}
					<h4>Outgoing Connections:</h4>
					<ul class="connections">
						{#each getOutgoingEdges(node.id) as edge}
							<li>
								<strong>{nodes[edge.target].label}:</strong>
								{edge.description}
							</li>
						{/each}
					</ul>
				{/if}

				{#if getIncomingEdges(node.id).length > 0}
					<h4>Incoming Connections:</h4>
					<ul class="connections">
						{#each getIncomingEdges(node.id) as edge}
							<li>
								<strong>{nodes[edge.source].label}:</strong>
								{edge.description}
							</li>
						{/each}
					</ul>
				{/if}

				{#if getNodeLinks(node.id).length > 0}
					<h4>Sources:</h4>
					<ul class="links">
						{#each getNodeLinks(node.id) as link}
							<li>
								<a href={link} target="_blank" rel="noopener noreferrer">{getDomain(link)}</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	h2 {
		border-bottom: 2px solid #e5e7eb;
		padding-bottom: 0.5rem;
	}

	.company-section {
		margin-bottom: 2rem;
		padding: 1rem 0;
	}

	.description {
		color: #4b5563;
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.details {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.details li {
		color: #4b5563;
		margin-bottom: 0.25rem;
		line-height: 1.4;
	}

	.connections {
		list-style-type: none;
		padding: 0;
		margin: 0.5rem 0;
	}

	.connections li {
		color: #4b5563;
		margin-bottom: 0.5rem;
		line-height: 1.4;
		padding-left: 1rem;
		border-left: 2px solid #e5e7eb;
	}

	.links {
		list-style-type: none;
		padding: 0;
		margin: 0.5rem 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.links li {
		margin: 0;
	}

	.links a {
		color: #2563eb;
		text-decoration: underline;
		word-break: break-all;
		font-size: 0.9em;
	}

	.links a:hover {
		color: #1d4ed8;
	}
</style>
