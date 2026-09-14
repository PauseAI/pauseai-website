---
title: 'The Dutch Pause Button: How the Netherlands Can Use ASML to Enforce an AI Treaty'
description: The Netherlands already licenses every export of ASML's EUV lithography machines. Here is how those licenses could become the enforcement mechanism for a global pause on superintelligence.
---

Every advanced AI chip in the world is made on machines built by one company, in one country.
That company is ASML, and that country is the Netherlands.
The Dutch government already requires a license for every export of ASML's most advanced machines.
Right now, those licenses are used for one purpose: keeping China behind.

This page describes how the same licenses could be used for a different purpose: enforcing a [global pause on the development of superintelligence](/proposal).
It builds on our [Building the Pause Button](/building-the-pause-button) research, the [arXiv report](https://arxiv.org/abs/2506.20530) that came out of it, and the demand we made at our [Amsterdam protest in December 2025](/amsterdam-protest-2025-december).
For why this matters for the two countries that hold most of the world's compute, read [The US-China Pause Button](/us-china-pause-button).

_This page is a work in progress. Last updated September 2026._

## Contents

## Why ASML

We do not expect any single country to pause AI on its own.
The [race dynamics](/building-the-pause-button#the-race-why-we-need-international-cooperation) are too strong.
What we need is an international treaty, and a treaty needs something to enforce it with.

The AI chip supply chain is [extremely concentrated](/feasibility), and lithography is its narrowest point:

- ASML is the only company in the world that makes extreme ultraviolet (EUV) lithography machines. Every cutting-edge AI chip and every stack of high-bandwidth memory is made on them.
- ASML shipped [48 EUV systems in 2025](https://www.asml.com/en/news/press-releases/2026/q4-2025-financial-results), plus eight High-NA systems. Total capacity is estimated at [80 to 85 machines per year](https://europe2031.ai/).
- Each machine costs [up to $380 million](https://www.iaps.ai/research/semiconductor-manufacturing-equipment-export-controls) and took ASML [17 years and €6 billion](https://www.iaps.ai/research/semiconductor-manufacturing-equipment-export-controls) of research to commercialize. Nobody else has one.
- The machines need constant maintenance, software updates and field upgrades from ASML. Service and upgrades brought in [€8.2 billion in 2025](https://www.asml.com/en/news/press-releases/2026/q4-2025-financial-results), a quarter of ASML's revenue. ASML can also [remotely disable](https://www.businessinsider.com/asml-tsmc-semiconductor-chip-equipment-kill-switch-china-invade-taiwan-2024-5) its EUV machines, as it confirmed to the Dutch government in 2024 for the case of a Taiwan invasion.

The last point matters most.
Chips wear out in a few years, but a fab produces for a decade or more.
That is why the [MIRI treaty draft](https://arxiv.org/abs/2511.10783) treats chip manufacturing equipment more strictly than chips themselves: whoever controls the equipment controls the growth curve.
And because the machines depend on ASML for the rest of their life, the leverage does not end at the moment of sale.

## The Netherlands already has the instrument

The Dutch government does not need to invent anything.

Since 1 September 2023, the [Regeling geavanceerde productieapparatuur voor halfgeleiders](https://sanctionsnews.bakermckenzie.com/the-netherlands-to-introduce-supplemental-export-controls-for-advanced-semiconductor-production-equipment/) (Regulation on Advanced Semiconductor Manufacturing Equipment) requires a national license for the export of EUV and advanced DUV immersion systems to any destination outside the EU.
It was [expanded in September 2024](https://www.rijksoverheid.nl/actueel/nieuws/2024/09/06/nederland-uitbreiding-exportcontrolemaatregel-geavanceerde-productieapparatuur-halfgeleiders) and [again in April 2025](https://ecustoms.sgs.com/2025/02/12/aanscherping-exportcontrole-op-geavanceerde-productieapparatuur-voor-halfgeleiders-per-1-april-2025/).
The Minister for Foreign Trade decides on each license, case by case.
The legal basis is [Article 9 of EU Regulation 2021/821](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32021R0821), which lets member states impose national controls for reasons of public security.

Today the licensing criteria are simple: China is denied, everyone else is approved.
Our proposal is to change the criteria, not the instrument.

## What to enforce through ASML

Only things that are visible at the fab can be enforced directly, because the fab is the license holder.
Everything downstream (chip designers, cloud providers, AI labs) can only be reached through flow-down conditions.
So the measures come in layers, ordered by how directly they can be enforced.

### Layer 1: conditions on the fab

These are conditions for receiving new machines, upgrades and maintenance.
All four can be verified with data that ASML and the fab already collect.

1. **Chip registration.** Every AI logic die and every HBM stack gets a unique identifier and is reported to a register, with production volume, specifications and buyer. This is the [Global Compute Supply Registry](https://arxiv.org/abs/2506.20530) from Building the Pause Button and Article VI of the [MIRI treaty draft](https://arxiv.org/abs/2511.10783). Without a register, nothing else can be verified.
2. **A cap on AI capacity growth.** A maximum number of EUV systems, or wafer starts, per year for AI logic and HBM. Replacement of old tools and non-AI production (phones, cars, medical devices) stay unrestricted. This is the only measure that slows the exponential itself. The precedent is the [US Drug Enforcement Administration](https://arxiv.org/abs/2506.20530), which sets annual production quotas for controlled substances. The MIRI draft includes the same idea to prevent a "breakout" stockpile.
3. **Know your customer, at the fab.** The fab sells AI chips only to registered buyers, and not to states or entities outside the regime. The MIRI draft calls this a "presumption of denial" for non-parties.
4. **Inspection access.** Independent inspection of fab output and register data, modeled on [IAEA safeguards](https://arxiv.org/abs/2604.04712). Refusal means no more maintenance.

### Layer 2: conditions passed on to chip buyers

These are contractual, enforced by the fab under threat of losing supply.

5. **Chain of custody.** Every transfer of AI chips is reported, and large clusters are registered by location. The [verification literature](https://arxiv.org/abs/2408.16074) lists chip location tracking as feasible with international agreement. The MIRI draft sets its cluster line at 16 H100-equivalents, which is too low for practical policy; a datacenter-scale threshold is more realistic to start with.
6. **Governance-ready chips.** New AI chips must support firmware attestation or [licensing](https://arxiv.org/abs/2404.18308) once the technology is mature. [Ansari (2026)](https://arxiv.org/abs/2604.04712) estimates two to four years of research for on-chip metering and [FlexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf). This is a requirement for future designs, not for today.
7. **Acceptance of training thresholds.** Buyers above the cluster threshold commit to no training runs above the international compute limit without approval, and accept verification through energy monitoring and inspections.

### What ASML cannot enforce

The training threshold itself, restrictions on algorithmic research, use of the chips already installed, and inference all need the treaty and its [international agency](/proposal).
ASML conditions do not replace those.
They make them reachable, because access to new chips becomes the incentive to accept them.

### What to keep out

Measures that have nothing to do with compute, such as copyright or liability, should not be attached to export licenses.
They weaken the public-security basis of the instrument, and they hand the US and ASML an easy argument that the licenses are being abused.

## A phased proposal

Each phase is defensible on its own, and each can be reversed.

### Phase 0: recognition and preparation

- The cabinet states in a letter to parliament that export and maintenance of EUV equipment is an instrument of **AI safety policy**, not only of China policy. The [government's own analysis](https://www.rijksoverheid.nl/documenten/kamerstukken/2024/12/09/tk-aanbieding-analyse-van-het-effect-van-ai-op-de-nationale-veiligheid) of AI's effect on national security (December 2024) provides the basis.
- A technical working group (customs, export control team, AI safety expertise, intelligence services) maps which deliveries contribute to frontier AI capacity: EUV and High-NA, DUV immersion used for HBM, field upgrades and service contracts.
- The Netherlands announces a date from which EUV licenses carry the Layer 1 conditions. This gives ASML and its customers time to adjust, as happened in 2023.

### Phase 1: conditional licenses

Licenses for export, field upgrades and maintenance of EUV systems are granted only to fabs that meet the four Layer 1 conditions.
Fabs that do not comply get no new machines, no upgrades, and eventually no maintenance.
This is exactly the mechanism the US [MATCH Act](https://nltimes.nl/2026/08/20/us-preparing-force-netherlands-ban-asml-selling-china) wants to apply to China, now applied on Dutch criteria.

### Phase 2: a capacity cap

As long as there is no treaty, the Netherlands caps the number of EUV systems per year destined for expansion of AI logic and HBM capacity.

### Phase 3: contribution to a treaty

The Netherlands offers the licensing regime as the verification and enforcement module of an international treaty, using the MIRI logic as a template:

- Chip sales to treaty parties: presumption of approval.
- Equipment transfers between parties: only by consensus, after assessing the risk of withdrawal.
- Sales to non-parties: presumption of denial.

Access to ASML becomes a positive incentive to join, just as access to civilian nuclear technology was an incentive to join the Non-Proliferation Treaty.
The Netherlands should do this together with Japan (photoresists, Tokyo Electron), Germany (Zeiss optics, Trumpf lasers), Taiwan and South Korea.
[Pax Silica](https://www.dutchnews.nl/2026/06/netherlands-joins-us-chip-pact-while-fighting-asml-export-curbs/), the chip alliance the Netherlands joined in June 2026, is an existing forum to put this on the table.

## Why now

**The US is already forcing the Netherlands to restrict ASML, on American terms.**
The MATCH Act, on track to be attached to the US defense budget, would bar ASML from selling DUV machines to China and from [servicing machines already delivered](https://nltimes.nl/2026/08/20/us-preparing-force-netherlands-ban-asml-selling-china), and gives the Netherlands 150 days to comply or face sanctions.
Trade minister Sjoerdsma [told parliament](https://www.tweedekamer.nl/kamerstukken/kamervragen/detail?id=2026Z07615&did=2026D21750) that "each country is responsible for its own legislation" and flew to Washington to say that ["the stakes for the Netherlands may be very high"](https://techcrunch.com/2026/06/24/europe-is-pushing-back-on-washingtons-chip-war/).
That sovereignty argument is precisely the argument for Dutch criteria.

**The industry is asking for an external brake.**
In June 2026 Anthropic wrote that the AI industry ["has a gas pedal, but it doesn't have a brake pedal"](https://www.anthropic.com/institute/recursive-self-improvement), and that a meaningful slowdown needs "multiple well-resourced labs at or near the frontier, in multiple countries, agreeing to stop under the same conditions" and able to verify each other.
Their proposal contains no hardware mechanism.
ASML licenses are one.

**Bill Gates wrote in August 2026** that ["if someone had a credible plan for slowing down AI advances globally, I would likely support it"](https://edition.cnn.com/2026/08/26/business/bill-gates-wants-limits-on-ai), adding that he does not think it will happen.
This is a credible plan.

**The window is closing.**
[Ansari (2026)](https://arxiv.org/abs/2604.04712) shows that hardware governance only works while manufacturing is concentrated.
China [started producing its own DUV machines](https://www.cnbc.com/2026/07/28/china-chipmaking-duv-tool-asml-explained.html) in 2026, and SMIC makes 7nm chips without EUV.
The [Europe 2031 scenario](https://europe2031.ai/) describes Washington forcing the Netherlands in 2028 and moving to fold ASML into a US-controlled holding company in 2031.
The Guardian's [Alexander Hurst](https://www.theguardian.com/commentisfree/2026/sep/01/from-bill-gates-to-bernie-sanders-most-agree-the-ai-arms-race-is-disastrous-only-europe-can-make-it-stop) calls it "use it or lose it": every EUV machine exported weakens the lever.

**The public is ready.**
Awareness of existential risk from AI in the Netherlands has [risen to 19%](https://www.existentialriskobservatory.org/papers_and_reports/Trends%20in%20Public%20Attitude%20Towards%20Existential%20Risk%20And%20Artificial%20Intelligence.pdf), and the [statement calling for a prohibition on superintelligence](https://superintelligence-statement.org/) has been signed by Nobel laureates, AI pioneers and hundreds of public figures.

## Legal basis and gaps

What exists:

- [Article 9 of Regulation 2021/821](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32021R0821): national license requirements for non-listed items on public security grounds. Other member states can adopt the same control, and the Commission can publish it EU-wide.
- Article 10 (the "catch-all"): ad hoc license requirements based on end use.
- The Dutch Strategic Goods Decree and the 2023 Regulation as the implementing framework.

What is missing, according to a [CSIS analysis](https://www.csis.org/analysis/understanding-us-allies-current-legal-authority-implement-ai-and-semiconductor-export) of allied export control powers:

| Gap                                                  | Consequence                               | Required step                                                                        |
| ---------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| No control over services and maintenance             | Phase 1 cannot reach the installed base   | National license requirement for service and software updates, as the MATCH Act does |
| No end-user list                                     | No targeted denial per fab or lab         | National list of buyers with mandatory conditions                                    |
| No extraterritorial reach                            | Flow-down conditions are contractual only | Conditions written into the license, tied to loss of service                         |
| "AI safety" as a public security ground never tested | Legal risk                                | Frame as national security, supported by the December 2024 analysis                  |

EU rules do not restrict transfers within the EU.
That is not a problem here, because no advanced AI fab is located in the EU.

## Objections

**The US will retaliate through the Foreign Direct Product Rule.**
True.
About [10% of EUV technology is American](https://www.talosnetwork.org/perspectives/boosting-the-eus-position-in-ai-through-third-places-diplomacy-9ym5d), the light source is built by Cymer in San Diego, and the US [applies a 0% de minimis threshold](https://www.ejiltalk.org/the-discomfort-of-extraterritoriality-us-semiconductor-export-controls-and-why-their-chokehold-on-dutch-photolithography-machines-matter/) to claim jurisdiction over ASML's products.
[TechPolicy.press](https://www.techpolicy.press/why-asmls-semiconductor-monopoly-doesnt-give-europe-strategic-control/) concludes that "the one country that can turn the screw on Europe's most valuable company is not the Netherlands. It is the United States."
Our answer: the US is using this power against the Netherlands already, regardless of what the Netherlands does.
A Dutch regime aimed at AI safety is not an attack on the US but an invitation to shared criteria.
The EU's [Anti-Coercion Instrument](https://iep.unibocconi.eu/why-asml-eus-most-important-bargaining-chip) exists as a shield.
And as Hurst argues, even under retaliation Europe does not fall further behind, because the whole race slows down.

**China will catch up, so the lever will become worthless.**
That is an argument for speed, not for waiting.
EUV remains the only path to the newest nodes for years to come, and SMIC's multi-patterning has low yields.

**A unilateral Dutch pause does not work.**
Correct, for a blunt export stop.
That is why this proposal is conditional, phased, and aimed at treaty accession.
The existing stock of chips and machines stays.
What slows down is the exponential growth.
The Netherlands supplies the enforcement module, not the whole solution.

**It will cost ASML billions and the Netherlands jobs.**
ASML has [44,000 employees in the Netherlands](https://www.talosnetwork.org/perspectives/boosting-the-eus-position-in-ai-through-third-places-diplomacy-9ym5d) and €16 billion in supplier spending.
Non-AI demand stays.
The [AI Policy Bulletin](https://www.aipolicybulletin.org/articles/bargaining-chips-could-the-eu-leverage-asml-to-influence-u-s-ai-policy) and Talos Network both propose a compensation fund, which belongs in this proposal.
For comparison: the MATCH Act would hit [about a fifth](https://www.dutchnews.nl/2026/06/netherlands-joins-us-chip-pact-while-fighting-asml-export-curbs/) of ASML's expected 2026 revenue, and the Dutch government treats that as unavoidable.

**Export controls always fail.**
[Tim Worstall](https://www.timworstall.com/2026/09/weird-weird-ideas/) made this argument in response to the Guardian piece.
But the EUV ban on China has held since 2019, and the [Institute for AI Policy and Strategy](https://www.iaps.ai/research/semiconductor-manufacturing-equipment-export-controls) calls it largely effective.
What fails are controls without a maintenance ban and without allies.
Both are in this proposal.

**This is a job for the EU, not for the Netherlands.**
Export control is a national competence, as the Dutch government itself insists towards Washington.
The Netherlands can start, and other member states can join under Article 9.
Waiting for EU consensus means waiting until the window is shut.

## What you can do

- If you are in the Netherlands, [write to your representative](/lobby-tips) and ask them to raise this in the MATCH Act debate: if the Netherlands introduces a maintenance license, it should carry AI safety criteria rather than country criteria alone.
- Ask for a parliamentary hearing with ASML, the AI safety field, customs, and the authors of the [compute governance report](https://arxiv.org/abs/2506.20530) and the [MIRI treaty draft](https://arxiv.org/abs/2511.10783).
- [Join PauseAI](/join) and help us build the coalition with Japan, Germany, Taiwan and South Korea.

## Open questions

- Which compute threshold, and which body grants approvals? The MIRI draft uses 10^24 FLOP (prohibited) and 10^22 FLOP (monitored); our [proposal](/proposal) favors dynamic thresholds. This needs to be aligned.
- Can "AI safety" be placed under public security without EU legal objections? An export control lawyer should assess this.
- How large is the installed EUV base per customer, and what share of service revenue sits with AI-related fabs? This determines how strong the maintenance condition is.
- Which parts of the EUV machine can Europe replace within five years? This determines vulnerability to FDPR retaliation.
- How is HBM production (SK Hynix, Samsung, Micron) included? It uses EUV too and is an equally hard chokepoint.

## Further reading

- [Toward a Global Regime for Compute Governance: Building the Pause Button](https://arxiv.org/abs/2506.20530) (Al Ramiah et al., 2025)
- [An International Agreement to Prevent the Premature Creation of Artificial Superintelligence](https://arxiv.org/abs/2511.10783) (Scher et al., MIRI, 2025)
- [Technical Requirements for Halting Dangerous AI Activities](https://arxiv.org/abs/2507.09801) (Barnett et al., 2025)
- [Hardware-Level Governance of AI Compute: A Feasibility Taxonomy](https://arxiv.org/abs/2604.04712) (Ansari, 2026)
- [Verification Methods for International AI Agreements](https://arxiv.org/abs/2408.16074)
- [Understanding US Allies' Current Legal Authority to Implement AI and Semiconductor Export Controls](https://www.csis.org/analysis/understanding-us-allies-current-legal-authority-implement-ai-and-semiconductor-export) (CSIS, 2025)
- [Semiconductor Manufacturing Equipment Export Controls](https://www.iaps.ai/research/semiconductor-manufacturing-equipment-export-controls) (IAPS)
- [Bargaining Chips: Could the EU Leverage ASML to Influence US AI Policy?](https://www.aipolicybulletin.org/articles/bargaining-chips-could-the-eu-leverage-asml-to-influence-u-s-ai-policy) (AI Policy Bulletin)
- [Etching Out Influence: Exploring ASML as a Strategic Asset](https://www.talosnetwork.org/perspectives/boosting-the-eus-position-in-ai-through-third-places-diplomacy-9ym5d) (Talos Network)
- [Why ASML's Semiconductor Monopoly Doesn't Give Europe Strategic Control](https://www.techpolicy.press/why-asmls-semiconductor-monopoly-doesnt-give-europe-strategic-control/) (TechPolicy.press)
- [Europe 2031](https://europe2031.ai/)
- [From Bill Gates to Bernie Sanders, most agree the AI arms race is disastrous. Only Europe can make it stop](https://www.theguardian.com/commentisfree/2026/sep/01/from-bill-gates-to-bernie-sanders-most-agree-the-ai-arms-race-is-disastrous-only-europe-can-make-it-stop) (The Guardian, September 2026)
