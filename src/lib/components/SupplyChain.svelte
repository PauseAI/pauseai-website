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

	interface Edge {
		source: string
		target: string
		links?: string[] | null
		description?: string | null
		weight?: number
	}

	// Reactive state
	let selectedNodeId: string | null = null
	let selectedEdge: Edge | null = null

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
		INTEL_FAB: { id: 'INTEL_FAB', label: 'Intel Foundry', category: 'fab' },
		SMIC: { id: 'SMIC', label: 'SMIC', category: 'fab' },
		NVIDIA: { id: 'NVIDIA', label: 'Nvidia', category: 'design' },
		AMD: { id: 'AMD', label: 'AMD', category: 'design' },
		GROQ: { id: 'GROQ', label: 'Groq', category: 'design' },
		INTEL: { id: 'INTEL', label: 'Intel AI', category: 'design' },
		CEREBRAS: { id: 'CEREBRAS', label: 'Cerebras', category: 'design' },
		HUAWEI: { id: 'HUAWEI', label: 'Huawei', category: 'design' },
		ASE: { id: 'ASE', label: 'ASE (Foxconn)', category: 'assembly' },
		ASE_GROUP: { id: 'ASE_GROUP', label: 'ASE Group', category: 'assembly' },
		AMKOR: { id: 'AMKOR', label: 'Amkor', category: 'assembly' },
		OPENAI: { id: 'OPENAI', label: 'OpenAI', category: 'end' },
		GOOGLE: { id: 'GOOGLE', label: 'Google AI', category: 'end' },
		META: { id: 'META', label: 'Meta AI', category: 'end' },
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
	const edges: Edge[] = [
		{
			source: 'ZEISS',
			target: 'ASML',
			links: null,
			description:
				"Zeiss is the exclusive global supplier of critical optical systems (mirrors, lenses) for ASML's EUV and High-NA EUV lithography machines, a foundational and monopolistic relationship for advanced chip manufacturing.",
			weight: 10
		},
		{
			source: 'ASML',
			target: 'TSMC',
			links: null,
			description:
				"ASML supplies TSMC with essential EUV and High-NA EUV lithography systems, critical for TSMC's production of the world's most advanced semiconductor nodes (7nm, 5nm, 3nm, 2nm). TSMC is a primary customer for ASML's latest technologies.",
			weight: 10
		},
		{
			source: 'ASML',
			target: 'SAMSUNG',
			links: [
				'https://patentpc.com/blog/top-chip-making-equipment-companies-asml-applied-materials-and-lam-research-market-data',
				'https://www.sammobile.com/news/asml-changes-its-plans-for-the-755-million-chip-research-plant-with-samsung/',
				'https://www.trendforce.com/news/2025/04/21/news-samsung-and-asml-reportedly-scrap-euv-research-center-in-hwaseong-eyeing-new-alternatives/'
			],
			description:
				'ASML provides Samsung Foundry with EUV lithography systems, enabling Samsung to manufacture advanced chips and compete at leading-edge nodes. Samsung is a major ASML customer and collaborates on High-NA EUV adoption.',
			weight: 10
		},
		{
			source: 'ASML',
			target: 'INTEL_FAB',
			links: [
				'https://newsroom.intel.com/de/intel-foundry/intel-foundry-opens-new-frontier-chipmaking',
				'https://www.asml.com/en/news/press-releases/2022/intel-and-asml-strengthen-their-collaboration-to-drive-high-na-into-manufacturing-in-2025'
			],
			description:
				"ASML supplies Intel Foundry with EUV and is the first commercial supplier of High-NA EUV systems (TWINSCAN EXE:5000/5200). This is crucial for Intel's IDM 2.0 strategy and its goal to achieve process leadership.",
			weight: 10
		},
		{
			source: 'SMEE',
			target: 'SMIC',
			links: null,
			description:
				"SMEE, China's leading domestic lithography tool maker, supplies DUV scanners (e.g., 28nm-capable SSA800) to SMIC, supporting China's semiconductor self-sufficiency efforts, especially for mature nodes and potentially enabling advanced nodes via multi-patterning.",
			weight: 7
		},
		{
			source: 'TSMC',
			target: 'NVIDIA',
			links: [
				'https://www.carboncredits.com/tsmc-dominates-ai-chip-market-with-record-sales-but-can-it-its-tackle-rising-emissions/',
				'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing'
			],
			description:
				"TSMC is the primary foundry for Nvidia, manufacturing its leading AI GPUs (A100, H100, Blackwell) using its most advanced process nodes (e.g., 4NP for Blackwell). This is critical for Nvidia's market leadership.",
			weight: 9
		},
		{
			source: 'TSMC',
			target: 'AMD',
			links: [
				'https://www.carboncredits.com/tsmc-dominates-ai-chip-market-with-record-sales-but-can-it-its-tackle-rising-emissions/',
				'https://www.trendforce.com/news/2025/05/06/news-amd-reportedly-drops-samsung-foundry-in-favor-of-tsmcs-4nm-production-in-arizona/'
			],
			description:
				"TSMC is a key foundry partner for AMD, manufacturing its advanced CPUs, GPUs (including Instinct AI accelerators like MI300), and future 2nm 'Venice' chips, crucial for AMD's competitiveness in HPC and AI.",
			weight: 9
		},
		{
			source: 'TSMC',
			target: 'CEREBRAS',
			links: [
				'https://en.wikipedia.org/wiki/Cerebras',
				'https://www.nextplatform.com/2024/03/14/cerebras-goes-hyperscale-with-third-gen-waferscale-supercomputers/',
				'https://arxiv.org/html/2503.11698v1'
			],
			description:
				"TSMC manufactures Cerebras Systems' unique Wafer-Scale Engines (WSE), with WSE-2 on 7nm and WSE-3 on 5nm. This partnership is essential for producing these massive, specialized AI chips.",
			weight: 8
		},
		{
			source: 'TSMC',
			target: 'OPENAI',
			links: [
				'https://aimagazine.com/articles/whats-behind-openais-first-custom-chip-design-with-tsmc',
				'https://www.datacenterdynamics.com/en/news/openai-finalizing-custom-ai-chip-design-ahead-of-2026-launch-report/'
			],
			description:
				"OpenAI is partnering with TSMC to manufacture its first custom-designed AI chips using TSMC's 3nm process. This is a strategic move for OpenAI to optimize hardware and reduce reliance on external suppliers.",
			weight: 7
		},
		{
			source: 'TSMC',
			target: 'META',
			links: [
				'https://technologymagazine.com/articles/behind-the-testing-of-metas-first-ai-training-chip',
				'https://www.newelectronics.co.uk/content/blogs/meta-said-to-be-testing-in-house-ai-chip-on-tsmc-s-5nm/'
			],
			description:
				"Meta is collaborating with TSMC to manufacture its in-house AI chips (MTIA program) on TSMC's 5nm process. This is key to Meta's strategy for custom silicon for its AI workloads.",
			weight: 7
		},
		{
			source: 'TSMC',
			target: 'GOOGLE',
			links: [
				'https://siliconangle.com/2025/03/17/google-reportedly-partnering-mediatek-next-generation-tpu-production/',
				'https://www.techpowerup.com/334245/google-teams-up-with-mediatek-for-next-generation-tpu-v7-design'
			],
			description:
				"TSMC is set to manufacture Google's next-generation TPU v7 (via design partner MediaTek), continuing its role as a key foundry for Google's custom AI silicon, essential for Google's AI and cloud services.",
			weight: 8
		},
		{
			source: 'SAMSUNG',
			target: 'NVIDIA',
			links: ['https://sammyguru.com/nvidia-may-partner-with-samsung-foundry-for-next-gen-gpus/'],
			description:
				'Samsung Foundry has manufactured GPUs for Nvidia (e.g., RTX 30 series on 8nm) and supplies GDDR7 memory. It remains a potential secondary foundry source for Nvidia to diversify its supply chain.',
			weight: 5
		},
		{
			source: 'SAMSUNG',
			target: 'AMD',
			links: [
				'https://www.trendforce.com/news/2025/05/06/news-amd-reportedly-drops-samsung-foundry-in-favor-of-tsmcs-4nm-production-in-arizona/'
			],
			description:
				'AMD has explored Samsung Foundry for 4nm production (SF4X) as a dual-source, but recent reports suggest a shift to TSMC for these nodes. Samsung could still be a partner for other nodes or components.',
			weight: 3
		},
		{
			source: 'SAMSUNG',
			target: 'GROQ',
			links: [
				'https://en.wikipedia.org/wiki/Groq',
				'https://www.prnewswire.com/news-releases/groq-selects-samsung-foundry-to-bring-next-gen-lpu-to-the-ai-acceleration-market-301900464.html'
			],
			description:
				"Groq has selected Samsung Foundry in Taylor, Texas, to manufacture its next-generation Language Processing Units (LPUs) using Samsung's 4nm (SF4X) process, critical for Groq's product roadmap.",
			weight: 8
		},
		{
			source: 'INTEL_FAB',
			target: 'INTEL',
			links: [
				'https://www.eetimes.com/intel-financial-risks-layoffs-foundry-ambitions/',
				'https://www.intel.com/content/www/us/en/products/details/processors/ai-accelerators/gaudi.html'
			],
			description:
				"Intel Foundry manufactures Intel's own designed chips, including CPUs and AI accelerators like the Gaudi series, fundamental to Intel's IDM (Integrated Device Manufacturer) model.",
			weight: 9
		},
		{
			source: 'SMIC',
			target: 'HUAWEI',
			links: null,
			description:
				"SMIC is Huawei's primary Chinese foundry partner, manufacturing Kirin SoCs and Ascend AI processors (e.g., on 7nm using DUV). This is vital for Huawei due to US sanctions restricting access to global foundries.",
			weight: 9
		},
		{
			source: 'NVIDIA',
			target: 'ASE_GROUP',
			links: [
				'https://ase.aseglobal.com/blog/technology/advanced-packaging-for-ai-chiplet-and-cpo/',
				'https://www.tomshardware.com/tech-industry/artificial-intelligence/made-in-the-usa-inside-nvidias-usd500-billion-server-gambit'
			],
			description:
				"Nvidia likely utilizes ASE Group, the world's largest OSAT, for a portion of its packaging needs for GPUs and AI chips, leveraging ASE's scale and broad capabilities for volume production.",
			weight: 6
		},
		{
			source: 'AMD',
			target: 'ASE_GROUP',
			links: [
				'https://ase.aseglobal.com/blog/technology/advanced-packaging-for-ai-chiplet-and-cpo/',
				'https://www.3dincites.com/2025/01/asia-may-still-be-the-hottest-spot-for-advanced-packaging/'
			],
			description:
				"AMD likely uses ASE Group for some of its packaging requirements, given ASE's market leadership. AMD employs a multi-OSAT strategy for its diverse product portfolio.",
			weight: 5
		},
		{
			source: 'INTEL',
			target: 'ASE_GROUP',
			links: [
				'https://newsroom.intel.com/intel-foundry/intel-foundry-gathers-customers-partners-outlines-priorities',
				'https://ase.aseglobal.com/blog/technology/advanced-packaging-for-ai-chiplet-and-cpo/'
			],
			description:
				'Intel may use ASE Group for certain packaging needs or overflow capacity, supplementing its internal capabilities and strategic OSAT partnerships like with Amkor for EMIB.',
			weight: 4
		},
		{
			source: 'NVIDIA',
			target: 'AMKOR',
			links: [
				'https://www.supplychaindive.com/news/nvidia-us-production-blackwell-tsmc-ai-trump-tariffs/745395/',
				'https://telecomlead.com/semiconductor/nvidia-to-invest-500-bn-to-build-ai-servers-working-with-tsmc-foxconn-wistron-120668'
			],
			description:
				'Nvidia partners with Amkor for AI chip packaging and testing, especially for its US-based manufacturing initiatives. Amkor is building a new advanced packaging facility in Arizona.',
			weight: 7
		},
		{
			source: 'AMD',
			target: 'AMKOR',
			links: [
				'https://www.3dincites.com/2025/01/asia-may-still-be-the-hottest-spot-for-advanced-packaging/',
				'https://www.supplychaindive.com/news/nvidia-us-production-blackwell-tsmc-ai-trump-tariffs/745395/'
			],
			description:
				"Amkor is a strategic OSAT option for AMD, particularly for US-based supply chains, leveraging Amkor's advanced packaging capabilities and proximity to US fabs like TSMC Arizona.",
			weight: 6
		},
		{
			source: 'INTEL',
			target: 'AMKOR',
			links: [
				'https://newsroom.intel.com/intel-foundry/intel-foundry-gathers-customers-partners-outlines-priorities',
				'https://convergedigest.com/intel-expands-foundry-services-with-emib-partnership-new-alliances-and-18a-variants/'
			],
			description:
				'Intel Foundry partners with Amkor to qualify and enable its EMIB advanced packaging at Amkor facilities (Korea, future US), enhancing flexibility for foundry customers.',
			weight: 7
		},
		{
			source: 'NVIDIA',
			target: 'OPENAI',
			links: [
				'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing',
				'https://www.datacenterdynamics.com/en/news/openai-finalizing-custom-ai-chip-design-ahead-of-2026-launch-report/'
			],
			description:
				"OpenAI is a major consumer of Nvidia's AI GPUs (e.g., H100, Blackwell) for training and running its large-scale AI models, making Nvidia a critical hardware supplier for OpenAI's current operations.",
			weight: 8
		},
		{
			source: 'NVIDIA',
			target: 'GOOGLE',
			links: [
				'https://nvidianews.nvidia.com/news/nvidia-blackwell-platform-arrives-to-power-a-new-era-of-computing'
			],
			description:
				"Google Cloud offers Nvidia's AI GPUs (A100, H100, Blackwell) for its cloud AI services. Nvidia is an important supplier for Google's cloud AI infrastructure offerings.",
			weight: 7
		},
		{
			source: 'NVIDIA',
			target: 'META',
			links: [
				'https://technologymagazine.com/articles/behind-the-testing-of-metas-first-ai-training-chip'
			],
			description:
				"Meta is a massive consumer of Nvidia's AI GPUs, investing billions to power its AI initiatives for social media, recommendations, and Llama models. Nvidia is a critical supplier for Meta's AI infrastructure.",
			weight: 8
		},
		{
			source: 'NVIDIA',
			target: 'XAI',
			links: [
				'https://www.rdworldonline.com/how-xai-turned-a-factory-shell-into-an-ai-colossus-to-power-grok-3-and-beyond/'
			],
			description:
				'X.ai utilizes a large cluster of Nvidia H100 GPUs (reportedly 200,000) to train its Grok LLMs, with plans to adopt H200/Blackwell. Nvidia is an indispensable hardware supplier for X.ai.',
			weight: 8
		},
		{
			source: 'INTEL',
			target: 'GOOGLE',
			links: [
				'https://www.intel.com/content/www/us/en/products/details/processors/ai-accelerators/gaudi.html'
			],
			description:
				"Google Cloud offers Intel's Gaudi AI accelerators, providing customers an alternative for AI workloads. Intel supplies Gaudi chips to Google for its cloud infrastructure.",
			weight: 5
		},
		{
			source: 'NVIDIA',
			target: 'ASE',
			links: [
				'https://www.supplychaindive.com/news/nvidia-us-production-blackwell-tsmc-ai-trump-tariffs/745395/',
				'https://telecomlead.com/semiconductor/nvidia-to-invest-500-bn-to-build-ai-servers-working-with-tsmc-foxconn-wistron-120668'
			],
			description:
				"Nvidia supplies its AI chips and components to Foxconn (node 'ASE') for assembly into AI servers and supercomputers. Foxconn is a key contract manufacturing partner for Nvidia's AI infrastructure.",
			weight: 7
		},
		{
			source: 'AMD',
			target: 'ASE',
			links: null,
			description:
				"AMD supplies its AI accelerators and components to Foxconn (node 'ASE') for assembly into AMD-based AI server systems, leveraging Foxconn's large-scale manufacturing capabilities.",
			weight: 5
		},
		{
			source: 'ASE',
			target: 'OPENAI',
			links: [
				'https://www.supplychaindive.com/news/nvidia-us-production-blackwell-tsmc-ai-trump-tariffs/745395/'
			],
			description:
				"Foxconn (node 'ASE') assembles AI servers (often using Nvidia/AMD chips) and supplies these complete systems to large-scale AI consumers like OpenAI for their compute infrastructure.",
			weight: 6
		},
		{
			source: 'ASE',
			target: 'GOOGLE',
			links: [
				'https://www.supplychaindive.com/news/nvidia-us-production-blackwell-tsmc-ai-trump-tariffs/745395/'
			],
			description:
				"Foxconn (node 'ASE') assembles AI server systems which are supplied to Google for its Cloud services and internal AI research, fulfilling Google's need for vast AI server fleets.",
			weight: 6
		},
		{
			source: 'ASE',
			target: 'META',
			links: [
				'https://www.supplychaindive.com/news/nvidia-us-production-blackwell-tsmc-ai-trump-tariffs/745395/'
			],
			description:
				"Foxconn (node 'ASE') manufactures AI server systems procured by Meta for its extensive AI infrastructure, supporting its social media platforms and generative AI model development.",
			weight: 6
		},
		{
			source: 'ASE',
			target: 'XAI',
			links: [
				'https://www.rdworldonline.com/how-xai-turned-a-factory-shell-into-an-ai-colossus-to-power-grok-3-and-beyond/'
			],
			description:
				"Foxconn (node 'ASE') assembles high-performance AI server systems (e.g., Nvidia H100 based) acquired by X.ai for building supercomputing clusters to train LLMs like Grok.",
			weight: 6
		},
		{
			source: 'ASE_GROUP',
			target: 'OPENAI',
			links: [
				'https://ase.aseglobal.com/blog/technology/advanced-packaging-for-ai-chiplet-and-cpo/'
			],
			description:
				"Indirect: ASE Group packages chips for designers (e.g., Nvidia) which OpenAI then consumes. OpenAI's custom chips are directly partnered with TSMC/Broadcom for manufacturing/packaging.",
			weight: 3
		},
		{
			source: 'ASE_GROUP',
			target: 'META',
			links: ['https://ase.aseglobal.com/blog/technology/ai-and-semiconductor-in-reciprocity/'],
			description:
				"Indirect: ASE Group packages chips for various vendors whose products Meta consumes. Meta's custom MTIA chips are directly partnered with TSMC for manufacturing/packaging.",
			weight: 3
		}
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
				'EUV machines have remote kill-switch capability',
				'Critical choke point in AI chip supply chain',
				'Subject to export controls from NL government'
			]
		},
		ZEISS: {
			title: 'Zeiss',
			description: "Exclusive provider of critical optical systems for ASML's EUV machines.",
			details: []
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
			title: 'Intel AI (Products)',
			description: "Intel's AI chip products, including Gaudi accelerators.",
			details: [
				'Develops Gaudi AI accelerators',
				'Acquired Habana Labs',
				'Internal manufacturing capability (via Intel Foundry)',
				'OneAPI software platform'
			]
		},
		ASE: {
			title: 'ASE (Foxconn)',
			description: "World's largest electronics manufacturer, key assembler of AI servers.",
			details: [
				'Major Apple supplier (general electronics)',
				'Key assembler of AI servers for Nvidia, AMD, etc.',
				'Facilities across Asia and globally',
				'Handles final product assembly for many tech giants'
			]
		},
		ASE_GROUP: {
			title: 'ASE Group',
			description: "World's largest semiconductor packaging and testing (OSAT) provider.",
			details: [
				'Advanced packaging solutions (CoWoS-like, FOCoS, SiP)',
				'Tests final chip products',
				'Key role in supply chain for fabless & IDMs',
				'Facilities in multiple countries'
			]
		},
		AMKOR: {
			title: 'Amkor Technology',
			description: 'Major global OSAT provider with advanced packaging capabilities.',
			details: [
				'Provides advanced packaging (e.g., SWIFT, S-SWIFT, HDFO)',
				'Key partner for US-based chip initiatives',
				'Building new facility in Arizona',
				'Serves fabless, IDM, and foundry customers'
			]
		},
		OPENAI: {
			title: 'OpenAI',
			description: 'Leading AI research company focused on AGI development.',
			details: [
				'Developed GPT-4, DALL-E, Sora',
				'Requires massive compute infrastructure (Nvidia GPUs, custom chips in development)',
				'Partnership with Microsoft',
				'Focus on AI safety research'
			]
		},
		GOOGLE: {
			title: 'Google (DeepMind & Cloud)',
			description: 'Pioneer in AI research and cloud AI services.',
			details: [
				'Developed Gemini, PaLM, TPUs',
				'Massive TPU infrastructure for internal use and Cloud',
				'Leading AI research lab (DeepMind)',
				'Offers Nvidia GPUs and Intel Gaudi on Cloud'
			]
		},
		META: {
			title: 'Meta AI',
			description:
				'Major AI research organization with open source focus and large infrastructure.',
			details: [
				'Developed LLaMA models',
				'Building massive GPU clusters (Nvidia)',
				'Developing in-house AI chips (MTIA)',
				'Focus on generative AI and metaverse applications'
			]
		},
		SMIC: {
			title: 'SMIC (Semiconductor Manufacturing International Corporation)',
			description:
				"China's largest chip manufacturer, developing advanced process nodes despite restrictions.",
			details: [
				'Achieved 7nm process using DUV (multi-patterning)',
				'Working on 5nm development',
				'Subject to US export controls (limited access to EUV)',
				"Key to China's domestic supply chain efforts"
			]
		},
		HUAWEI: {
			title: 'Huawei (HiSilicon)',
			description:
				'Chinese technology company developing AI chips (Ascend) and SoCs (Kirin) through its HiSilicon division.',
			details: [
				'Designs Ascend AI processors and Kirin SoCs',
				'Partners with SMIC for manufacturing due to sanctions',
				'Subject to US trade restrictions',
				'Focusing on domestic supply chain for chips'
			]
		},
		SMEE: {
			title: 'SMEE (Shanghai Micro Electronics Equipment)',
			description: 'Chinese lithography equipment manufacturer developing DUV technology.',
			details: [
				'Developing DUV lithography tools (e.g., 28nm capable SSA800/900)',
				'Working on more advanced DUV immersion systems',
				"Key player in China's chip independence strategy",
				'Cannot yet produce EUV machines'
			]
		},
		GROQ: {
			title: 'Groq',
			description:
				'AI chip company focusing on Language Processing Units (LPUs) for ultra-low latency inference.',
			details: [
				'Developed LPU architecture for fast inference',
				'Uses Samsung 4nm for next-gen chips',
				'Claims superior inference speed and energy efficiency',
				'Founded by former Google TPU engineers'
			]
		},
		CEREBRAS: {
			title: 'Cerebras Systems',
			description: 'Developer of Wafer-Scale Engines (WSE), the largest AI chips in the world.',
			details: [
				'WSE-3 is current flagship (5nm, 4 trillion transistors)',
				'Specialized for AI training and inference',
				'Uses TSMC for manufacturing',
				'Offers CS-3 systems built around WSE-3'
			]
		},
		XAI: {
			title: 'X.ai',
			description: 'AI company by Elon Musk developing large language models like Grok.',
			details: [
				'Developing Grok model series',
				'Building massive H100 GPU clusters for training',
				'Focus on "truthful" and "maximum curiosity" AI',
				'Aims for AGI development'
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

		// Node total visual width: CSS width (100px) + padding (2*0.5rem=16px) + border (2*2px=4px) = 120px
		// Node visual half width = 60px
		// Assume graph container width is 56rem = 896px (for percentage calculation)
		// This is an approximation. A more dynamic calculation based on actual container width could be implemented if needed.
		const nodeVisualHalfWidthPx = 60
		const assumedContainerWidthPx = 896 // 56rem * 16px/rem (assuming 1rem = 16px)
		const offsetXPercent = (nodeVisualHalfWidthPx / assumedContainerWidthPx) * 100

		// If dx is 0, Math.sign(dx) is 0, so no horizontal offset, which is correct.
		const calculatedStartX = startX + Math.sign(dx) * offsetXPercent
		const calculatedEndX = endX - Math.sign(dx) * offsetXPercent

		return {
			startX: calculatedStartX,
			startY, // Y positions are still node centers
			endX: calculatedEndX,
			endY // Y positions are still node centers
		}
	}

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
						x1="{points.startX}%"
						y1="{points.startY}%"
						x2="{points.endX}%"
						y2="{points.endY}%"
						stroke="transparent"
						stroke-width="10"
						pointer-events="stroke"
					/>
					<line
						x1="{points.startX}%"
						y1="{points.startY}%"
						x2="{points.endX}%"
						y2="{points.endY}%"
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
					<button class="modal-close" on:click={closeAllModals} autofocus aria-label="Close dialog">
						×
					</button>
				</div>
				{#if selectedEdge.description}
					<p class="modal-description" id="edge-dialog-description">
						{selectedEdge.description}
					</p>
				{/if}
				{#if selectedEdge.links && selectedEdge.links.length > 0}
					<h4 class="modal-subtitle">Sources:</h4>
					<ul class="modal-links">
						{#each selectedEdge.links as link}
							<li class="modal-link-item">
								<a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
							</li>
						{/each}
					</ul>
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

	:global(body) {
		margin: 0;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
	}
</style>
