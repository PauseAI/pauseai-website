---
title: Dangerous capabilities in AI
description: The more powerful AI becomes in specific domains, the larger the risks become.
---

As AI models become more powerful, they become more dangerous.
So at which point should we proceed with caution?

One particular threshold that is often mentioned, is AGI - or Artificial General Intelligence.
There's a lot of debate about what AGI exactly means.
Some say it's when AI can do all the cognitive tasks that humans can.
Some say GPT-4 already is AGI.
Steve Wozniak defines AGI as the first system that can enter a kitchen and make a cup of coffee.

From a safety perspective, the definition of AGI is not that important.
In fact, it can give us a false impression of safety, because we could think that we're safe until we reach AGI.
Even if an AI can not make a cup of coffee, it could still be dangerous.
What matters is _which capabilities an AI has_.

In this article, we'll dive into various dangerous capabilities, and what we can do to prevent them from actually harming us.

## Which capabilities can be dangerous?

- **Cybersecurity**. When an AI is able to discover security vulnerabilities (especially new, unknown ones), it can (be used to) [hack into systems](/cybersecurity-risks). Current [state of the art](/sota) AI systems can find some security vulnerabilities, but not yet at dangerous, advanced levels.
- **Biological**. Design novel biological agents, or help in the process of engineering a pandemic. A group of students were able to use a chatbot to [produce all the steps needed to create a new pandemic](https://arxiv.org/abs/2306.03809). An AI designed to find safe medicine was used to discover [40,000 new chemical weapons in six hours](https://www.theverge.com/2022/3/17/22983197/ai-new-possible-chemical-weapons-generative-models-vx).
- **Algorithmic improvements**. An AI that can find efficient algorithms for a given problem, could lead to a recursive loop of self-improvement, spinning rapidly out of control. This is called an _intelligence explosion_. The resulting AI would be incredibly powerful and could have all sorts of other dangerous capabilities. Luckily, no AI can self-improve yet. However, there are AIs that can find new, very efficient algorithms (like [AlphaDev](https://www.deepmind.com/blog/alphadev-discovers-faster-sorting-algorithms)).
- **Deception**. The ability to manipulate people, which includes social engineering. Various forms of deception are [already present](https://twitter.com/DanHendrycks/status/1699437800301752332) in current AI systems. For example, Meta's CICERO AI (which was trained to lead to "Better, more natural AI-human cooperation") turned out to an expert liar, deceiving other agents in the game. An AI that can deceive humans, may deceive humans during training runs. It could hide its capabilities or intentions.
- **Self-replication**. If an AI can create new instances on other machines, there is a risk of it spreading uncontrollably, leading to an [_AI takeover_](/ai-takeover). A sufficiently capable AI could outcompete humans and lead to human extinction.

This list is not exhaustive, so there are other dangerous capabilities that an AI could have.

## Preventing creation of dangerous capabilities

Can we prevent these dangerous capabilities from appearing?
As AIs become larger and are trained on more data, they attain new abilities.
It turns out to be very hard to predict which abilities will appear, and how well an AI will perform.
Because of this, they are often called _Emergent Capabilities_.
<!-- Example about theory of mind, graph -->

Our current paradigm of large langue models is almost inherently unpredictable.
AI models are not written like software - they are trained.
They are black boxes consisting of billions of numerical parameters.
No-one really knows what's going on inside.
This unpredictability makes it hard to say whether a training run will result in a dangerous AI.

## Preventing proliferation of dangerous capabilities

We obviously don't want these dangerous capabilities to fall in the hands of bad actors or irresponsible people.
One often proposed way of preventing this, is by _testing AIs_ before they are deployed.
The US is talking about a license requirement for AI systems, which includes red-teaming and testing for dangerous capabilities.

This is a start, but it's far from enough to keep us safe:

- **Models can be leaked**. We saw this happen with Meta's LLAMA model. Once it's out there, there is no going back.
- **Some capabilities are even dangerous inside AI labs**.
A self-replicating AI, for example, could escape from the lab before deployment.
- **Capabilities can be added or discovered after training**. This includes fine-tuning, jailbreaking, and runtime improvements.

## Capabilities can be added after training

But it actually gets worse.
There are still two ways in which an AI can get dangerous capabilities, even after training: **fine-tuning** and **runtime improvements**.
Say we thoroughly test an AI for dangerous capabilities, and find out that the AI's capabilities are not at a level where it can be dangerous.
So the AI is deployed, or shared as an open source model.

### Fine-tuning

Fine-tuning can be used to improve the capabilities of an existing AI model.
This is similar to training, but it's much faster, much cheaper, doesn't require as much data and can often be done on consumer hardware.
Fine-tuning changes the AIs parameters, and as such, changes its capabilities.
Now, fine-tuning is not as powerful as doing a full training run, but it can still improve on existing capabilities.

### Jailbreaking

The largest AIs are trained on absolutely vast amounts of data.
Most of the books, scientific articles, and websites.
There's a lot of nasty stuff in these datasets.
AIs are often fine-tuned using a technique called RLHF (Reinforcement Learning from Human Feedback) to get them to be helpful and nice.
In this process the AI has to un-learn some of the things that it was tought, like making racist remarks, explaining how to

### Runtime improvements

Runtime improvements make no changes to the model, but instead improve the way the model is used.

The simplest one of these, is to change the prompts.
Even small changes to prompts can have a large effect on the output of the model.
Adding a few words to a prompt can improve performance [by over 50%](https://arxiv.org/pdf/2309.03409.pdf).

But we can also use all sorts of software to augment some base model.
For example, people have found ways to add long-term memory to GPT-4, by letting the model query a database.
Or consider AutoGPT, which lets a model call itself recursively, which means it can run autonomously for any length of time.
Or consider [Voyager](https://arxiv.org/abs/2305.16291), a tool that enabled GPT-4 to play Minecraft fully autonomously. It even got to diamond gear.

We don't know how how far a base model can be stretched.
Even if we stop training new AI models right now, we'll probably see important innovations that add new capabilities to existing models.

## Policy implications

Right now, there is a lot happening in the AI regulation space.
Prominent figures in AI are writing articles on governance, and governments are drafting proposals.

A lot of these proposals are relying on pre-deployment testing.
This means that an AI model will be tested by a so-called red team after it is trained, to see if it has any dangerous capabilities.
And it if does, it should not be deployed.
We refer to this as [level 2 regulation](/4-levels-of-ai-regulation).

However, as we've discussed above, this is not enough to keep us safe.
Dangerous capabilities can appear in many ways, and it's hard to predict which capabilities will appear.
Even if we test models before they are deployed, there are still ways in which they can get dangerous capabilities after deployment.
This means that pre-deployment tests will not be sufficient.

The only safe option is to not build these powerful AI systems in the first place.
We should not allow the creation of these unpredictable, potentially highly dangerous AI systems.
That's why we're [calling for a Pause](/proposal)!
