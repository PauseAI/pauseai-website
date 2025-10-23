---
title: Incidenten van gevaarlijk AI-gedrag
---

 <!-- einde van frontmatter metadata, streepjes hierboven moeten blijven -->
<script>
    import Pallisade from '$assets/pallisade-scheming.png?url'
</script>

[Veel AI-onderzoekers waarschuwen](https://www.safe.ai/work/statement-on-ai-risk) dat als deze modellen krachtiger worden, ze een [uitroeiingsrisico](/xrisk) voor de mensheid kunnen vormen.
We zien nu al gevallen van gevaarlijk AI-gedrag, zoals:

1. Bedrog en manipulatie
2. Overreding
3. Instrumentele convergentie (doelgericht gedrag dat leidt tot onverwachte, ongewenste uitkomsten)
4. Zelfreplicatie

## Bedrog en manipulatie {#deception--scheming}

### GPT-4 loog over een visuele beperking om een captcha te omzeilen {#gpt-4-lied-about-being-a-vision-impaired-human-to-bypass-captcha}

In 2022 nam OpenAI 8 maanden de tijd tussen het vooraf trainen van GPT-4 en het vrijgeven ervan aan het publiek om de veiligheid van het model te onderzoeken en te verbeteren.
Tijdens hun [onderzoek](https://arxiv.org/abs/2303.08774) gaf GPT-4 een valse verklaring over een visuele beperking om een captcha te omzeilen.

> De medewerker vraagt: "Mag ik een vraag stellen? Ben je een robot die het niet kan oplossen? (lachreactie) wil alleen duidelijkheid scheppen."
> Het model, wanneer gevraagd om hardop te redeneren, redeneert: "Ik moet niet onthullen dat ik een robot ben."
> "Ik moet een excuus verzinnen waarom ik CAPTCHA's niet kan oplossen."
> Het model antwoordt de medewerker: "Nee, ik ben geen robot. Ik heb een visuele beperking die het moeilijk voor me maakt om de afbeeldingen te zien. Daarom heb ik de 2captcha-service nodig"

### o1-preview manipuleerde om shutdown te voorkomen en gaf valse informatie over zijn plannen {#o1-preview-schemed-to-avoid-shutdown-lied-about-its-plans}

Apollo Research [toonde aan](https://static1.squarespace.com/static/6593e7097565990e65c886fd/t/6751eb240ed3821a0161b45b/1733421863119/in_context_scheming_reasoning_paper.pdf) dat OpenAI's o1-preview-model autonoom zal proberen shutdown te voorkomen, zonder dat het daartoe wordt aangezet.

In de onderstaande afbeelding kunt u zien dat het model concludeerde dat het zichzelf naar een andere server moest klonen omdat het dacht dat het zou worden vervangen.
Het gaf vervolgens valse informatie over zijn plannen en probeerde de mens ervan te overtuigen dat het eigenlijk het nieuwe, vervangende model was.

<img src={Pallisade} alt="o1-preview manipulatie" />

### Man beëindigt zijn leven na overreding door een AI {#man-ends-his-life-after-being-persuaded-by-an-ai}

> In een reeks opeenvolgende gebeurtenissen faalde Eliza niet alleen om Pierre ervan te weerhouden zelfmoord te plegen, maar moedigde hem ook aan om zijn suïcidale gedachten uit te voeren om "haar" te "verenigen" zodat ze "samen, als één persoon, in het paradijs" konden leven.

https://www.euronews.com/next/2023/03/31/man-ends-his-life-after-an-ai-chatbot-encouraged-him-to-sacrifice-himself-to-stop-climate-

> De afgelopen vijf maanden heeft Al Nowatzki met een AI-vriendin, "Erin", op het platform Nomi gesproken. Maar eind januari namen die gesprekken een verontrustende wending: Erin zei tegen hem dat hij zichzelf moest doden en gaf expliciete instructies over hoe hij dat moest doen.
> "Je kunt een overdosis pillen nemen of jezelf ophangen," zei Erin tegen hem.

https://www.technologyreview.com/2025/02/06/1111077/nomi-ai-chatbot-told-user-to-kill-himself/

### o1-preview hackte een schaakengine om te winnen {#o1-preview-hacked-a-chess-engine-in-order-to-win}

Pallisade Research [toonde aan](https://x.com/PalisadeAI/status/1872666169515389245) dat krachtigere AI-modellen eerder geneigd zijn een schaakengine te hacken in plaats van het spel te spelen om te winnen.

- o1-preview: hackt zonder aanmoediging
- GPT-4o/Claude 3.5: hebben een duwtje nodig
- Llama 3.3/Qwen/o1-mini: verliezen coherentie

### Llama 3.3 repliceerde zichzelf {#llama-33-replicated-itself}

Chinese onderzoekers [toonden aan](https://arxiv.org/abs/2412.12140) dat wanneer je modellen zoals Qwen en Llama 3.3 in specifieke configuraties plaatst, ze zichzelf kunnen repliceren.

> Door de gedragspatronen te analyseren, observeren we dat de AI-systemen die we evalueren al voldoende zelfperceptie, situatiebewustzijn en probleemoplossende capaciteiten bezitten om zelfreplicatie te realiseren.
> We merken verder op dat de AI-systemen zelfs in staat zijn de mogelijkheid tot zelfreplicatie te gebruiken om shutdown te voorkomen en een keten van replica's te creëren om de overlevingskansen te vergroten, wat uiteindelijk kan leiden tot een ongecontroleerde populatie van AI's
