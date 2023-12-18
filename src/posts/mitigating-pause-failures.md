---
title: Pausing AI development might go wrong. How to mitigate the risks?
description: This article addresses some of the risks of pausing AI development, and how to mitigate them.
---

We're pushing for a pause of the development of large, general AI models.
See our [proposal](/proposal) for more details.

This measure is not without risks.
In this article, we'll address some of these risks and how to mitigate them.

## Pausing too early

If an AI pause happens before the risks are large enough, we might miss out on the benefits of AI.
Ultimately, we need to balance the risks with the costs of pausing.

In our view, the chance that AI will cause catastrophic risks [soon](/urgency) is already large enough to warrant a pause at this moment.
As stated by Stuart Russell, when faced with an uncertain deadline, one should take the action that would be optimal given the shortest time constraint.

## Pausing for too long

Nick Bostrom, one of the first AI alarmists, worries that [at some point we might worry _too much_ about AI risks](https://twitter.com/jachaseyoung/status/1723325057056010680), although that moment is not yet here.
If concern about AI keeps rising and we get a Pause, it might lead to a situation where the entirety of AI development becomes taboo or illegal.
If that happens, we will never reap the benefits of AI, and in the meantime, we might encounter other existential risks that we could have avoided with the help of AI.

We can address this risk by clearly stating under what conditions AI development should resume.
In our proposal, we suggest that AI development should resume when building provably safe AI becomes possible.
Additionally, we only propose to ban the development of very specific kinds of models: only the largest, general models.

## Centralization of AI might make takeover risks worse

Some proposals (although not a PauseAI proposal), like "[MAGIC](https://arxiv.org/abs/2310.09217)", suggest that we should centralize AI development in a single organization.
This makes AI development more controllable, but it also creates a single point of failure.

## National/local pauses might fail

If one country pauses AI development, other countries will continue to develop AI.
We might end up in a world where the first AGI is developed by a non-cooperative actor, which is likely to be a bad outcome.
The incentives to pause individually are weak, because the benefits of AI development are large, and the risks of AI development are global.
This is a classic [tragedy of the commons](https://en.wikipedia.org/wiki/Tragedy_of_the_commons) situation.

The obvious solution to this is to make the pause international through a treaty, which is what we're proposing.

## AI development might go underground

If AI development (above a certain threshold) is banned, it might go underground.
The potential benefits are so large that a rogue (state) actor might decide to develop AI in secret.
That means the first to achieve superintelligence would be a non-cooperative actor, which is likely to be a bad outcome.

By tracking GPU sales, we can detect at least some underground AI development.

Western powers (US, Netherlands and Taiwan), control the GPU supply chain strongly enough to prevent uncooperative states from obtaining GPUs.
Non-state actors are unlikely to be able to gather sufficient resources in secret to train an AGI for at least a decade after AGI becomes possible by Big Tech companies.
Also, the fact that there no longer is a _business incentive_ would help to reduce the amount of underground AI development.

## Hardware overhang could cause a fast takeoff

> If we don’t include hardware R&D in the pause, the price-performance of GPUs will continue to double every 2.5 years, as it did between 2006 and 2021.
> This means AI systems will get at least 16x faster after ten years and 256x faster after twenty years, simply due to better hardware.
> If the pause is lifted all at once, these hardware improvements would immediately become available for training more powerful models more cheaply—a hardware overhang.
> This would cause a rapid and fairly discontinuous increase in AI capabilities, potentially leading to a fast takeoff scenario and all of the risks it entails.

[_By Nora Belrose_](https://bounded-regret.ghost.io/ai-pause-will-likely-backfire-by-nora/)

This is a serious concern. This is why PauseAI also supports a pause on relevant compute improvements.

However, we still think a pause in AI scaling would probably be sensible even if there is no pause in GPU improvements because there is a serious possibility that we will achieve AGI in the next 5 years mostly by spending more money on GPUs, rather than by having better hardware.

<!--
## Policital capital is limited, Pause might fail

AI safety people will be taken less seriously -->

## Algorithmic or runtime improvements may make smaller models dangerous, too

We're [proposing](/proposal) to pause the development of large, general AI models above a certain threshold (10^25 FLOPS).
However, we cannot be certain that this threshold is safe.
We've seen that changes in training data, training algorithms, or runtime usage can lead to large improvements in model performance.

## If we only ban general AI models, we might still get AGI through narrow models

We want to restrict dangerous models that can do things like manipulate humans, plan strategically and write code.
We don't want to restrict very narrow models, like image classifiers used in self-driving cars or medical diagnosis.
However, this leads to a difficult situation where there are _strong incentives_ to stretch the definition of "narrow" AI.

Therefore we haven't defined "narrow" AI in our proposal, but instead, we've defined a threshold for model size.

## If a pause is implemented, we should expect a political compromise

We have a specific proposal that we think is optimal.
However, we should not expect to have our proposal implemented exactly as we want it.
Politics is messy and unpredictable, so we should expect our lobbying efforts to have vaguely directional effects, rather than precise effects.
If we get some form of a Pause, but it's not exactly what we want, this might end up being worse than having no pause at all.
For example:

- A national pause that would let potentially worse actors get to AGI first
- An international pause that is not enforced properly, leading to a similar outcome

We can mitigate this by being consistent and clear in our communications about what we want.
And even if we get a partial pause that is not exactly what we want, it might still be better than no pause at all.
