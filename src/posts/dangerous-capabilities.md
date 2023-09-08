---
title: Dangerous capabilities in AI
description: The more powerful AI becomes in specific domains, the larger the risks become.
---

As AIs become larger and are trained on more data, they attain new abilities.
It is hard to predict which abilities will appear.
Because of this, they are often called _Emergent Capabilities_.
Some of these capabilities can be extremely dangerous.

## Which capabilities can be dangerous?

- **Cybersecurity**. When an AI is able to discover security vulnerabilities (especially new, unknown ones), it can (be used to) [hack into systems](/cybersecurity-risks). Current [state of the art](/sota) AI systems can find some security vulnerabilities, but not yet at dangerous, advanced levels.
- **Biological**. Design novel biological agents, or help in the process of engineering a pandemic. A group of students were able to use a chatbot to [produce all the steps needed to create a new pandemic](https://arxiv.org/abs/2306.03809). An AI designed to find safe medicine was used to discover [40,000 new chemical weapons in six hours](https://www.theverge.com/2022/3/17/22983197/ai-new-possible-chemical-weapons-generative-models-vx).
- **Algorithmic improvements**. An AI that can find efficient algorithms for a given problem, could lead to a recursive loop of self-improvement, spinning rapidly out of control. This is called an _intelligence explosion_. Luckily, no AI can self-improve yet. However, there are AIs that can find new, very efficient algorithms (like [AlphaDev](https://www.deepmind.com/blog/alphadev-discovers-faster-sorting-algorithms)).
- **Deception**. The ability to manipulate people, which includes social engineering. Various forms of deception are [already present](https://twitter.com/DanHendrycks/status/1699437800301752332) in current AI systems. For example, Meta's CICERO AI (which was trained to lead to "Better, more natural AI-human cooperation") turned out to an expert liar, deceiving other agents in the game.
- **Self-replication**. If an AI can create new instances on other machines, there is a risk of it spreading uncontrollably. This is called an [_AI takeover_](/ai-takeover). Luckily, no AI has this capability yet.

## How can we prevent dangerous capabilities?

- **Test for dangerous capabilities before deployment**. Require that AI systems are tested for dangerous capabilities before they are deployed. External audits with standardized tests could be used to verify that the AI is safe to some extent. However, this is far from a perfect solution for two reasons. Firstly, _some capabilities are hidden and are only discovered after a long time_. Secondly, highly dangerous capabilities are also _dangerous when they are only available to AI labs_.$$
- **Don't train dangerous AIs**. The safest option is to not build these powerful AI systems in the first place. That's why we're [calling for a Pause](/proposal)!
