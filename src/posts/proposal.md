---
title: PauseAI Proposal
description: Implement a temporary pause on the training of AI systems more powerful than GPT-4, ban training on copyrighted material, hold model creators liable.
---

**Implement a pause on the training of AI systems more powerful than GPT-4**, until we know how to build them safely and keep them under democratic control.

_Version: Sept 22nd, 2024_

Individual countries can and should implement this measure _right now_.
Especially the US (or California, specifically) should implement a Pause, since it is home to virtually all leading AI companies.
Many scientists and industry leaders [agree that a Pause is necessary](https://futureoflife.org/open-letter/pause-giant-ai-experiments/), and the (US) public also strongly supports a pause ([64%](https://www.campaignforaisafety.org/usa-ai-x-risk-perception-tracker/) - [69%](https://today.yougov.com/topics/technology/survey-results/daily/2023/04/03/ad825/2)).

However, we cannot expect countries or companies to risk their competitive advantage by pausing AI training runs for a long time if other countries or companies do not do the same.
This is why we need a **global Pause**.

## Implementing a global Pause

An international agreement is typically established through a summit, where leaders of countries meet to discuss the issue and make a decision.
The UK has stepped up and has hosted an AI safety summit in the autumn of 2023.
And two more summits have been announced.
[More about the summits](/summit).

The primary goal of the summit should be a **treaty**.
This treaty should specify the policy measures that protect us from the [risks of AI](/risks).
This treaty needs to be signed by all UN member states.

- **Set up an international AI safety agency**, similar to the IAEA. This agency will be responsible for:
  - Granting approval for _deployments_. This will include red-teaming / model evaluations.
  - Granting approval for _new training runs_ of AI models above a certain size (e.g. 1 billion parameters).
  - Periodic meetings to discuss the progress of AI safety research.
- **Only allow training of general AI systems more powerful than GPT-4 if their safety can be guaranteed**.
  - By more powerful than GPT-4, we mean all AI models that are either 1) larger than 10^12 parameters, 2) have more than 10^25 FLOPs used for training or 3) capabilities that are expected to exceed GPT-4.
  - **Verify** that these dangerous training runs are not taking place. This can be done in [numerous ways](https://arxiv.org/abs/2408.16074): [tracking GPUs](https://arxiv.org/abs/2303.11341), incentivising whistleblowers, energy monitoring, data center inspections, financial intelligence, semiconductor manufacturing facility inspections, AI developer inspections, chip location tracking and chip-based reporting. The [AI chip supply chain](https://www.governance.ai/post/computing-power-and-the-governance-of-ai) is highly centralized which enables global oversight.
  - Note that this does not target _narrow_ AI systems, like image recognition used for diagnosing cancer.
  - Require [oversight during training runs](https://www.alignmentforum.org/posts/Zfk6faYvcf5Ht7xDx/compute-thresholds-proposed-rules-to-mitigate-risk-of-a-lab).
  - It may be possible that the AI alignment problem is _never solved_ - it may be unsolvable. In that case, we should never allow training of such systems.
  - Even if we can build controllable, safe AI, only build and deploy such technology with **strong democratic control**. A superintelligence is too powerful to be controlled by a single company or country.
- **Only allow deployment of models after no [dangerous capabilities](/dangerous-capabilities) are present**.
  - We will need standards and independent red-teaming to determine whether a model has dangerous capabilities.
  - The list of dangerous capabilities may change over time as AI capabilities grow.
  - Note that fully relying on model evaluations [is not enough](/4-levels-of-ai-regulation).

Implementing a pause _can_ backfire if it is not done properly.
Read more about [how these risks can be mitigated](/mitigating-pause-failures).

## Other measures that effectively slow down

- **Ban training of AI systems on copyrighted material**. This helps with copyright issues, slows growing inequality and slows down progress towards superintelligence.
- **Hold AI model creators liable** for criminal acts committed using their AI systems. This gives model creators more incentives to make sure their models are safe.

## Long term policy

At the time of writing, training a GPT-3 sized model costs millions of dollars.
This makes it very difficult to train such models, and this makes it easier to enforce the control of training using GPU tracking.
However, the cost of training a model is decreasing exponentially due to hardware improvements and new training algorithms.

There will come a point where potentially superintelligent AI models can be trained for a few thousand dollars or less, perhaps even on consumer hardware.
We need to be prepared for this.
We should consider the following policies:

- **Limit publication of training algorithms / runtime improvements**. Sometimes a new algorithm is published that makes training much more efficient. The Transformer architecture, for example, enabled virtually all recent progress in AI. These types of capability jumps can happen at any time, and we should consider limiting the publication of such algorithms to minimize the risk of a sudden capability jump. Similarly, some runtime innovations could drastically change what can be done with existing models. These advancements may need to be regulated as well.
- **Limit capability advancements of computational resources**. If training a superintelligence becomes possible on consumer hardware, we are in trouble. We should consider limiting capability advances of hardware.

## Help to achieve this

[Join](/join) the movement to collaborate or [take action](/action) on your own!
