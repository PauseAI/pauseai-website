import type { Node, NodeInfo, Edge } from './types'

export const nodes: Record<string, Node> = {
	// Lithography & Equipment
	ASML: { id: 'ASML', label: 'ASML', category: 'equipment' },
	ZEISS: { id: 'ZEISS', label: 'Zeiss', category: 'equipment' },
	SMEE: { id: 'SMEE', label: 'SMEE', category: 'equipment' },
	APPLIED: { id: 'APPLIED', label: 'Applied Materials', category: 'equipment' },
	KLA: { id: 'KLA', label: 'KLA', category: 'equipment' },
	TEL: { id: 'TEL', label: 'Tokyo Electron', category: 'equipment' },
	NIKON: { id: 'NIKON', label: 'Nikon', category: 'equipment' },

	// Foundries
	TSMC: { id: 'TSMC', label: 'TSMC', category: 'foundry' },
	SAMSUNG: { id: 'SAMSUNG', label: 'Samsung', category: 'foundry' },
	INTEL_FAB: { id: 'INTEL_FAB', label: 'Intel Foundry', category: 'foundry' },
	SMIC: { id: 'SMIC', label: 'SMIC', category: 'foundry' },
	UMC: { id: 'UMC', label: 'UMC', category: 'foundry' },
	GFS: { id: 'GFS', label: 'GlobalFoundries', category: 'foundry' },

	// Design / IP / EDA
	NVIDIA: { id: 'NVIDIA', label: 'Nvidia', category: 'design' },
	AMD: { id: 'AMD', label: 'AMD', category: 'design' },
	GROQ: { id: 'GROQ', label: 'Groq', category: 'design' },
	INTEL: { id: 'INTEL', label: 'Intel AI', category: 'design' },
	CEREBRAS: { id: 'CEREBRAS', label: 'Cerebras', category: 'design' },
	HUAWEI: { id: 'HUAWEI', label: 'Huawei', category: 'design' },
	ARM: { id: 'ARM', label: 'ARM', category: 'design' },
	CADENCE: { id: 'CADENCE', label: 'Cadence', category: 'eda' },
	SYNOPSYS: { id: 'SYNOPSYS', label: 'Synopsys', category: 'eda' },

	// Memory
	MICRON: { id: 'MICRON', label: 'Micron', category: 'memory' },
	SKHYNIX: { id: 'SKHYNIX', label: 'SK Hynix', category: 'memory' },

	// Assembly / OSAT
	ASE: { id: 'ASE', label: 'ASE (Foxconn)', category: 'assembly' },
	ASE_GROUP: { id: 'ASE_GROUP', label: 'ASE Group', category: 'assembly' },
	AMKOR: { id: 'AMKOR', label: 'Amkor', category: 'assembly' },
	JCET: { id: 'JCET', label: 'JCET', category: 'assembly' },
	SPIL: { id: 'SPIL', label: 'SPIL', category: 'assembly' },

	// Cloud / End users
	AWS: { id: 'AWS', label: 'AWS', category: 'end' },
	AZURE: { id: 'AZURE', label: 'Azure (Microsoft)', category: 'end' },
	OPENAI: { id: 'OPENAI', label: 'OpenAI', category: 'end' },
	GOOGLE: { id: 'GOOGLE', label: 'Google', category: 'end' },
	META: { id: 'META', label: 'Meta AI', category: 'end' },
	XAI: { id: 'XAI', label: 'X.ai', category: 'end' },
	DEEPSEEK: { id: 'DEEPSEEK', label: 'Deepseek', category: 'end' }
}

export const nodeInfo: Record<string, NodeInfo> = {
	APPLIED: {
		title: 'Applied Materials',
		description:
			'Largest semiconductor equipment company covering deposition, etch and CMP tools used by every leading-edge fab.',
		details: [
			'Leader in PVD/CVD, etch and CMP equipment',
			'Critical for 3D NAND, logic and packaging steps',
			'Supplies TSMC, Samsung, Intel and others',
			'Subject to US export controls (China restrictions)'
		]
	},
	KLA: {
		title: 'KLA',
		description: 'Dominant player in process-control, wafer inspection and metrology systems.',
		details: [
			'Essential for yield-learning at advanced nodes',
			'Sells to all top foundries and memory makers'
		]
	},
	TEL: {
		title: 'Tokyo Electron',
		description:
			'Top-three global equipment vendor providing etch, deposition and photoresist coat/develop tools.',
		details: [
			'Japanese powerhouse with strong co-development at TSMC & Samsung',
			'Key for FinFET/GAAFET patterning and 3D NAND fabrication'
		]
	},
	NIKON: {
		title: 'Nikon',
		description: 'Supplier of immersion DUV lithography scanners (No.2 after ASML in lithography).',
		details: ['Competition to ASML in mature nodes', 'Important for 28-90 nm and overlay tools']
	},
	UMC: {
		title: 'UMC (United Microelectronics)',
		description:
			'Taiwan-based pure-play foundry focused on 28 nm and above with selective 14/12 nm capacity.',
		details: [
			'~6% global foundry market share',
			'Key second-source for mature logic and specialty nodes'
		]
	},
	GFS: {
		title: 'GlobalFoundries',
		description:
			'US-headquartered pure-play foundry specializing in mature and RF/process-optimized nodes.',
		details: [
			'Largely exited sub-10 nm race in 2018',
			'Strategic US/EU fabs aligned with CHIPS Act customers'
		]
	},
	ARM: {
		title: 'ARM',
		description:
			'Licensor of CPU/GPU architectures underlying most mobile and emerging AI accelerators.',
		details: ['Neoverse for data-center CPUs', 'Widely licensed by Nvidia, AWS, Google, etc.']
	},
	CADENCE: {
		title: 'Cadence Design Systems',
		description:
			'EDA software provider (design, verification, implementation) indispensable to chip designers.',
		details: [
			'Fusion/Innovus, Spectre simulation suites',
			'Collaborates with TSMC and Samsung on advanced PDKs'
		]
	},
	SYNOPSYS: {
		title: 'Synopsys',
		description: 'Largest EDA vendor and IP licensor (Interface & ARC).',
		details: [
			'Design Compiler & Fusion Compiler toolchains',
			'Owns critical interface IP (PCIe, DDR, HBM)'
		]
	},
	MICRON: {
		title: 'Micron Technology',
		description: 'US memory giant producing DRAM, NAND and HBM for AI accelerators.',
		details: ['HBM3E supplier for Nvidia Blackwell', 'Boise-based R&D; fabs in US, Taiwan, Japan']
	},
	SKHYNIX: {
		title: 'SK Hynix',
		description: 'Korean memory leader and primary HBM3 supplier for Nvidia H100/H200.',
		details: [
			'Developed world-first HBM3E 12-high stack',
			'Joint ventures with TSMC on advanced packaging'
		]
	},
	JCET: {
		title: 'JCET Group',
		description: "China's largest OSAT offering flip-chip, SiP and fan-out panel-level packaging.",
		details: []
	},
	SPIL: {
		title: 'Siliconware Precision Industries (SPIL)',
		description: 'Taiwanese OSAT subsidiary of ASE focusing on bumping and advanced SiP.',
		details: []
	},
	AWS: {
		title: 'Amazon Web Services',
		description:
			'Largest cloud provider, massive buyer of AI accelerators and developer of Trainium/Inferentia chips.',
		details: [
			'Ongoing purchases of Nvidia H100/H200',
			'Designs custom Graviton/Trainium chips (fabricated by TSMC)'
		]
	},
	AZURE: {
		title: 'Microsoft Azure',
		description:
			'Cloud platform powering OpenAI and hosting Nvidia, AMD and custom Cobalt/ Maia AI accelerators.',
		details: ['Cobalt / Maia chips fabbed at TSMC', 'Major H100/H200 and MI300 customer']
	},
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
		description: 'Major AI research organization with open source focus and large infrastructure.',
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
	},
	DEEPSEEK: {
		title: 'Deepseek',
		description: 'Chinese AI company developing large language models.',
		details: [
			'Acquired fame with the Deepseek r1 reasoning model',
			'Focus on open source AI models'
		]
	}
}

export const edges: Edge[] = [
	// Lithography & equipment → fabs
	{
		source: 'APPLIED',
		target: 'TSMC',
		links: null,
		description:
			'Applied Materials supplies critical deposition, etch and CMP tools that enable every advanced TSMC node.',
		weight: 9
	},
	{
		source: 'APPLIED',
		target: 'SAMSUNG',
		links: null,
		description:
			'Samsung Foundry relies on Applied Materials equipment across logic and memory fabs.',
		weight: 8
	},
	{
		source: 'APPLIED',
		target: 'INTEL_FAB',
		links: null,
		description:
			'Intel’s new Arizona and Ohio fabs deploy Applied Materials platforms for GAAFET manufacturing.',
		weight: 8
	},
	{
		source: 'KLA',
		target: 'TSMC',
		links: null,
		description:
			'KLA’s inspection & metrology systems are indispensable for TSMC yield‑ramp at 3 nm and below.',
		weight: 8
	},
	{
		source: 'TEL',
		target: 'TSMC',
		links: null,
		description:
			'Tokyo Electron coat/develop and etch tools form a backbone of TSMC patterning flows.',
		weight: 7
	},

	// Memory → AI chip vendors
	{
		source: 'MICRON',
		target: 'NVIDIA',
		links: null,
		description:
			'Micron supplies HBM3E stacks for Nvidia Blackwell GPUs, a critical component for memory bandwidth.',
		weight: 7
	},
	{
		source: 'SKHYNIX',
		target: 'NVIDIA',
		links: null,
		description:
			'SK Hynix is the primary HBM3 supplier for Nvidia’s Hopper GPUs and early Blackwell shipments.',
		weight: 7
	},

	// IP / EDA relationships
	{
		source: 'ARM',
		target: 'NVIDIA',
		links: null,
		description: 'Nvidia licenses ARM CPU cores (Grace) for its Grace Hopper/Blackwell superchips.',
		weight: 6
	},
	{
		source: 'ARM',
		target: 'AWS',
		links: null,
		description: 'AWS Graviton and Trainium chips are built on ARM Neoverse designs.',
		weight: 6
	},
	{
		source: 'CADENCE',
		target: 'NVIDIA',
		links: null,
		description:
			'Nvidia uses Cadence digital and analog toolchains for chip implementation and verification.',
		weight: 5
	},
	{
		source: 'SYNOPSYS',
		target: 'AMD',
		links: null,
		description:
			'AMD relies on Synopsys EDA tools and interface IP (PCIe, DDR) for its MI300 family.',
		weight: 5
	},

	// Cloud providers consuming accelerators
	{
		source: 'NVIDIA',
		target: 'AWS',
		links: null,
		description: 'AWS deploys tens of thousands of Nvidia H100 GPUs in its EC2 UltraClusters.',
		weight: 8
	},
	{
		source: 'NVIDIA',
		target: 'AZURE',
		links: null,
		description: 'Microsoft Azure is a launch partner for Nvidia Blackwell HGX racks.',
		weight: 8
	},
	{
		source: 'AMD',
		target: 'AWS',
		links: null,
		description: 'AWS offers AMD Instinct MI300X instances for inference‑optimized workloads.',
		weight: 6
	},
	{
		source: 'AMD',
		target: 'AZURE',
		links: null,
		description: 'Azure is an early customer of AMD’s MI300A/X for its Maia super‑clusters.',
		weight: 6
	},
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
		source: 'NVIDIA',
		target: 'DEEPSEEK',
		links: [
			'https://www.reuters.com/technology/nvidia-says-deepseek-advances-prove-need-more-its-chips-2025-01-27/'
		],
		description:
			"One of DeepSeek's research papers showed that it had used about 2,000 of Nvidia's H800 chips, which were designed to comply with U.S. export controls released in 2022.",
		weight: 7
	},
	{
		source: 'HUAWEI',
		target: 'DEEPSEEK',
		links: ['https://x.com/zephyr_z9/status/1884154694123298904'],
		description: 'Huawei is supplying DeepSeek with its 910C chips for inference.',
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
		links: ['https://ase.aseglobal.com/blog/technology/advanced-packaging-for-ai-chiplet-and-cpo/'],
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

// Category styling
export const categoryColors = {
	equipment: 'node-equipment',
	foundry: 'node-foundry',
	design: 'node-design',
	eda: 'node-eda',
	memory: 'node-memory',
	assembly: 'node-assembly',
	end: 'node-end'
} as const
