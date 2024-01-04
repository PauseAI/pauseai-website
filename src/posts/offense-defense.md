---
title: Offense / Defense balance in AI safety
description: How to think about the balance between offense and defense in AI safety
---

Offense-defense balance refers to the relative strengths and weaknesses of offensive and defensive strategies, usually in the context of military conflict or sports competitions.

Since AI is a dual-use technology, we can see these offense-defense balances play a role in various AI safety problems:

- Fake media generation, fake media detection
- Cybersecurity attacks, cybersecurity defenses
- AI takeover, AI defense against takeover

How will the offense-defense balance in AI safety play out?

## Fake media

Modern Large Language Models can create text in all sorts of styles, and other models can create images, audio, and even video.
Many models create unconvincing fakes, but the quality is improving rapidly.

State-of-the-art text, audio and image models are already good enough to fool most humans.
In 2022, the first AI generated image won an art competition.
A couple of months later, a photography contest was won using an AI generated image.

We also have AIs that can detect deepfakes.
This results in a cat and mouse game between the fakers and the detectors.

For text, the offense seems to be winning.
OpenAI [discontinued](https://news.ycombinator.com/item?id=36862850) their AI classifier due to low accuracy.

Luckily, measures like [watermarking](https://arxiv.org/abs/2303.07205) and digital signatures can be used to detect fakes.
Requiring signatures for all media we consume might be a suitable solution.

## Cybersecurity attacks vs defenses

Modern Large Language Models can be used to find vulnerabilities in software.
When you discover a vulnerability, you can fix it (defense) or exploit it (offense).
And luckily, by far most people are on the defense side.

However, there are some advantages that attackers have over defenders:

- **Attackers only need to find one vulnerability, while defenders need to find all of them.** The defenders will not know which vulnerability the attackers will find, so they need to defend against all of them.
- **Deploying patches takes longer than attacking.** The "Window of Vulnerability" is the time it takes from an exploit to be discovered to the time it is patched. Defenders need to fix the bug, re-compile the application or publish the updated libraries, and then all users need to update their software. This can take months, and in the meantime, the vulnerability can be exploited.

## Biohazards and biodefense

AI can be used to design new biological agents, or help in the process of engineering a pandemic.
A group of students was able to use a chatbot to [produce all the steps needed to create a new pandemic](https://arxiv.org/abs/2306.03809).
However, it might also be used to create new vaccines, medicine or defenses against biological agents.

- **Viruses spread quicker than vaccines**. A virus is literally a self-replicating machine. A vaccination, on the other hand, requires a lot of effort to produce and distribute.

## Unknown technology and risks

An AI far smarter than humans may be able to use its superior understanding of reality to create new technologies.
Perhaps some self-replicating nanobots that can convert all matter into copies of themselves, or small machines that can influence the brains of humans.
Predicting what exactly this type of technology will be is impossible (we'd have to be at least as smart as the AI), but we can still reason about the offense-defense balance.
The conclusion is not that difficult: we have no idea what's coming, and we have no idea how to defend against it.
We're at a disadvantage.

## Conclusion

Many AI risks have an offense-defense balance.
For fake media, we could use digital signatures to detect fakes, shifting the balance to defense.
For cybersecurity, biohazards and unknown technology, the offense seems to have the advantage.

The important policy implication of this is: let's not build this technology in the first place.
