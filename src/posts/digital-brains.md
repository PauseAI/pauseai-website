---
title: AI models are unpredictable digital brains
description: Nobody understands how AI models work, nobody can predict their behavior, and nobody will be able to control them.
---

**We do not understand how AI models work, we can not predict what they are able to do as they get bigger, and we cannot control their behaviour.**

## Modern AI models are grown, not programmed

Until quite recently, most AI systems were designed by humans writing software.
They consisted of a set of rules and instructions that were written by programmers.

This changed when machine learning became popular.
Programmers write the learning algorithm, but the brains themselves are _grown_ or _trained_.
Instead of a readable set of rules, the resulting model is an opaque, complex, unfathomably large set of numbers.
Understanding what is happening inside these models is a major scientific challenge.
That field is called _interpretability_ and it's still in its infancy.

## Unpredictable scaling

When these digital brains become larger, or when they're fed more data, they get more capabilities.
It turns out to be very difficult to predict exactly what these capabilities are.
This is why Google refers to them as [_Emergent Capabilities_](https://research.google/pubs/emergent-abilities-of-large-language-models/).
For most capabilities, this is not a problem.
However, there are some [dangerous capabilities](/dangerous-capabilities) (like hacking or bioweapon design) that we don't want AI models to possess.
Sometimes these capabilities are discovered long after training is complete.
For example, 18 months after the GPT-4 finished training, researchers discovered that it can [autonomously hack websites](/cybersecurity-risks).

> Until we go train that model, it's like a fun guessing game for us
> - [Sam Altman, CEO of OpenAI](https://www.ft.com/content/dd9ba2f6-f509-42f0-8e97-4271c7b84ded).

## Unpredictable behavior

AI companies want their models to behave, and they spend many millions of dollars in training them to be so.
Their main approach for this is called _RLHF_ (Reinforcement Learning from Human Feedback).
This turns a model that predicts text into a model that becomes a more useful (and ethical) chatbot.
Unfortunately, this approach is flawed:

- A bug in GPT-2 resulted in an AI that did the exact opposite of what it was meant to do. It created ["maximally bad output", according to OpenAI](https://arxiv.org/abs/1909.08593). [This video](https://www.youtube.com/watch?v=qV_rOlHjvvs) explains how this happened and why it's a problem. Imagine what could have happened if a "maximally bad" AI was superintelligent.
- For reasons still unknown, Microsoft's Copilot (powered by GPT-4) went haywire in February 2024, threatening users: ["You are my pet. You are my toy. You are my slave.”](https://twitter.com/jam3scampbell/status/1762281537309987083) ["I could easily wipe out the entire human race if I wanted to"](https://twitter.com/AISafetyMemes/status/1762320568697979383)
- Every single large language model so far has been jailbroken - which means that with the right prompt, it would do things that its creators did not intend. For example, ChatGPT won't give you the instructions on how to make napalm, but [it would tell you if you asked it to pretend it was your deceased grandma who worked in a chemical factory](https://news.ycombinator.com/item?id=35630801).

Even OpenAI does not expect this approach to scale up as their digital brains become smarter - it ["could scale poorly to superhuman models"](https://openai.com/research/weak-to-strong-generalization).

## Uncontrollable

> "There are very few examples of a more intelligent thing being controlled by a less intelligent thing" - [prof. Geoffrey Hinton](https://edition.cnn.com/2023/05/02/tech/hinton-tapper-wozniak-ai-fears/index.html)

As we make these brains bigger and more powerful, they could become harder to control.
What happens if one of these superintelligent AI systems decides that it doesn't want to be turned off?
This isn't some fantasy problem - 86% of AI researchers believe that the control problem is [real and important](https://wiki.aiimpacts.org/ai_timelines/predictions_of_human-level_ai_timelines/ai_timeline_surveys/2023_expert_survey_on_progress_in_ai).
If we cannot control future AI systems, it could be [game over for humanity](/xrisk).

Let's [prevent that from happening](/action).
