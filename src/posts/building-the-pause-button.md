---
title: Building the Pause Button
description: A pause on superintelligence needs something to enforce it with. That something is the chip supply chain, and one country holds its narrowest point.
---

If we allow the creation of a superintelligent AI, we are [risking every single life on earth](/xrisk).
Our [proposal](/proposal) is an international treaty that pauses the training of the most powerful AI systems until we know how to make them safe.
But a treaty is only words unless someone can check that it is being kept, and stop those who break it.
That is the Pause Button.
This page explains what it is made of, and where to find it.

_This page was refreshed in September 2026. The original 2025 version, with the full supply chain walkthrough, is [archived here](/building-the-pause-button-2025)._

## Contents

## Why hardware

Training a frontier AI model takes tens of thousands of specialized chips, gigawatts of power, and datacenters the size of towns.
The most compute-intensive training runs now exceed [10^26 floating-point operations](https://epoch.ai/data-insights/open-models-threshold), and the frontier grows [four to five times a year](https://epoch.ai/publications/training-compute-of-frontier-ai-models-grows-by-4-5x-per-year).
Software is easy to copy and hide.
Hardware is not.
Compute is "detectable, excludable, and quantifiable", as the [foundational paper on compute governance](https://arxiv.org/abs/2402.08797) puts it.
Every serious treaty proposal, from the [MIRI treaty draft](https://arxiv.org/abs/2511.10783) to [Belfield's NPT for AI](https://arxiv.org/abs/2507.06379) to [our own compute governance report](https://arxiv.org/abs/2506.20530), rests on the same idea: count the chips, and you can verify the pause.

## The chokepoint

The chip supply chain is a chain of monopolies:

- **Nvidia** designs most AI chips.
- **TSMC** fabricates about 90% of the advanced ones. Samsung and Intel are the only alternatives.
- **SK Hynix, Samsung and Micron** make the high-bandwidth memory every AI chip needs.
- **ASML**, in Veldhoven in the Netherlands, is the only company in the world that makes the extreme ultraviolet (EUV) lithography machines all of the above depend on.

ASML is the narrowest point.
It shipped [48 EUV systems in 2025](https://www.asml.com/en/news/press-releases/2026/q4-2025-financial-results).
Each costs up to $380 million, needs constant maintenance and software updates from ASML, and can be [remotely disabled](https://www.businessinsider.com/asml-tsmc-semiconductor-chip-equipment-kill-switch-china-invade-taiwan-2024-5).
Chips wear out in a few years; a fab produces for a decade.
Whoever controls the machines controls the growth curve.

The Dutch government already requires a [license for every export](/asml-pause-button#the-netherlands-already-has-the-instrument) of these machines, and since 2024 for their servicing too.
Today that license is used for one purpose: keeping China behind.
It could be used for another.

## The two pages that matter

**[The Dutch Pause Button](/asml-pause-button)** is our proposal for how the Netherlands can turn its existing ASML licensing regime into the enforcement layer of a treaty.
Not a new instrument, but new criteria: EUV machines, upgrades and maintenance only for fabs that register their AI chip output, cap capacity growth, and accept inspections.
The page covers the layered measures, a four-phase plan, the legal basis and its gaps, and the objections.

**[The US-China Pause Button](/us-china-pause-button)** is about the two countries that hold [close to 90%](https://aisafetychina.substack.com/p/key-takeaways-from-the-2026-waic) of the world's training compute.
Washington says it cannot pause because Beijing won't.
Beijing says Washington must first apply its rules to itself.
Both are describing a verification problem, and a supplier state that is neither of them can solve it.

## Beyond lithography

Controlling the machines is the first layer, not the last.
A complete Pause Button also needs:

- **A chip registry and chain of custody**, so every AI chip has an identity and a location. Feasible now.
- **Cloud know-your-customer rules**, so large compute rentals are traceable. Feasible now.
- **On-chip governance**: firmware licensing, location attestation, and eventually [FlexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf). Two to four years of research away, according to [Ansari (2026)](https://arxiv.org/abs/2604.04712).
- **An international agency**, modeled on the IAEA, to hold the keys, run inspections, and grant licenses for training runs. See our [proposal](/proposal).
- **Limits on publishing algorithmic breakthroughs**, because efficiency gains shrink the compute needed. This is the hardest part, and it is covered on the [archived page](/building-the-pause-button-2025#software-governance).

## The window is closing

Hardware governance works only while chip production is concentrated.
China [started producing its own DUV machines](https://www.cnbc.com/2026/07/28/china-chipmaking-duv-tool-asml-explained.html) in 2026 and makes 7nm chips without EUV.
Critics like [Horowitz and Kahn](https://ai-frontiers.org/articles/nuclear-non-proliferation-is-the-wrong-framework-for-ai-governance) call the chokepoint "temporary".
They are right.
That is the argument for using it now.

## What you can do

- Read [The Dutch Pause Button](/asml-pause-button) and [The US-China Pause Button](/us-china-pause-button).
- If you are in the Netherlands, ask your representative why ASML licenses are used only against China. See our [lobby tips](/lobby-tips).
- [Join PauseAI](/join) and help us get this in front of the people who decide.
