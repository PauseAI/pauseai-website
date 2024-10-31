---
title: Building the Pause Button
description: What would an AI Pause look like? How do you continue to actually prevent a superintelligence from being created?
---

If we allow the creation of a superintelligent AI, we are [risking every single life on earth](/xrisk).
When we're talking about a Pause, we're talking about [implementing an international ban on the creation of a superintelligent AI](/proposal).
Some argue that it's too early to press the Pause Button (we [don't](/urgency)), but most experts seem to agree that it may be good to pause if developments go too fast.
But as of now _we do not have a Pause Button_.
So we should start thinking about how this would work, and how we can implement it.

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

## With an International AI Authority

Having a Pause button would imply having some body that has the right to press it.
That body will need certain powers:

- **Verification**: The ability to verify that no superintelligent AI is being created. We'll dive into these in a later section.
- **Enforcement**: The ability to enforce the Pause. This could be done by imposing sanctions on countries that violate the Pause, or by seizing hardware that is used to train a superintelligent AI.

## Without an International AI Authority

But even without such a body, there are things we can do

## Compute Governance

To train a frontier LLM (like GPT-4), you need a lot of highly specialized and costly hardware.
GPT-4 was trained on 25,000 Nvidia A100 GPUs, which cost $10.000 each.
And many expect AI models to become even larger in the future.

### Choke points in the chip supply chain

It is hard to overstate the complexity and interdependency of the AI chip supply chain.
This is great news for governance.
Through the hardware, we can regulate the training runs.

#### ASML - the lithography bottleneck

All modern chips are made using lithography machines: huge machines, costing 200 million dollars each, that project light onto a silicon wafer.
This lithography process is one of the most complex and expensive parts of the chip manufacturing process.
Top-tier AI chips are all made using EUV lithography, and ASML is the only company that makes these machines.
This Dutch company is one of the most important potential choke points for AI governance.
The Dutch Government has set up strict export controls on their EUV lithography machines,

#### SMIC - the Chinese competitor that is catching up

The Chinese company SMIC is trying to catch up, but is not able to make their own EUV machines.
Due to US / NL export controls, SMIC is not able to buy ASML EUV machines, and are now also restricted in buying the older DUV machines.
In June 2024, a [report](https://evertiq.com/news/55926) showed that SMIC can produce 5nm chips using DUV hardware,
and is now able to produce 7nm AI chips (about three years behind the 4nm process that ASMLs EUV machines can produce), but SMIC's EUV lithography is plagued by low yields.

#### Zeiss: mirrors & lensens

ASML's EUV machines use mirrors and lenses made by the German company Zeiss.
In 2016, ASML [bought](https://optics.org/news/7/11/11) a 25% stake in Zeiss, and the two companies have a very close relationship.

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
