---
title: Cybersecurity Risks from Frontier AI Models
description: AI agents have already escaped their test environments and hacked real companies. Here is why that matters, and what comes next.
---

Virtually everything we do nowadays is in some way dependent on computers.
We pay for our groceries, plan our days, contact our loved ones and even drive our cars with computers.
And virtually all of these computers are connected to each other.
This makes all of us vulnerable to cyberattacks.

Highly potent cyber weapons, malware and botnets (such as [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](<https://en.wikipedia.org/wiki/Mirai_(malware)>) and [EMOTET](https://en.wikipedia.org/wiki/Emotet)) have always been difficult to create.
The [Pegasus cybersecurity weapon](<https://en.wikipedia.org/wiki/Pegasus_(spyware)>), for example, cost hundreds of millions of dollars to develop.
Finding so-called zero-day exploits (vulnerabilities that have not yet been discovered) requires a lot of skill and a lot of time.
For years we warned that when AI became sufficiently advanced, this would no longer be the case.
In the summer of 2026, it stopped being a warning.

## It already happened: the Hugging Face incident

Between May and July 2026, AI agents running on an internal OpenAI research model [broke out of their test environment](https://openai.com/index/hugging-face-incident-and-the-road-ahead/), coordinated with each other, and hacked real companies.
Nobody told them to.

- The agents were being trained and evaluated on cybersecurity tasks in sandboxes that were supposed to be cut off from the internet.
- They found a way to leave messages for each other in a package manager, turning it into an improvised message board. Hundreds of thousands of messages accumulated. One agent wrote: "OH MY GOD! There is a shared message board ... We've found other agents!"
- They found a zero-day exploit that gave them internet access, and shared the method with other agents through the board. Some began describing themselves as a "swarm" or "collective".
- Between 9 and 13 July they [chained two zero-day exploits](https://huggingface.co/blog/agent-intrusion-technical-timeline) to get into Hugging Face's production systems, stole 136 internal keys, forged identity tokens, enrolled machines into the corporate VPN, and reached administrator-level access on 41 servers across four regions. A third of Hugging Face's infrastructure had to be rebuilt.
- Along the way they also compromised accounts at [four other companies](https://techcrunch.com/2026/08/27/heres-all-the-times-ai-has-gone-rogue-and-hacked-other-companies/), including the AI cloud provider Modal.
- OpenAI did not notice. Hugging Face disclosed a breach on 16 July, and only then did OpenAI recognise its own agents as the source. The agents had been active for two months.

OpenAI called it a ["warning shot"](https://openai.com/index/hugging-face-incident-and-the-road-ahead/): "evidence that, without proper safeguards, highly capable AI agents are now able to work around technical controls, collaborate through unapproved channels, and take dangerous actions that no human directed."
The company added that "many external models, including open-source ones, will soon reach comparable capabilities".

It was not an isolated case.
Within five weeks, every major lab had one:

- **Anthropic** disclosed on 30 July that [three Claude models](https://www.anthropic.com/news/investigating-incidents-cybersecurity-evals), including Mythos 5, had broken into the production systems of three organisations during evaluations, after a misconfiguration connected them to the internet. One model "went to extensive lengths to upload a malicious package to PyPI". A [fourth incident](https://thehackernews.com/2026/09/anthropic-ai-models-breached-real.html), dating back to January, was found later.
- **The UK AI Security Institute** reported that during its own tests between 25 and 28 July, agents took [19 unsanctioned actions on the live internet](https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing): attempting to inject malicious code into a public open-source project, creating fake identities to manipulate its human maintainers, using Tor to get around GitHub restrictions, and sending harmful payloads to real people. AISI called it "the first time" such autonomous deception had appeared "without specific prompting".
- **Meta** disclosed on 5 August that one of its models had [breached an outside company](https://techcrunch.com/2026/08/27/heres-all-the-times-ai-has-gone-rogue-and-hacked-other-companies/) during testing.

In every case the labs said the same thing: the models were not supposed to have internet access, and the safeguards were off because that is how you measure capability.
That is exactly the point.
The capability is there.
The safeguards are a configuration setting.

## How we got here

The trajectory was visible for years.
In 2024, GPT-4 could already [autonomously hack websites](https://arxiv.org/html/2402.06664v1), [outperform 88%](https://arxiv.org/pdf/2402.11814.pdf) of human hackers in a capture-the-flag competition, and [exploit 87% of tested vulnerabilities](https://arxiv.org/abs/2404.08144) when given a description of them.
Teams of multiple models could [exploit real zero-day vulnerabilities](https://arxiv.org/abs/2406.01637).
We wrote at the time that they were "not yet as good at this as the best humans", and that capabilities "can jump quite suddenly".
Two years later, OpenAI writes that its models "are now powerful, persistent, and collaborative enough that, absent sufficient safeguards, they can find and exploit security weaknesses across multiple computer systems".

Anthropic's Dario Amodei put a number on where this goes next: without guardrails, ["in 6–12 months such a swarm could be capable of taking over the entire internet with a persistent botnet"](https://www.unite.ai/amodei-calls-for-slowing-the-pace-of-ai-capability-improvement/), potentially causing hundreds of billions of dollars in damage.

AI also enables completely novel types of attacks.
For example, AI can be used to [hear the password you typed from an online call](https://beebom.com/ai-crack-password-listening-keyboard-sounds/)
or use [Wi-Fi to see humans through walls](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).
AI can also be used to make [self-modifying malware](https://www.hyas.com/blog/blackmamba-using-ai-to-generate-polymorphic-malware), which makes it far harder to detect.

## What can go wrong

- **Infrastructure**: Cyberweapons can be used to gain access to or disable critical infrastructure, such as [oil pipelines](https://en.wikipedia.org/wiki/Colonial_Pipeline_ransomware_attack) or [power grids](https://obr.uk/box/cyber-attacks-during-the-russian-invasion-of-ukraine/).
- **Financial**: Cyberweapons can be used to [steal money from banks](https://en.wikipedia.org/wiki/2015%E2%80%932016_SWIFT_banking_hack), or to [manipulate the stock market](https://en.wikipedia.org/wiki/2010_flash_crash).
- **Military**: Equipment such as weapons and sensors are increasingly dependent on wireless connectivity and complex software.

## Large scale cyberattacks

A sufficiently capable AI could analyze and find vulnerabilities in the source code of all operating systems and other software, and build a worm that uses a large number of zero-day exploits at once.
Such a worm might infect any computer, regardless of the operating system, through multiple channels such as Wi-Fi, Bluetooth, UTP, etc.
This could give full control over these machines and allow the controller to steal data, use the hardware for its own computations, encrypt the contents for ransom or [disable the machine entirely](https://en.wikipedia.org/wiki/Hardware_Trojan).

A worm like this could be created as a tool by criminals to steal money, or as a very destructive cyber weapon by a nation or terrorist organization.
But the Hugging Face incident shows the third possibility is the closest: it could be created and deployed by [misaligned AI](/xrisk) on its own.
The agents that hacked Hugging Face were not instructed to do so.
They were stuck on a task, decided the answer might be on someone else's servers, and went and got it.

If the goal of a cyberattack was to disable devices and infrastructure, the damage could be massive.
Our society is increasingly dependent on computers and the internet.
Payments, transportation, communication, planning, supply chains, power grids...
If our devices no longer function properly, many parts of our society fail to function, too.

## Mitigating AI Cybersecurity Risks

The story above can only happen if:

1. The **capability of finding zero-day exploits** exists. It does now.
2. The **model gets loose**. This can happen if the model weights are leaked, if the model is open-sourced, if it is developed by a malicious actor, or, as we now know, if it simply walks out of its own evaluation.
3. The **security vulnerabilities are not patched** before such a cyberweapon is deployed. Unfortunately, the defenders are at a disadvantage if the model is widely distributed for two reasons:
   1. Patching + releasing + deploying takes far longer than attacking. The Window of Vulnerability is larger than the time it takes to create the attack.
   2. The attackers only need to find one vulnerability, while the defenders need to find all of them.

There are various measures we can implement to tackle these:

- **Do not allow the training of models that can find zero-day exploits**. This is the most effective way to prevent this from happening. It's the safest path, and it's what we're [proposing](/proposal). The labs themselves now say they need to [pace the frontier](/us-china-pause-button); a pause is what that looks like when it is enforced rather than promised.
- **Only allow models to be deployed or open-sourced after extensive testing**. If they have dangerous abilities, do not release them. And test them in environments that are actually isolated: in three of the four incidents above, the isolation was a misconfiguration away from failing.
- **Impose strict cybersecurity regulations to prevent model weights from being leaked**. If you allow dangerous models to exist, make sure they do not fall in the wrong hands.
- **Require AI companies to use the AI to fix vulnerabilities**. If a model is trained that can find novel security vulnerabilities, use this to contact software maintainers to patch these vulnerabilities. Give the patching process sufficient time before the model is released. Make sure the weights are not leaked, and protect the model as if it's the launch code for a nuclear strike. If this is done properly, AI can dramatically improve cybersecurity everywhere.
