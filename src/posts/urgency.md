---
title: Why we might have superintelligence sooner than most think
description: We're underestimating the progress of AI, and there is a small but realistic chance that we are very close to a superintelligence.
date: '2023-05-04'
---

Current [State-of-the-Art](/sota) AI models are already superhuman in many domains, but luckily not in all.
If we reach superintelligence before we solve the alignment problem, [we face a risk of extinction](/xrisk).
So having an estimated range of when we could have superintelligence is essential to making sure we don't get caught off guard.
If our predictions are too far off, we may not be able to prepare in time.

But how far off are we?
When will we have superintelligence?
It could be sooner than most think.

## Compounding exponential growth

AI models require algorithms, data, and chips.
Each of these components is rapidly improving due to huge investments in AI - .
The improvements in each of these components are _compounding_, leading to exponential growth in AI capabilities.

- **More chips**. ChatGPT was trained on [10.000](https://www.fierceelectronics.com/sensors/chatgpt-runs-10k-nvidia-training-gpus-potential-thousands-more) specialized chips. Meta has [announced](https://www.datacenterdynamics.com/en/news/meta-to-operate-600000-gpus-by-year-end/) that they will have 600.000 next-gen chips to train their next AI models this year.
- **Faster chips**. Every year chips get faster due to new architectures and lithography innovations. The chips that Meta is using are 10x faster than the chips used for ChatGPT. We're also seeing highly specialized hardware like the Groq chips, which are [13x faster](https://mezha.media/en/2024/02/22/groq-s-new-ai-chip-offers-to-increase-chatgpt-speed-by-13-times/) than the competition. On a longer timeline, [ternary architectures](https://arxiv.org/pdf/2402.17764.pdf) or [photonic chips](https://www.nature.com/articles/s41566-024-01394-2) could make chips even faster.
- **More data**. GPT3 was trained on [45TB](https://community.openai.com/t/what-is-the-size-of-the-training-set-for-gpt-3/360896) of text, GPT4 used about 20x as much. AI companies are starting to use video data, audio data and even generating synthetic data to train these models.
- **Better data**. The "Textbooks are all you need" paper [showed](https://arxiv.org/abs/2306.11644) that using high-quality synthetic data can drastically improve model performance, even if far less data and compute is used.
- **Better algorithms**. The Transformer architecture enabled the current LLM revolution. New architectures can enable similar capability jumps. The Mamba model, for example, is [showing](https://arxiv.org/abs/2312.00752) 5x faster throughput.
- **Better runtimes**. Agentic runtimes, Retrieval Augmented Generation or even simply clever prompting (through [Graph of Thought](https://arxiv.org/abs/2305.16582), for example) can have a huge impact on the capabilities of these models.

It is entirely possible that _simply scaling up_ will get us to [dangerous capabilities](/dangerous-capabilities) in a year or two, but with all these compounding factors, it could be even sooner.

## We reached human-level performance in many domains in 2023

In 2022, AI researchers thought it would take [17 years](https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/) until AI would be able to write a New York Times bestseller.
A year later, a Chinese professor [won a writing contest](https://www.scmp.com/news/china/science/article/3245725/chinese-professor-used-ai-write-science-fiction-novel-then-it-won-national-award) with an AI-written book.

On Metaculus, [the community prediction for (weak) AGI](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) was 2057 just three years ago, and now it's ~~2027~~ 2026.

Now, let's dive into the definition of AGI used in that survey:

- Score >90% in the Winograd Schema Challenge
- Score >75% in SAT scores
- Pass a Turing test
- Finish Montezuma's revenge

GPT-4 Scores [94.4% on the Winograd Schema Challenge](https://d-kz.medium.com/evaluating-gpt-3-and-gpt-4-on-the-winograd-schema-challenge-reasoning-test-e4de030d190d), and [93% on the SAT reading exam, 89% on the SAT math exam](htthttps://www.cnbc.com/2023/03/14/openai-announces-gpt-4-says-beats-90percent-of-humans-on-sat.html).
It hasn't passed the Turing test, but probably not because of a lack of capabilities.
It's because GPT-4 has been fine-tuned to not mislead people. It's not good for business if your AI is telling people it's actually a person.
That only leaves Montezuma's Revenge.
It is not unthinkable that it can be finished by a clever setup of GPT-4, using something like AutoGPT to analyze the screen and generate the correct inputs.
In May 2023, [GPT-4 was able to write code to get diamond gear in Minecraft](https://the-decoder.com/minecraft-bot-voyager-programs-itself-using-gpt-4/).
In short: GPT-4 got 2/4 criteria with certainty, with the other two in reach.

**We're there, folks.
We already have (weak) AGI.**
It did not take us 35 years, it took us three.
We were off by a factor of 10.

## Why most underestimate the progress of AI

There are many reasons why people underestimate the progress of AI.

- **It's hard to keep up**. Almost daily we see new breakthroughs in AI. It's almost impossible to keep up with the pace of progress. You're not alone if you feel like you're falling behind.
- **We keep moving the goalpost**. In the 90s, people thought the holy grail of AI was something that could play chess. When AI beat Kasparov, its next challenge was Go. Now, we have machines that score in the [99.9th percentile in IQ tests](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/), can [translate 26 languages](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) and [win photography contests](https://www.scientificamerican.com/article/how-my-ai-image-won-a-major-photography-competition/), yet we're still asking questions like "When will AI reach human level?". It already surpasses us in many areas, but we always focus on the increasingly small number of things we can still do better.
- **We like to think that we're special**. Humans like to feel that we are special. If an AI can do what we can do, we're not special anymore. This is a hard pill to swallow, and the [brain has many defense mechanisms to avoid this](psychology-of-x-risk).
- **We're really bad at exponential growth**. We tend to structurally and predictably underestimate how exponential growth cumulates over time. This has been shown in [scientific studies](https://www.researchgate.net/figure/Underestimation-of-exponential-growth-a-shows-the-participants-prediction-of-the_fig4_351171143).

Luckily there are still some things that an AI can't do yet.
It cannot [hack better than the best hackers](/cybersecurity-risks), and it cannot do AI research as well as the best AI researchers.
**When we reach either of these thresholds, we will be in a new regime of increased risk**.

So when will we reach the point when an AI can do all these things at a superhuman level?
When will have a _superintelligence_?

## The Ilya threshold

I think the crucial point that we should consider, is **the point at which an AI is more capable of doing AI research than someone like Ilya Sutskever** (chief scientist at OpenAI).
An AI that can make meaningful contributions to AI algorithms and architectures is likely to be able to improve itself.
Let's call this point of potential self-improvement the _Ilya threshold_.
When it reaches this, an AI might improve itself because it was explicitly instructed to do so, or because being smarter is a useful sub-goal for other goals (AIs are [already creating their own sub-goals](https://github.com/Significant-Gravitas/Auto-GPT)).
These iterations might take weeks (training GPT-3 took 34 days), but it is also possible that some type of runtime improvement is implemented that makes significant progress in a matter of minutes: an [Intelligence Explosion](https://www.youtube.com/watch?v=5qfIgCiYlfY).

So how far off are we from the Ilya threshold?
It's fundamentally difficult to predict [when certain capabilities emerge](https://arxiv.org/abs/2206.07682) as LLMs scale, but so far we've seen many capabilities emerge that were previously thought to be far off.
GPT-4 is already an impressive programmer, and combined with AutoGPT [it can do autonomous research on the internet](https://twitter.com/SullyOmarr/status/1645205292756418562).
Being able to autonomously do AI research and making meaningful improvements to a codebase does not seem impossible in the near future.

Better chips, more data, and better algorithms will all contribute to reaching the Ilya threshold.
We have no idea how to align such an AI (even [OpenAI admits this](https://youtu.be/L_Guz73e6fw?t=1477)), and the consequences of having a misaligned superintelligence are likely to be [catastrophic](/xrisk).

## Policy implications

We could have a superintelligence in months.
A 1% risk is unacceptably large.
We can only conclude that we need to [slow down AI development](/proposal) right now.
It's up to each of us to [take action](/action) and make sure that we don't get caught off guard.
