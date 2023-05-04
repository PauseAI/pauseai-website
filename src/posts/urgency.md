---
title: Why we might have superintelligence sooner than most think
description: We're underestimating the progress of AI, and there is a small but realistic chance that we are very close to a superintelligence.
date: '2023-05-04'
---
Having an estimate range of when we could have superintelligence is essential to making sure we don't get caught off guard.
But before we get to a superintelligence, we'll have to get to AGI first.

On Metacalculus, [the community prediction for AGI](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) was 2057 just three years ago, and now it's 2027.
We went from 35 years to 4 years.

Now, let's dive into the definition of AGI used in that survey:

- Pass a Turing test
- Score >90% in the Winograd Schema Challenge
- Score >75% in SAT scores
- Finish Montezuma's revenge

GPT-4 Scores [94.4% on the Winograd Schema Challenge](https://d-kz.medium.com/evaluating-gpt-3-and-gpt-4-on-the-winograd-schema-challenge-reasoning-test-e4de030d190d), and [93% on the SAT reading exam, 89% on the SAT math exam](htthttps://www.cnbc.com/2023/03/14/openai-announces-gpt-4-says-beats-90percent-of-humans-on-sat.html).
It hasn't passed the Turing test, but probably not because of lack of capabilities.
It's because GPT-4 has been fine-tuned to not mislead people. It's not good for business if your AI is telling people it's actually a person.
That only leaves Montezuma's Revenge.
It is not unthinkable that it can be finished by a clever setup of GPT-4, using something like AutoGPT to analyze the screen and generate the correct inputs.
We got 2/4 criteria with certainty, and 4/4 with some effort probably.

We're there, folks.
We already have (weak) AGI.
It did not take us 35 years, it took us three.
We were off by a factor of 10.
And apparently, for most people in the Metaculus community, AGI is still a long way off.
To me, this is a clear sign that we're structurally underestimating the progress of AI, even the current capabilities.
If we do this as a community, we could lack a sense of urgency to take action.

The next question is, when will we have a superintelligence?
When will an AI be vastly superior to all humans as virtually all tasks?

## The Ilya threshold
I think the crucial point that we should consider, is the point at which an AI is more capable at doing AI research then someone like Ilya Sutskever (chief scientist at OpenAI).
An AI that can make meaningful contributions to AI algorithms and architectures is likely to be able to improve itself.
Let's call this point of potential self-improvement the Ilya threshold.
When it reaches this, an AI might improve itself because it was explicitly being instructed to do so, or because having more capabilities is instrumental to most goals.
These iterations might take weeks (training GPT-3 took 34 days), but it is also possible that some type of runtime improvement is implemented that makes significant progress in a matter of minutes.

So how far off are we to the Ilya threshold?
It's fundamentally difficult to predict [when certain capabilities emerge](https://arxiv.org/abs/2206.07682) as LLMs scale, but so far we've seen many capabilities emerge that were previously thought to be far off.
GPT-4 is already an impressive programmer, and combined with AutoGPT [it can do autonomous research on the internet](https://twitter.com/SullyOmarr/status/1645205292756418562).
Being able to autonomously do AI research and making meaningful improvements to a codebase does not seem impossible in the near future.
Having said that, I think there are multiple paths to Ilya's level of capabilities:

1. **A bigger model**. This is likely to be a combination of more data, more parameters, more compute. So far scaling has proven very successful. The training costs are becoming astronomical (100 million for GPT-4), but there's a lot at stake, and there are many billions of dollars being invested in either staying ahead of the curve, or catching up. New hardware is being developed that make training larger models more feasible. A 10x size increase on its own might be enough to get us past the Ilya threshold. However, Sam Altman has stated that there are serious diminishing returns to scaling, and that we might be close to the limit of what is achieveable by scaling current architectures.
2. **Runtime improvements**. Tools like MemoryGPT and AutoGPT have shown that simply putting an existing LLM in a new context unlocks radically new types of capabilities. Some have argued that LLMs right now have only access to something akin to "System 1" type thinking (fast, intuitive), and not "Sytem 2" (slow, critical). It might be possible that a runtime improvement would unlock such capabilities.
3. **Algorithmic improvements**. The Transformer model made models perform far better at less hardware. It is highly likely that far more optimal algorithms for learning will be possible. For example, a human can read one textbook about JavaScript and could then write some code. An LLM needs to read many hundreds (or more) of these books to reach the same level. AIs need _a lot_ of data to learn, but humans don't, so there is probably a lot to gain from finding a more efficient way of learning.

It's hard to quantify these, but there are now countless of people working on all three of these - far more then just a few months ago.
We have no guarantee that any of these, or all of these, would bring us past the Ilya threshold, but it seems probable.
Even if we get past that point, we can't be sure that radical self-improvement is possible, but again it does seem probable.
I can only conclude that there's a realistic chance (>1%) that we'll reach superintelligence in the next few months.
We have no idea on how to align such an AI (even [OpenAI admits this](https://youtu.be/L_Guz73e6fw?t=1477)), and the consequences of having a misaligned AI are likely to be catastrophic.

## Policy implications

A 1% risk is unacceptably large.
We can only conclude that we need to take drastic measures right now.
We should not only pause training larger models, but we should also pause all research that could lead to runtime improvements and algorithmic improvements.
