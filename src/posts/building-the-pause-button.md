---
title: Building the Pause Button
description: What would an AI Pause look like? How do you continue to actually prevent a superintelligence from being created?
---

If we allow the creation of a superintelligent AI, we are [risking every single life on earth](/xrisk).
When we're talking about a Pause, we're talking about [implementing an international ban on the creation of a superintelligent AI](/proposal).
Some argue that it's too early to press the Pause Button (we [don't](/urgency)), but most experts seem to agree that it may be good to pause if developments go too fast.
But as of now _we do not have a Pause Button_.
So we should start thinking about how this would work, and how we can implement it.

Luckily, building a superintelligent AI is difficult, and requires a lot of resources.

## Contents

## The Race: why we need international cooperation

We do not expect any single country to be able to implement a Pause.
The economic incentives are too strong, and slowing down AI development would put a country at an economic and geopolitical disadvantage.
The costs of underinvesting in safety are distributed globally, while the benefits of speeding up are local.
This game-theoretic problem is sometimes referred to as "Moloch", or a "Race to the Bottom".

The only way out is to have an _international agreement_.
That's why we're so obsessed with [summits](/summit): these are the events where global decision makers come together and work on a global solution.
Or at least, that's what we want them to do.
So far, all AI safety summits haven't led to meaningful regulation.
It's up to you and me to [convince them](/action).

## Compute Governance

To train a frontier LLM (like GPT-4), you need a lot of highly specialized and costly hardware.
GPT-4 was trained on 25,000 Nvidia A100 GPUs, which cost $10,000 each.
Although there are innovations that allow for more efficient training, the trend is that AI models are getting larger and larger.

The sheer scale of modern AI training requirements is immense.
Microsoft recently announced a plan to [construct a nuclear power plant](https://www.theverge.com/2024/9/20/24249770/microsoft-three-mile-island-nuclear-power-plant-deal-ai-data-centers) for its AI power needs.
Luckily for us, this means that AI training runs are hard to hide, at least in the near future.

By controlling and monitoring the AI Chip supply chain, governments or other regulatory bodies can make sure that nobody starts a dangerous AI training run.
Let's dive into the various choke points in this supply chain.

### Choke points in the chip supply chain

It is hard to overstate the complexity and interdependency of the AI chip supply chain.
It consists of various highly specialized companies, some of which are the only ones in the world that can produce certain components.
This is great news for governance.
Through the hardware, we can regulate the training runs.
Let's take a dive into the various choke points in the AI chip supply chain.

#### Silicon wafers: Shin-Etsu, Sumco, Siltronic

#### Lithography: ASML & SMEE

All modern chips are made using lithography machines: huge machines, costing 200 million dollars each, that project light onto a silicon wafer.
This lithography process is one of the most complex and expensive parts of the chip manufacturing process.
Top-tier AI chips are all made using EUV lithography, and ASML is the only company that makes these machines.
This Dutch company is one of the most important potential choke points for AI governance.
These machines are insanely complex and require a lot of expertise to build and maintain.
Notably, they have [remote kill-switches](https://www.businessinsider.com/asml-tsmc-semiconductor-chip-equipment-kill-switch-china-invade-taiwan-2024-5) (mostly for in the case that Taiwan is invaded), so in some important ways, the Pause button is already built.

The Dutch Government has set up strict export controls on their EUV lithography machines, requiring permits for exports.
These export controls have primarily been set in place to slow down China's chip ambitions.
The [US, Japan and the Netherlands](https://apnews.com/article/technology-district-of-columbia-netherlands-china-business-6801d6c5f65b0bc1df6186e2e89a6f7d) are in a (non-public) agreement aimed to restrict chip & lithography exports to china.

The Chinese company SMEE is trying to catch up, but is not able to make their own EUV machines.
Their DUV machines are [still stuck at 28nm](https://www.scmp.com/tech/big-tech/article/3278235/chinese-chip-making-shows-progress-new-euv-patent-domestic-lithography-champion), which is generations behind ASML's 5nm EUV process, let alone ASML's upcoming 2nm machines.
So SMEE is not able to produce modern AI chips.

In other words: ASML is a fundamental choke point in the AI chip supply chain.

#### Optics: Zeiss

ASML's EUV machines use mirrors and lenses made by the German company Zeiss.
In 2016, ASML [bought](https://optics.org/news/7/11/11) a 25% stake in Zeiss, and the two companies have a very close relationship.
It is likely that no other company is able to produce these optics.

#### Photoresist

The photoresist is a chemical product that is used to etch the patterns into the silicon wafer.
Japanese companies are dominant in this field.

The most important companies in this field are:

- JSR (Japan)
- Shin-Etsu (Japan)
- Tokyo Ohka Kogyo (Japan)
- DuPont (USA)

#### Interconnect & Packaging: ASE

When a chip die exits a fab, it needs to be "packaged".
ASE is probably the largest interconnect company for AI chips.

#### Fabrication: TSMC, Samsung amd SMIC

Building a "fab" (a chip factory) is astonishingly difficult: it has zero-tolerance for dust particles, requires the most expensive high-tech equipment, and has a very complex supply chain.
A modern fab costs around 10 to 20 billion dollars to manufacture.

The Taiwan Semiconductor Manufacturing Company accounts for [roughly 90%](https://www.fool.com/investing/2025/02/03/meet-the-monster-stock-that-continues-to-crush-the/) of modern AI chips, which are all chips made at 7nm precision or better.
Samsung is the only other fab that can produce modern AI chips.

But the Chinese SMIC is catching up rapidly - they already have a [functional 7nm process](https://wccftech.com/smic-to-limit-huawei-to-7nm-chips-until-2026-reducing-advancement/).
Due to US / NL export controls, SMIC is not able to buy ASML EUV machines, and are now also restricted in buying the older DUV machines.
In June 2024, a [report](https://evertiq.com/news/55926) showed that SMIC can produce 5nm chips using DUV hardware,
and is now able to produce 7nm AI chips (about three years behind the 4nm process that ASMLs EUV machines can produce), but SMIC's lithography is plagued by low yields.

#### Memory fabrication: Micron, SK Hynix

AI chips require a lot of HBMs (High Bandwidth Memory), which is the most advanced memory type.
Only a few companies can produce them.

#### AI Chip design: Nvidia, AMD, Intel, Google, Apple

The most famous company names on this page are all chip designers.
And there are new companies, like Cerebras and Groq, which are designing chips specifically for AI.
Notably, some of these companies use relatively outdated processes to produce their chips, like Groq who used 14nm, which is a potential choke point for governance.

### On-Chip Governance

- The article ["Secure, Governable Chips"](https://www.cnas.org/publications/reports/secure-governable-chips) proposes a new approach to AI governance.
- Chips could respond to messages from trusted servers to [prove they are withing a certain distance of a trusted location](https://www.lesswrong.com/posts/uSSPuttae5GHfsNQL/ai-compute-governance-verifying-ai-chip-location). This can be accurate to within tens of kilometers.

### Verification methods - preventing large training runs

Now that we've identified various choke points in the chip supply chain, we can start thinking about how to prevent large-scale training runs from happening.
These aforementioned actors can be pressured (by governments) to make sure their products are not being used for dangerous AI training runs.

But how can this be verified?

The paper ["Verification methods for international AI agreements"](https://arxiv.org/abs/2408.16074) lists various options:

1. **Remote Sensing**: Uses satellite and infrared imaging to detect data centers by visual and thermal signatures. Highly feasible but limited by camouflaging or underground facilities.
2. **Whistleblowers**: Relies on insiders reporting non-compliance, incentivized by legal and financial protections. Feasible but dependent on insider access and willingness to disclose.
3. **Energy Monitoring**: Tracks power usage to identify large AI operations, viable if patterns are distinct. Feasibility varies; data can be obscured by other high-energy activities.
4. **Customs Data Analysis**: Monitors import/export of AI hardware for anomalies. Feasible, especially for imports, though countries with domestic manufacturing may avoid detection.
5. **Financial Intelligence**: Observes large or unusual transactions related to AI hardware purchases. Feasible if financial privacy and banking laws allow, often best combined with other methods.
6. **Data Center Inspections**: Physical site inspections to verify compliance with hardware limits and security protocols. Effective if host country agrees to inspections; invasive and resource-intensive.
7. **Semiconductor Manufacturing Facility Inspections**: Verifies chip production compliance by inspecting facilities with relevant hardware. Feasible but requires significant resources and host country consent.
8. **AI Developer Inspections**: Reviews facilities for authorized code, safety protocols, and AI evaluation records. Effective but highly invasive, requiring specialized expertise and country cooperation.
9. **Chip Location Tracking**: Tracks AI chip movements to monitor their deployment. Feasible with international agreements, but bypassable by disabling tracking or spoofing location data.
10. **Chip-Based Reporting**: Embeds reporting mechanisms in chips to alert if used beyond authorized limits. Feasible but challenging, requiring international standards and hardware development; circumventable by modifying firmware.

Each method has its strengths and weaknesses, often requiring complementary approaches or international cooperation for effective implementation.

Other proposed methods include:

1. **[flexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf)**: A new type of chip that can be programmed to self-destruct when certain conditions are met.

An international insitution could be set up to monitor these verification methods, and to enforce the Pause.

## Software Governance

Physical chips are our primary focus, but we may also want to regulate _software_ used to train and run AI models.
It may very well be possible that the largest compute clusters have sufficient power to train a catastrophically dangerous model, but they still lack the software.
Let's dive into the types of software innovations that we can distinguish.

### Software innovations

Firstly, there are _training_ innovations.
The Transformer architecture, for example, allowed AI models to be far more capable, at a much lower cost.
The Transformer-based ALBERT model [outperformed](https://arxiv.org/pdf/2308.04950) the BERT model, even though it consisted of 18x as little parameters.
In the future, we may see even more efficient architectures.
There are also innovations in the data that is fed to a model.

In addition to training improvements, we've seen various _runtime_ improvements.
Chain-of-thought, graph-of-thought, and other techniques can give drastic improvements in the performance of AI models.
Tools like AutoGPT can turn simple chatbots into fully autonomous agents that browse the web, send emails, and do other tasks.
OpenAI's o1 model allows for greater reasoning capabilities by allowing it to spend more time thinking about an answer before providing one.

### Regulating software

The software side of AI is more difficult to control than the hardware side.
Software is just information - it can be copied and distributed very easily.
Nonetheless, we have banned information before.
Child pornography, for example, is illegal to make, illegal to distribute, and illegal to possess.
The same enforcement mechanisms could be used to regulate dangerous AI software.
