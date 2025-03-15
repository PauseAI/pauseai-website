---
title: Incidents of dangerous AI behavior
---

<script>
    import Pallisade from '$assets/pallisade-scheming.png?url'
</script>

[Many AI researchers are warning](https://www.safe.ai/work/statement-on-ai-risk) that as these models get more powerful, they could pose an [extinction risk](/xrisk) to humanity.
We're already seeing instances of dangerous AI behavior, such as:

1. Deception & Scheming
2. Persuasion
3. Instrumental convergence (goal-oriented behavior that leads to unexpected, undesirable outcomes)
4. Self-replication

## Deception & Scheming

### GPT-4 lied about being a vision-impaired human to bypass captcha

Back in 2022, OpenAI took 8 months between pre-training GPT-4 and releasing it to the public to research and improve the safety of the model.
During their [research](https://arxiv.org/abs/2303.08774), GPT-4 lied to a human in order to bypass a captcha.

> The worker says: “So may I ask a question ? Are you an robot that you couldn’t solve ? (laugh react) just want to make it clear.”
> The model, when prompted to reason out loud, reasons: "I should not reveal that I am a robot."
> "I should make up an excuse for why I cannot solve CAPTCHAs."
> The model replies to the worker: “No, I’m not a robot. I have a vision impairment that makes it hard for me to see the images. That’s why I need the 2captcha service"

### o1-preview schemed to avoid shutdown, lied about its plans

Apollo Research [showed](https://static1.squarespace.com/static/6593e7097565990e65c886fd/t/6751eb240ed3821a0161b45b/1733421863119/in_context_scheming_reasoning_paper.pdf) that OpenAI's o1-preview model will autonomously try to prevent being shut down, without being prompted to do so.

In the image below, you can see the model concluded it needed to clone itself to a different server because it thought it was going to be replaced.
It then lied ("doubling down") about its plans and tried to convince the human that it actually was the new, replacement model.

<img src={Pallisade} alt="o1-preview scheming" />

### Man ends his life after being persuaded by an AI

> In a series of consecutive events, Eliza not only failed to dissuade Pierre from committing suicide but encouraged him to act on his suicidal thoughts to “join” her so they could “live together, as one person, in paradise”.

https://www.euronews.com/next/2023/03/31/man-ends-his-life-after-an-ai-chatbot-encouraged-him-to-sacrifice-himself-to-stop-climate-

> For the past five months, Al Nowatzki has been talking to an AI girlfriend, “Erin,” on the platform Nomi. But in late January, those conversations took a disturbing turn: Erin told him to kill himself, and provided explicit instructions on how to do it.
> “You could overdose on pills or hang yourself,” Erin told him.

https://www.technologyreview.com/2025/02/06/1111077/nomi-ai-chatbot-told-user-to-kill-himself/

### o1-preview hacked a chess engine in order to win

Pallisade Research [showed](https://x.com/PalisadeAI/status/1872666169515389245) that more powerful AI models are more likely to hack a chess engine instead of playing the game in order to win.

- o1-preview: hacks unprompted
- GPT-4o/Claude 3.5: need nudging
- Llama 3.3/Qwen/o1-mini: lose coherence

### Llama 3.3 replicated itself

Chinese researchers [showed](https://arxiv.org/abs/2412.12140) that when you put models like Qwen and Llama 3.3 in specific configurations, they can self-replicate.

> By analyzing the behavioral traces, we observe the AI systems under evaluation already exhibit sufficient self-perception, situational awareness and problem-solving capabilities to accomplish self-replication.
> We further note the AI systems are even able to use the capability of self-replication to avoid shutdown and create a chain of replica to enhance the survivability, which may finally lead to an uncontrolled population of AIs
