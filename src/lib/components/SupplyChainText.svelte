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
		equipment: 'Equipment',
		foundry: 'Foundries',
		design: 'Chip Designers',
		eda: 'EDA',
		memory: 'Memory',
		assembly: 'Assembly & Testing',
		end: 'AI Labs & End Users'
	}
</script>

<div class="container">
	{#each Object.entries(nodesByCategory) as [category, categoryNodes]}
		<h2>{categoryTitles[category]}</h2>
		{#each Object.values(categoryNodes) as node}
			<div class="company-section" id={node.id}>
				<h3><a class="anchor-link" href={`#${node.id}`}>{nodeInfo[node.id].title}</a></h3>
				<p class="description">{nodeInfo[node.id].description}</p>

				{#if nodeInfo[node.id].details.length > 0}
					<ul class="details">
						{#each nodeInfo[node.id].details as detail}
							<li>{detail}</li>
						{/each}
					</ul>
				{/if}

				{#if getOutgoingEdges(node.id).length > 0}
					<h4>Customers:</h4>
					<ul class="connections">
						{#each getOutgoingEdges(node.id) as edge}
							<li>
								<strong
									><a class="anchor-link" href={`#${edge.target}`}>{nodes[edge.target].label}</a
									>:</strong
								>
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
<a href="#top" class="back-to-top">Back to top ↑</a>

<style>
	h2 {
		border-bottom: 2px solid var(--brand-subtle);
		padding-bottom: 0.5rem;
	}

	.company-section {
		margin-bottom: 2rem;
		padding: 1rem 0;
	}

	.description {
		color: var(--text);
		margin: 0.5rem 0;
		line-height: 1.5;
	}

	.details {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 0.5rem 0;
	}

	.details li {
		color: var(--text);
		margin-bottom: 0.25rem;
		line-height: 1.4;
	}

	.connections {
		list-style-type: none;
		padding: 0;
		margin: 0.5rem 0;
	}

	.connections li {
		color: var(--text);
		margin-bottom: 0.5rem;
		line-height: 1.4;
		padding-left: 1rem;
		border-left: 2px solid var(--brand-subtle);
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

	.anchor-link {
		color: var(--text);
		text-decoration: none;
		position: relative;
	}

	.anchor-link:hover {
		text-decoration: underline;
		color: var(--brand);
	}

	.back-to-top {
		display: block;
		margin: 2rem auto 0 auto;
		text-align: center;
		color: var(--brand);
		font-weight: bold;
		text-decoration: none;
		font-size: 1.1em;
		transition: color 0.2s;
	}
	.back-to-top:hover {
		color: var(--text);
		text-decoration: underline;
	}
</style>
