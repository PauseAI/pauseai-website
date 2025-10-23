---
title: PauseAI-voorstel
description: Implementeer een tijdelijke pauze in de training van de krachtigste algemene AI-systemen.
---

**Implementeer een tijdelijke pauze in de training van de krachtigste algemene AI-systemen**, totdat we weten hoe we ze veilig kunnen bouwen en onder democratische controle kunnen houden.

_Versie: 4 februari 2025_

Individuele landen kunnen en moeten deze maatregel _nu_ implementeren.
Vooral de VS (of Californië, specifiek) zou een pauze moeten implementeren, aangezien het de thuisbasis is van vrijwel alle toonaangevende AI-bedrijven.
Veel wetenschappers en industrieleiders [zijn het erover eens dat een pauze noodzakelijk is](https://futureoflife.org/open-letter/pause-giant-ai-experiments/), en het (Amerikaanse) publiek steunt een pauze ook sterk ([64%](https://www.campaignforaisafety.org/usa-ai-x-risk-perception-tracker/) - [69%](https://today.yougov.com/topics/technology/survey-results/daily/2023/04/03/ad825/2)).

We kunnen echter niet verwachten dat landen of bedrijven hun concurrentievoordeel op het spel zetten door AI-trainingen voor een lange tijd te pauzeren als andere landen of bedrijven dat niet doen.
Daarom hebben we een **wereldwijde pauze** nodig.

Laten we eens kijken wat nodig is om daar te komen.

## Op weg naar een verdrag {#getting-to-a-treaty-1}

Een internationale overeenkomst wordt meestal tot stand gebracht via een top, waar leiders van landen bijeenkomen om de kwestie te bespreken en een beslissing te nemen.
We hebben al [drie AI-veiligheidstoppen gehad](/summit).

Het primaire doel van deze toppen zou een **verdrag** moeten zijn.
Maar tot nu toe zijn de toppen niet effectief geweest in het produceren van iets juridisch bindends.
En verdragsonderhandelingen zijn vaak langzaam en vatbaar voor vetoes.
We [hebben misschien niet de tijd](/urgency) om te wachten op traditionele verdragsonderhandelingen.

Dus hebben we een nieuw **verdragsonderhandelingsproces** nodig:

- De betrokkenheid van zowel de **VS als China** is cruciaal.
- Het moet **ongevoelig zijn voor vetoes** door enig land.
- Het moet **snel** zijn. Normale verdragsonderhandelingen duren jaren, en we [hebben misschien niet die tijd](/urgency).
- De omvang van dit verdragsonderhandelingsproces is ongekend, en het heeft instemming nodig van alle landen.

Het verdrag zelf zou de volgende **maatregelen** moeten bevatten:

### Verdragsmaatregelen {#treaty-measures-1}

- **Stel een internationale AI-veiligheidsagentschap op**, vergelijkbaar met de IAEA. Dit agentschap zal verantwoordelijk zijn voor:
  - Het verlenen van goedkeuring voor _implementaties_. Dit zal rode teaming/model-evaluaties omvatten.
  - Het verlenen van goedkeuring voor _nieuwe trainingen_ van AI-modellen boven een bepaalde omvang (bijv. 1 miljard parameters).
  - Regelmatige bijeenkomsten om de voortgang van AI-veiligheidsonderzoek te bespreken.

- **Sta alleen de training van algemene AI-systemen toe als hun veiligheid kan worden gegarandeerd**.
  - Bij algemene AI-modellen bedoelen we modellen die ofwel 1) groter zijn dan 10^12 parameters, 2) meer dan 10^25 FLOPs gebruiken voor training of 3) capaciteiten hebben die naar verwachting een score van 86% op de MMLU-benchmark zullen overschrijden. Houd er rekening mee dat dit niet gericht is op _smalle_ AI-systemen, zoals beeldherkenning die wordt gebruikt voor de diagnose van kanker.
  - Het is mogelijk dat het AI-aligneringsprobleem _nooit wordt opgelost_ - het kan onoplosbaar zijn. In dat geval zouden we nooit de training van dergelijke systemen moeten toestaan.
  - **Verifieer** dat deze gevaarlijke trainingen niet plaatsvinden. Dit kan op [talrijke manieren](https://arxiv.org/abs/2408.16074) worden gedaan: [het volgen van GPU's](https://arxiv.org/abs/2303.11341), het stimuleren van klokkenluiders, energiemonitoring, datacenterinspecties, financiële inlichtingen, inspecties van halfgeleiderfabrieken, inspecties van AI-ontwikkelaars, chiplocatievolging en chipgebaseerde rapportage. De [AI-chip-toeleveringsketen](https://www.governance.ai/post/computing-power-and-the-governance-of-ai) is sterk gecentraliseerd, wat wereldwijde toezicht mogelijk maakt.
  - Vereis [toezicht tijdens trainingen](https://www.alignmentforum.org/posts/Zfk6faYvcf5Ht7xDx/compute-thresholds-proposed-rules-to-mitigate-risk-of-a-lab).
  - Zelfs als we veilige, beheersbare AI kunnen bouwen, bouw en implementeer dan alleen dergelijke technologie met **sterke democratische controle**. Een superintelligentie is te krachtig om door één bedrijf of land te worden gecontroleerd.

- **Sta alleen de implementatie van modellen toe nadat er geen [gevaarlijke capaciteiten](/dangerous-capabilities) aanwezig zijn**. (Pre-implementatie-evaluatie)
  - We zullen normen en onafhankelijke rode teaming nodig hebben om te bepalen of een model gevaarlijke capaciteiten heeft.
  - De lijst van gevaarlijke capaciteiten kan in de loop van de tijd veranderen naarmate AI-capaciteiten groeien.
  - Houd er rekening mee dat het volledig vertrouwen op model-evaluaties [niet genoeg is](/4-levels-of-ai-regulation).

Het implementeren van een pauze _kan_ averechts werken als het niet goed wordt gedaan.
Lees meer over [hoe deze risico's kunnen worden gemitigeerd](/mitigating-pause-failures).

Voor meer informatie over hoe de AI-chip-toeleveringsketen kan worden gebruikt voor wereldwijd toezicht, lees [Building the Pause Button](/building-the-pause-button).

## Andere maatregelen die effectief vertragen {#other-measures-that-effectively-slow-down-1}

- **Verbied de training van AI-systemen op auteursrechtelijk beschermde materialen**. Dit helpt bij auteursrechtskwesties, vertraagt de groeiende ongelijkheid en vertraagt de vooruitgang naar superintelligentie.
- **Houd AI-modelontwikkelaars aansprakelijk** voor criminele handelingen die worden gepleegd met behulp van hun AI-systemen. Dit geeft modelontwikkelaars meer prikkels om ervoor te zorgen dat hun modellen veilig zijn.

## Langdurig beleid {#long-term-policy-1}

Ten tijde van het schrijven van dit artikel kost het trainen van een GPT-3-groot model miljoenen dollars.
Dit maakt het erg moeilijk om dergelijke modellen te trainen, en dit maakt het gemakkelijker om de controle over de training te handhaven met behulp van GPU-volging.
De kosten van het trainen van een model nemen echter exponentieel af als gevolg van verbeteringen in de hardware en nieuwe trainingsalgoritmen.

Er zal een moment komen waarop potentieel superintelligente AI-modellen kunnen worden getraind voor een paar duizend dollar of minder, misschien zelfs op consumentenhardware.
We moeten hierop voorbereid zijn.
We moeten de volgende beleidsmaatregelen overwegen:

- **Beperk de publicatie van trainingsalgoritmen / runtime-verbeteringen**. Soms wordt een nieuw algoritme gepubliceerd dat de training veel efficiënter maakt. De Transformer-architectuur, bijvoorbeeld, heeft vrijwel alle recente vooruitgang in AI mogelijk gemaakt. Dit soort capaciteitsverhogingen kunnen op elk moment plaatsvinden, en we moeten overwegen om de publicatie van dergelijke algoritmen te beperken om het risico van een plotselinge capaciteitsverhoging te minimaliseren. Er zijn ook innovaties die [gedecentraliseerde trainingen](https://www.primeintellect.ai/blog/opendiloco) mogelijk maken. Evenzo kunnen sommige runtime-innovaties drastisch veranderen wat kan worden gedaan met bestaande modellen. Het verbieden van de publicatie van dergelijke algoritmen kan worden geïmplementeerd met behulp van soortgelijke middelen als hoe we andere vormen van informatie verbieden, zoals illegale pornografische media.
- **Beperk de capaciteitsverbeteringen van rekenbronnen**. Als het trainen van een superintelligentie mogelijk wordt op consumentenhardware, zijn we in de problemen. We moeten overwegen om de capaciteitsverbeteringen van hardware te beperken (bijv. door beperkingen op lithografie, chipontwerp en nieuwe rekenparadigma's zoals fotonische chips en kwantumcomputing).

## Help ons dit te bereiken {#help-us-achieve-this-1}

[Word lid](/join) van de beweging om samen te werken of [neem actie](/action) op eigen initiatief!
