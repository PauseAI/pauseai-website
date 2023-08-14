---
title: Cybersecurity risks of AI
description: How AI could be used to hack all devices.
---

Virtually everything we do nowadays is in some way dependent on computers.
We pay for our groceries, plan our days, contact our loved ones and even drive our cars with computers.
And virtually all of these computers are connected to each other.
This makes all of us vulnerable to cyberattacks.

Highly potent cyber weapons, malware and botnets (such as [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](https://en.wikipedia.org/wiki/Mirai_(malware)) and [EMOTET](https://en.wikipedia.org/wiki/Emotet)) have always been costly to create.
The [Pegasus cybersecurity weapon](https://en.wikipedia.org/wiki/Pegasus_(spyware)), for example, cost hundreds of millions of dollars to develop.
Finding so-called zero-day exploits (vulnerabilities that have not yet been discovered) is a very hard task.
It requires a lot of skill and a lot of time to find these exploits - only highly specialized hackers can do it.
However, when AI becomes more advanced, this will no longer be the case.
Instead of having to hire a team of highly skilled security experts/hackers to find zero-day exploits, you could just use a far cheaper AI to do it for you.

The latest AI systems can already analyze and write software.
They [can find vulnerabilities](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) in software, and [they could be used to exploit them](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).
As AI capabilities grow, so will the vulnerabilities they can detect and the exploits they can create.
They are not yet as good at this as the best humans are, but they are getting closer quickly.

Note that AI also enables completely novel types of attacks.
For example, AI can be used to [hear the password you typed from an online call](https://beebom.com/ai-crack-password-listening-keyboard-sounds/)
or use [WiFi to see humans through walls](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).

There will most likely come a point where an AI is better at hacking than the best human hackers.
This can go wrong in many ways.

- **Nuclear**: Cyberweapons can be used to gain access to nuclear materials, meltdown a reactor, convince humans they need to fire nuclear missiles, or even fire them automatically.
- **Infrastructure**: Cyberweapons can be used to gain access to or disable critical infrastructure, such as power plants, water treatment facilities, or the internet.
- **Financial**: Cyberweapons can be used to steal money from banks, or to manipulate the stock market.

But extremely capable AI systems could also be used to create a virus that infects virtually all computers:

## A Super Virus

Imagine a virus that can infect any computer, regardless of the operating system.
This is theoretically possible, but it would be extremely hard to create.
It would require analyzing the source code of all operating systems and finding (new) vulnerabilities in all of them.
No single person could do this, but a sufficiently capable AI could.
This type of Super Virus could spread to effectively all machines that have some sort of connection to other computers (through WiFi, Bluetooth, UTP, etc.).
It could then have full control over these machines.
It could steal data, spread itself, use the hardware for computations, or simply make the machine unusable.

If creating these types of viruses becomes technically feasible, someone will likely do it eventually.
It could happen by accident (e.g. by a [misaligned AI](/xrisk)), or it could happen on purpose (e.g. as a cyber weapon by a nation or terrorist).
And when that happens, the effects could be devastating.

If effectively all computers are disabled, society breaks down.
People will not be able to buy food with their credit cards or phones.
Truck drivers would not know which supermarkets to drive to.
Farmers would not be able to sell their produce or restock supplies.
The economy would grind to a halt, all supply chains would break down, and people will start to go hungry.

## Mitigating AI Cybersecurity Risks

The story above can only happens if:

1. The **capability of finding zero-day exploits** emerges
2. The **model gets into the hand of bad actors**. This can happen if the model weights are leaked, if the model is open-sourced, or if it's developed by a malicious actor.
3. The **security vulnerabilities are not patched** before such a cyberweapon is deployed. Unfortunately, the defenders are at a disadvantage if the model is widely distributed since patching + deploying takes far longer than attacking.

There are various measures we can implement to tackle these:

- Only allow models to be deployed after extensive testing. If they have dangerous abilities, do not release them.
- If a model is trained that can find novel security vulnerabilities, use this to contact software maintainers to patch these vulnerabilities. Give the patching process sufficient time before the model is released. Make sure the weights are not leaked, and protect the model as if it's the launch code for a nuclear strike.
- [Pause the dangerous training runs](/proposal).
