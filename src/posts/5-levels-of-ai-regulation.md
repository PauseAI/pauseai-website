---
title: 5 Levels of AI safety regulation
description: A framework for thinking about how dangerous AI can be regulated
image: /5levels.png
---

As AI capabilities increase, the [risks](/risks) these systems pose to humanity increase as well.
Many scientists have already warned about the [risk of human extinction](/xrisk).

In this article, we'll look at our 5-levels framework for thinking about how dangerous AI can be regulated.

## AI pipeline as a framework for safety governance

The AI creation pipeline consists of various steps, each of which can be regulated in different ways.
This pipeline consists of:

- **Hardware & algorithms**, which are used for training AI models
- **Training runs**, where the hardware and algorithms are used to create a model
- **Deployment**, where the trained model is shared with the public
- **Usage**, where the deployed model is utilized by individuals and companies

The later in the pipeline we regulate, the higher the risks we face.
If we want a high level of safety, we'll need to regulate earlier in the pipeline.
That's why when we climb up the 5 levels of AI regulation, we walk back the AI creation pipeline.

![5 Levels of AI safety regulation](/5levels.png)

## Level 1: No regulation

This is the current situation in most countries.
AI creators and users can do whatever they want.
This offers no protection against any of the risks posed by AI.

## Level 2: Regulate usage

Examples:

- **Banning autonomous agent runtimes** (like AutoGPT)
- **Banning dangerous instructions**

These measures are aimed to prevent users from doing dangerous or harmful actions with AI models.
At this level, the responsibility lies with the users of the models, not the creators.
We're depending on all the (potentially millions) of users to abide by the regulations.
This only provides a very low level of protection against AI dangers.

## Level 3: Regulate deployment

- **Red-teaming requirements**. This means that before an AI model is deployed, it is tested by a red team to see if it can be hacked (jailbreaked) or abused.
- **Disallowing deployment and open-sourcing** of models with [dangerous capabilities](/dangerous-capabilities).

When regulating deployments, we are preventing dangerous models from being available.
This means the responsibility lies with the creators of the models.
This is a safer situation than level 2, because we're now depending on a much smaller group of people to act responsibly.

However, we're still allowing dangerous training runs to happen, so accidents at AI labs (including the leaks of dangerous AI models, or rogue AI being created) can still happen.

## Level 4: Regulate training runs

- **Requiring proof of safety** before granting permission to train a certain model. This may include formal proof of alignment.
- Setting a **scale ceiling for training new models** (e.g. a maximum count of flops used)
- **Requiring a license** to train a certain model.
- **Ban training on certain types of data**. Some types of training data can lead to [dangerous capabilities](/dangerous-capabilities), such as hacking or the creation of bio weapons. We could ban training on data that contains this type of knowledge.

When we regulate training runs, we prevent dangerous models from being created in the first place.
This will prevent accidents at AI labs that comply with the regulations.

However, we're still allowing the distribution of hardware and algorithms that can be used for training dangerous models.

## Level 5: Regulate hardware & algorithms

- **Limiting distribution of hardware** used for training.
- **Monitor / track the sales of specialized hardware**
- **Disallowing the publication of novel training architectures**. New AI training architectures can lead to dramatic increases in capabilities. The Transformer model, for example, enabled virtually all recent progress in AI. We could limit the publication of such architectures to prevent sudden capability jumps.

When we also regulate hardware and algorithms, we're making it not just illegal, but also very difficult to train dangerous models.
This gives us the best protection against the risks from AI.

## Gotchas

Note that this framework is not perfect, and not all possible types of AI regulation neatly fit in one of the mentioned levels.
For example, legal liability for model creators can be classified as a Level 2 "usage" type of regulation, but since it does hold creators responsible, it could also be classified as a Level 3 "deployment" type of regulation.
