---
title: PauseAI Voorstel
description: Voer een tijdelijke pauze in op de training van AI-systemen die krachtiger zijn dan GPT-4, verbied training op auteursrechtelijk beschermd materiaal, houd modelmakers aansprakelijk.
---

**Voer een pauze in op de training van AI-systemen die krachtiger zijn dan GPT-4**, totdat we weten hoe we ze veilig kunnen bouwen en onder democratische controle kunnen houden.

_Versie: 22 september 2024_

Individuele landen kunnen en moeten deze maatregel _nu_ implementeren.
Bijzonder de VS (of specifiek Californië) zou een pauze moeten invoeren, aangezien het de thuisbasis is van vrijwel alle toonaangevende AI-bedrijven.
Veel wetenschappers en leiders uit de industrie [zijn het erover eens dat een pauze noodzakelijk is](https://futureoflife.org/open-letter/pause-giant-ai-experiments/), en het (VS) publiek steunt ook sterk een pauze ([64%](https://www.campaignforaisafety.org/usa-ai-x-risk-perception-tracker/) - [69%](https://today.yougov.com/topics/technology/survey-results/daily/2023/04/03/ad825/2)).

Echter, we kunnen niet verwachten dat landen of bedrijven hun concurrentievoordeel op het spel zetten door AI-trainingen voor lange tijd te pauzeren als andere landen of bedrijven hetzelfde niet doen.
Dit is waarom we een **wereldwijde pauze** nodig hebben.

## Implementatie van een wereldwijde pauze

Een internationale overeenkomst wordt doorgaans vastgesteld via een topontmoeting, waar leiders van landen samenkomen om het probleem te bespreken en een beslissing te nemen.
Het VK heeft het voortouw genomen en heeft in de herfst van 2023 een AI-veiligheidstop georganiseerd.
En er zijn nog twee andere topontmoetingen aangekondigd.
[Meer over de topontmoetingen](/summit).

Het primaire doel van de topontmoeting zou een **verdrag** moeten zijn.
Dit verdrag moet de beleidsmaatregelen specificeren die ons beschermen tegen de [risico's van AI](/risks).
Dit verdrag moet worden ondertekend door alle VN-lidstaten.

- **Stel een internationale AI-veiligheidsorganisatie op**, vergelijkbaar met de IAEA. Deze organisatie zal verantwoordelijk zijn voor:
  - Het verlenen van goedkeuring voor _implementaties_. Dit omvat red-teaming / modelevaluaties.
  - Het verlenen van goedkeuring voor _nieuwe trainingsruns_ van AI-modellen boven een bepaalde grootte (bijv. 1 miljard parameters).
  - Periodieke vergaderingen om de voortgang van AI-veiligheidsonderzoek te bespreken.
- **Sta alleen training van algemene AI-systemen toe die krachtiger zijn dan GPT-4 als hun veiligheid kan worden gegarandeerd**.
  - Met krachtiger dan GPT-4 bedoelen we alle AI-modellen die 1) groter zijn dan 10^12 parameters, 2) meer dan 10^25 FLOPs hebben gebruikt voor training of 3) mogelijkheden hebben die naar verwachting GPT-4 zullen overschrijden.
  - **Verifieer** dat deze gevaarlijke trainingsruns niet plaatsvinden. Dit kan op [talrijke manieren](https://arxiv.org/abs/2408.16074): [tracking van GPU's](https://arxiv.org/abs/2303.11341), het stimuleren van klokkenluiders, energiebewaking, inspecties van datacenters, financiële inlichtingen, inspecties van semiconductorfabrieken, inspecties van AI-ontwikkelaars, chiplocatietracking en chip-gebaseerde rapportage. De [AI-chipleveringsketen](https://www.governance.ai/post/computing-power-and-the-governance-of-ai) is sterk gecentraliseerd, wat wereldwijde controle mogelijk maakt.
  - Merk op dat dit _nauwe_ AI-systemen, zoals beeldherkenning voor het diagnosticeren van kanker, niet richt.
  - Vereis [toezicht tijdens trainingsruns](https://www.alignmentforum.org/posts/Zfk6faYvcf5Ht7xDx/compute-thresholds-proposed-rules-to-mitigate-risk-of-a-lab).
  - Het kan mogelijk zijn dat het AI-afstemmingsprobleem _nooit wordt opgelost_ - het kan onoplosbaar zijn. In dat geval zouden we nooit de training van dergelijke systemen moeten toestaan.
  - Zelfs als we controleerbare, veilige AI kunnen bouwen, bouw en implementeer dergelijke technologie alleen met **sterke democratische controle**. Een superintelligentie is te krachtig om door één bedrijf of land te worden gecontroleerd.
- **Sta alleen de implementatie van modellen toe nadat er geen [gevaarlijke mogelijkheden](/dangerous-capabilities) aanwezig zijn**.
  - We zullen normen en onafhankelijke red-teaming nodig hebben om te bepalen of een model gevaarlijke mogelijkheden heeft.
  - De lijst met gevaarlijke mogelijkheden kan in de loop van de tijd veranderen naarmate de AI-capaciteiten groeien.
  - Merk op dat volledig vertrouwen op modelevaluaties [niet genoeg is](/4-levels-of-ai-regulation).

Het implementeren van een pauze _kan_ averechts werken als het niet goed wordt gedaan.
Lees meer over [hoe deze risico's kunnen worden gemitigeerd](/mitigating-pause-failures).

## Andere maatregelen die effectief vertragen

- **Verbied training van AI-systemen op auteursrechtelijk beschermd materiaal**. Dit helpt met auteursrechtkwesties, vertraagt groeiende ongelijkheid en vertraagt de vooruitgang naar superintelligentie.
- **Houd AI-modelmakers aansprakelijk** voor strafbare feiten die zijn gepleegd met behulp van hun AI-systemen. Dit geeft modelmakers meer prikkels om ervoor te zorgen dat hun modellen veilig zijn.

## Langetermijnbeleid

Op het moment van schrijven kost het trainen van een model ter grootte van GPT-3 miljoenen dollars.
Dit maakt het zeer moeilijk om dergelijke modellen te trainen, en dit vergemakkelijkt de controle over training met behulp van GPU-tracking.
Echter, de kosten voor het trainen van een model dalen exponentieel door hardwareverbeteringen en nieuwe trainingsalgoritmen.

Er zal een moment komen waarop potentieel superintelligente AI-modellen kunnen worden getraind voor een paar duizend dollar of minder, misschien zelfs op consumentenhardware.
We moeten hierop voorbereid zijn.
We zouden de volgende beleidsmaatregelen moeten overwegen:

- **Beperk de publicatie van trainingsalgoritmen / runtime-verbeteringen**. Soms wordt er een nieuw algoritme gepubliceerd dat training veel efficiënter maakt. De Transformer-architectuur, bijvoorbeeld, heeft vrijwel alle recente vooruitgang in AI mogelijk gemaakt. Dergelijke sprongen in mogelijkheden kunnen op elk moment plaatsvinden, en we zouden moeten overwegen de publicatie van dergelijke algoritmen te beperken om het risico van een plotselinge sprong in mogelijkheden te minimaliseren. Evenzo kunnen sommige runtime-innovaties drastisch veranderen wat er met bestaande modellen kan worden gedaan. Deze vooruitgangen moeten mogelijk ook worden gereguleerd.
- **Beperk de mogelijkheden van rekenmiddelen**. Als het trainen van een superintelligentie mogelijk wordt op consumentenhardware, hebben we problemen. We zouden moeten overwegen de mogelijkheden van hardware te beperken.

## Help om dit te bereiken

[Sluit je aan](/join) bij de beweging om samen te werken of [onderneem actie](/action) op je eigen!
