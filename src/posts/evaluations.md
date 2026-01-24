---
title: How AI Safety Evaluations & Benchmarks can aid in AI governance
description: What are AI safety evals, and how can they contribute to preventing catastrophic risks?
---

## What are AI Safety Evaluations

"Evals" are tests that measure how AI models behave, and how powerful they are becoming.
In AI Safety, evals are often designed to measure [dangerous capabilities](/dangerous-capabilities), such as cybersecurity capabilities, self-replication and autonomous AI research.

Importantly, evals can measure if an AI is too dangerous to deploy.
There are some _red lines_ that no AI model should ever cross, for example when it can...

- **self-replicate**. (E.g. [RepliBench](https://arxiv.org/abs/2504.18565)). A self-replicating AI could escape from a lab and spread to other machines.
- **make more powerful AI models**. E.g. [RE-bench](https://metr.org/AI_R_D_Evaluation_Report.pdf). A self-improving AI could rapidly become more powerful than humans.

## Preventing deployment is not enough

Things can go wrong _even before deployment_.
Self-replication and self-improvement can happen in an AI lab, before the model is publicly available.

This is why **we need a [Pause Button](/building-the-pause-button)**.
We need to globally halt the development of increasingly powerful AI models, before these dangerous capabilities are fully matured.
This Pause Button should be pressed when the evaluations are showing we're entering the danger zone.

## What AI companies are doing

Most of the frontier AI companies are doing safety evaluations on their models before they deploy them and include the results of these evaluations in so called "System Cards".
Most of them (except for Meta and Apple) have signed the [EU AI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai), which mentions "state‑of‑the‑art model evaluations" (Measure 3.2).

This also means that some of these companies are not doing _any_ safety evaluations, and the ones that are performed are _not yet required_ and _not standardized_.
In other words, **we desperately need regulations to require standardized safety evaluations**.

## What countries are doing

Multiple governments are now seriously investing in AI Evaluations / Benchmarks to measure dangerous capabilities:

- UK AISI has built the [Inspect framework](https://github.com/UKGovernmentBEIS/inspect_ai), written [Replibench](https://arxiv.org/abs/2504.18565), is now investing [15M GBP in evals & alignment research grants](https://alignmentproject.aisi.gov.uk/)
- EU Commission is launching a [10M EUR tender](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/tender-details/76f9edf2-d9e2-4db2-931e-a72c5ab356d2-CN), and a [big grant with the Horizon programme](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/HORIZON-CL4-2025-04-DIGITAL-EMERGING-04). They have also launched the [The General-Purpose AI Code of Practice](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai), which includes a requirement to do "state‑of‑the‑art model evaluations" (Measure 3.2).
- [US AI Action Plan](https://www.whitehouse.gov/articles/2025/07/white-house-unveils-americas-ai-action-plan/) mentions evaluations and hardware controls
- China (concordia AI + Shanghai AI lab) has just [released a report with a lot of evals](https://substack.com/home/post/p-169741512)
- Other governments are working on evaluations as well

_The fact that so many countries are working on evaluations creates a very important opportunity for us_.
If these countries and institutes would **use the same benchmarks** and have some common **red lines**, that would be an important step towards a global treaty.
In addition to that, we should clearly communicate to politicians that when a red line is crossed, it's time to [stop further development](/proposal).
