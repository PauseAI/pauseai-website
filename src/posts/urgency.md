---
title: Why we might have superintelligence sooner than most think
description: We're underestimating the progress of AI, and there is a small but realistic chance that we are very close to a superintelligence.
date: '2023-05-04'
---

Superintelligent AI has the potential to be the best or the worst thing that has ever happened to humanity.
If we solve the AI alignment problem before we get to superhuman capabilities, we can have a future where AI helps us solve all of our problems.
If we reach superintelligence before we solve the alignment problem, [we're facing extinction](/xrisk).

So having an estimated range of when we could have superintelligence is essential to making sure we don't get caught off guard.
If our predictions are too far off, we may not be able to prepare in time.
And boy have we been wrong in the past.

## We reached human-level performance in 2023

On Metaculus, [the community prediction for (weak) AGI](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) was 2057 just three years ago, and now it's 2027.
We went from 35 years to 4 years.

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
In short: GPT-4 got 2/4 criteria with certainty, and likely 4/4 if we tried.

**We're there, folks.
We already have (weak) AGI.**
It did not take us 35 years, it took us three.
We were off by a factor of 10.
And apparently, for most people in the Metaculus community, AGI is still a long way off.
This is a clear sign that we're structurally underestimating the progress of AI, even the current capabilities.
If we do this as a community, we could lack a sense of urgency to take action.

## Why most underestimate the progress of AI

There are many reasons why people underestimate the progress of AI.

- **It's hard to keep up**. Almost daily we see new breakthroughs in AI. It's almost impossible to keep up with the pace of progress. You're not alone if you feel like you're falling behind.
- **We keep moving the goalpost**. In the 90s, people thought the holy grail of AI was something that could play chess. When AI beat Kasparov, its next challenge was Go. Now, we have machines that score in the [99.9th percentile in IQ tests](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/), can [translate 26 languages](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) and [win photography contests](https://www.scientificamerican.com/article/how-my-ai-image-won-a-major-photography-competition/), yet we're still asking questions like "When will AI reach human level?". It already surpasses us in most areas, but we always focus on the increasingly smaller number of things we can still do better.
- **We like to think that we're special**. Especially smart people tend to believe that their intellect is what makes them special. If an AI can do what they can do, they're not special anymore. This is a hard pill to swallow, and the [brain has many defense mechanisms to avoid this](psychology-of-x-risk).
- **We're really bad at exponential growth**. We tend to structurally and predictably underestimate how exponential growth cumulates over time. This has been shown in [scientific studies](https://www.researchgate.net/figure/Underestimation-of-exponential-growth-a-shows-the-participants-prediction-of-the_fig4_351171143).

But there are still some things that an AI can't do yet, luckily.
It cannot [hack better than the best hackers](/cybersecurity-risks) and it cannot do AI research as well as the best AI researchers.
**When we reach either of these thresholds, we will be in danger**.

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
Having said that, I think there are multiple paths to Ilya's level of capabilities:

1. **A bigger model**. This is likely to be a combination of more data, more parameters, more compute. So far scaling has proven very successful. The training costs are becoming astronomical ($100 million for GPT-4), but there's a lot at stake, and there are many billions of dollars being invested in either staying ahead of the curve or catching up. [New hardware](https://www.tomshardware.com/news/nvidia-publishes-mlperf-30-performance-of-h100-l4) is being developed that makes training larger models more feasible. A 10x size increase on its own might be enough to get us past the Ilya threshold. However, Sam Altman has stated that there are serious diminishing returns to scaling and that we might be close to the limit of what is achievable by scaling current architectures.
2. **Runtime improvements**. Tools like MemoryGPT and AutoGPT have shown that simply putting an existing LLM in a new context unlocks radically new types of capabilities. Some have [argued](https://bdtechtalks.com/2022/01/24/ai-thinking-fast-and-slow/) that LLMs right now have only access to something akin to "System 1" type thinking (fast, intuitive), and not "System 2" (slow, critical). It might be possible that a runtime improvement would unlock such capabilities.
3. **Algorithmic improvements**. The Transformer model made models perform far better with less hardware. These types of 10x algorithmic breakthroughs are rare, but they happen. It is highly likely that far more optimal algorithms for learning are possible because we have not reached the theoretical limit for efficient learning algorithms. For example, a human can read one textbook about JavaScript and could then write some code. GPT-4 needed to read many thousands (or more) of these books to reach the same level. AIs need _a lot_ of data to learn, but humans don't, so there is probably a lot to gain (or actually lose) from finding a more efficient way of learning.

So we have at least these three paths to reaching the Ilya threshold.
We have no guarantee that any of these, or all of these, would bring us past the Ilya threshold, but it seems probable.
Even if we get past that point, we can't be sure that radical self-improvement is possible, but again it does seem probable.
It's hard to quantify these, but **there are now countless people working on all three of these - far more than just a few months ago**.
I can only conclude that there's a realistic chance (>1%) that we'll reach superintelligence in the next few months.
We have no idea how to align such an AI (even [OpenAI admits this](https://youtu.be/L_Guz73e6fw?t=1477)), and the consequences of having a misaligned superintelligence are likely to be [catastrophic](/xrisk).

## Policy implications

We could have a superintelligence in months.
A 1% risk is unacceptably large.
We can only conclude that we need to slow down AI development right now.
