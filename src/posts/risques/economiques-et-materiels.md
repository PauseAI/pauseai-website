---
title: Cybersecurity risks of AI
description: How AI could be used to hack all devices.
---

Virtually everything we do nowadays is in some way dependent on computers.
We pay for our groceries, plan our days, contact our loved ones and even drive our cars with computers.
And virtually all of these computers are connected to each other.
This makes all of us vulnerable to cyberattacks.

Highly potent cyber weapons, malware and botnets (such as [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](<https://en.wikipedia.org/wiki/Mirai_(malware)>) and [EMOTET](https://en.wikipedia.org/wiki/Emotet)) have always been difficult to create.
The [Pegasus cybersecurity weapon](<https://en.wikipedia.org/wiki/Pegasus_(spyware)>), for example, cost hundreds of millions of dollars to develop.
Finding so-called zero-day exploits (vulnerabilities that have not yet been discovered) requires a lot of skill and a lot of time - only highly specialized hackers can do it.
However, when AI becomes sufficiently advanced, this will no longer be the case.
Instead of having to hire a team of highly skilled security experts/hackers to find zero-day exploits, anyone could just use a far cheaper AI.

The latest AI systems can already analyze and write software.
They [can find vulnerabilities](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) in software, and [they could be used to exploit them](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).
GPT-4 can already [autonomously hack websites](https://arxiv.org/html/2402.06664v1), performing tasks as complex as blind database schema extraction and SQL injections without human feedback, which was discovered 18 months after GPT-4 finished training.
GPT-4 already [outperforms 88%](https://arxiv.org/pdf/2402.11814.pdf) of human hackers in a CTF competition.
It can also [autonomously exploit 87% of tested vulnerabilities](https://arxiv.org/abs/2404.08144), which is a huge step up from GPT-3.5 or open-source models, which all got 0%.
As AI capabilities grow, so will the vulnerabilities they can detect and the exploits they can create.
They are not yet as good at this as the best humans are, so right now the danger is limited.
However, capabilities are rapidly increasing, and can jump quite suddenly.

Note that AI also enables completely novel types of attacks.
For example, AI can be used to [hear the password you typed from an online call](https://beebom.com/ai-crack-password-listening-keyboard-sounds/)
or use [Wi-Fi to see humans through walls](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).
AI can also be used to make [self-modifying malware](https://www.hyas.com/blog/blackmamba-using-ai-to-generate-polymorphic-malware), which makes it far harder to detect.

There will most likely come a point where an AI is better at hacking than the best human hackers.
This can go wrong in many ways.

- **Infrastructure**: Cyberweapons can be used to gain access to or disable critical infrastructure, such as [oil pipelines](https://en.wikipedia.org/wiki/Colonial_Pipeline_ransomware_attack) or [power grids](https://obr.uk/box/cyber-attacks-during-the-russian-invasion-of-ukraine/).
- **Financial**: Cyberweapons can be used to [steal money from banks](https://en.wikipedia.org/wiki/2015%E2%80%932016_SWIFT_banking_hack), or to [manipulate the stock market](https://en.wikipedia.org/wiki/2010_flash_crash).
- **Military**: Equipment such as weapons and sensors are increasingly dependent on wireless connectivity and complex software.

## Large scale cyberattacks

It may be possible that such powerful AI will be used to create a virus that uses a large number of zero-day exploits.
Most cyberweapons use
A sufficiently capable AI could analyze and find vulnerabilities in the source code of all operating systems and other software.
Such a virus might infect any computer, regardless of the operating system, through multiple channels such as Wi-Fi, Bluetooth, UTP, etc.
This could give full control over these machines and allows the controller to steal data, use the hardware for its own computations, encrypt the contents for ransom or [disable the machine entirely](https://en.wikipedia.org/wiki/Hardware_Trojan).

A virus like this could be created as a tool by criminals to steal money, or as a very destructive cyber weapon by a nation or terrorist organization.
However, as AI becomes more agentic, it could also be autonomously created and deployed by [misaligned AI](/xrisk).

If the goal of a cyberattack was to disable devices and infrastructure, the damage could be massive.
Our society is increasingly dependent on computers and the internet.
Payments, transportation, communication, planning, supply chains, power grids...
If our devices no longer function properly, many parts of our society fail to function, too.

Over [93% of cybersecurity experts](https://www.weforum.org/publications/global-cybersecurity-outlook-2023/) believe “a far-reaching, catastrophic cyber event is likely in the next two years”.

## Mitigating AI Cybersecurity Risks

The story above can only happen if:

1. The **capability of finding zero-day exploits** emerges. Current models can already discover some vulnerabilities, but this will likely improve with newer models.
2. The **model gets into the hand of bad actors**. This can happen if the model weights are leaked, if the model is open-sourced, or if it's developed by a malicious actor.
3. The **security vulnerabilities are not patched** before such a cyberweapon is deployed. Unfortunately, the defenders are at a disadvantage if the model is widely distributed for two reasons:
   1. Patching + releasing + deploying takes far longer than attacking. The Window of Vulnerability is larger than the time it takes to create the attack.
   2. The attackers only need to find one vulnerability, while the defenders need to find all of them.

There are various measures we can implement to tackle these:

- **Do not allow the training of models that can find zero-day exploits**. This is the most effective way to prevent this from happening. It's the safest path, and it's what we're [proposing](/proposal).
- **Only allow models to be deployed or open-sourced after extensive testing**. If they have dangerous abilities, do not release them.
- **Impose strict cybersecurity regulations to prevent model weights from being leaked**. If you allow dangerous models to exist, make sure they do not fall in the wrong hands.
- **Require AI companies to use the AI to fix vulnerabilities**. If a model is trained that can find novel security vulnerabilities, use this to contact software maintainers to patch these vulnerabilities. Give the patching process sufficient time before the model is released. Make sure the weights are not leaked, and protect the model as if it's the launch code for a nuclear strike. If this is done properly, AI can dramatically improve cybersecurity everywhere.
