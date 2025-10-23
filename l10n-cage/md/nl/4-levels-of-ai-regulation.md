---
title: 4 niveaus van AI-veiligheidsregulering
description: Een kader voor het denken over hoe de risico's van krachtige AI-systemen kunnen worden gemitigeerd
image: /4levels.png
---

Naarmate de mogelijkheden van AI toenemen, nemen ook de risico's die deze systemen voor de mensheid met zich meebrengen toe.
Veel wetenschappers hebben al gewaarschuwd voor het [risico van menselijke uitsterving](/xrisk).

In dit artikel kijken we naar ons kader van 4 niveaus voor het denken over hoe AI-veiligheid kan worden gereguleerd.

## AI-pipeline als kader voor veiligheidsgovernance {#ai-pipeline-as-a-framework-for-safety-governance}

De AI-ontwikkelingspipeline bestaat uit verschillende stappen, die elk op verschillende manieren kunnen worden gereguleerd.
Deze pipeline bestaat uit:

- **Hardware en algoritmes**, die worden gebruikt voor het trainen van AI-modellen
- **Trainingsruns**, waarbij de hardware en algoritmes worden gebruikt om een model te creëren
- **Implementatie**, waarbij het getrainde model wordt gedeeld met het publiek
- **Gebruik**, waarbij het geïmplementeerde model wordt gebruikt door individuen en bedrijven

Hoe later we in de pipeline reguleren, hoe hoger de risico's zijn die we lopen.
Als we een hoog niveau van veiligheid willen, moeten we eerder in de pipeline reguleren.
Daarom gaan we, wanneer we de 4 niveaus van AI-regulering beklimmen, terug in de AI-ontwikkelingspipeline.

![4 niveaus van AI-veiligheidsregulering](/4levels.png)

## Niveau 1: Reguleren van gebruik {#level-1-regulate-usage}

Voorbeelden:

- **Verbod op autonome agent-runtime** (zoals AutoGPT)
- **Verbod op gevaarlijke instructies**

Deze maatregelen zijn bedoeld om te voorkomen dat gebruikers gevaarlijke of schadelijke acties uitvoeren met AI-modellen.
Op dit niveau ligt de verantwoordelijkheid bij de gebruikers van de modellen, niet bij de ontwikkelaars.
We zijn afhankelijk van alle (mogelijk miljoenen) gebruikers om zich aan de regels te houden.
Dit biedt slechts een zeer laag niveau van bescherming tegen AI-gevaren.

## Niveau 2: Reguleren van implementatie {#level-2-regulate-deployment}

Voorbeelden:

- **Red-teaming-eisen**. Dit betekent dat voordat een AI-model wordt geïmplementeerd, het wordt getest door een red team om te zien of het kan worden gehackt (gejailbreakt) of misbruikt.
- **Verbod op implementatie en open-sourcing** van modellen met [gevaarlijke mogelijkheden](/dangerous-capabilities).

Wanneer we implementaties reguleren, voorkomen we dat gevaarlijke modellen beschikbaar worden gesteld.
Dit betekent dat de verantwoordelijkheid bij de ontwikkelaars van de modellen ligt.
Dit is een veiligere situatie dan niveau 1, omdat we nu afhankelijk zijn van een veel kleinere groep mensen om verantwoordelijk te handelen.

Echter, we laten nog steeds gevaarlijke trainingsruns toe, dus ongelukken in AI-laboratoria (inclusief het lekken van gevaarlijke AI-modellen of het creëren van rogue AI) kunnen nog steeds gebeuren.

## Niveau 3: Reguleren van trainingsruns {#level-3-regulate-training-runs}

Voorbeelden:

- **Vereiste van veiligheidsbewijs** voordat toestemming wordt verleend om een bepaald model te trainen. Dit kan een formeel bewijs van alignment omvatten. [Dit bericht beschrijft enkele van de huidige veiligheidsproblemen](https://www.lesswrong.com/posts/mnoc3cKY3gXMrTybs/a-list-of-core-ai-safety-problems-and-how-i-hope-to-solve).
- Het instellen van een **schaalplafond voor het trainen van nieuwe modellen** (bijv. een maximum aantal flops gebruikt). Dit kan ook het proces van fine-tuning omvatten.
- **Vereiste van een licentie** om AI-modellen te trainen (boven een bepaalde grootte / met bepaalde mogelijkheden).
- **Verbod op training op gevaarlijke soorten gegevens**. Sommige soorten trainingsgegevens kunnen leiden tot [gevaarlijke mogelijkheden](/dangerous-capabilities), zoals hacking of het creëren van biowapens. We kunnen training op gegevens die deze kennis bevatten verbieden.
- **Verbod op training op auteursrechtelijk beschermde gegevens**. Dit richt zich niet direct op onveilige gegevens, maar het beperkt wel de hoeveelheid gegevens die kan worden gebruikt, wat ons tijd geeft om uit te zoeken hoe we veilige AI-modellen kunnen bouwen.

Wanneer we trainingsruns reguleren, voorkomen we dat gevaarlijke modellen in de eerste plaats worden gecreëerd.
Dit zal ongelukken in AI-laboratoria die zich aan de regels houden voorkomen.

Echter, we laten nog steeds de distributie van hardware en algoritmes toe die kunnen worden gebruikt voor het trainen van gevaarlijke modellen, dus we zijn nog steeds afhankelijk van de ontwikkelaars van deze modellen om verantwoordelijk te handelen.

## Niveau 4: Reguleren van hardware en algoritmes {#level-4-regulate-hardware--algorithms}

Voorbeelden:

- **Beperking van de distributie van trainingshardware**. Gespecialiseerde hardware voor het trainen van AI-modellen wordt snel het belangrijkste product van chipfabrikanten. De toeleveringsketen voor deze hardware is zeer gecentraliseerd en de hardware is zeer duur. Dit betekent dat het [relatief eenvoudig is om de distributie van deze hardware te reguleren](https://arxiv.org/abs/2303.11341).
- **Verbod op de publicatie van nieuwe trainingsarchitecturen**. Nieuwe AI-trainingsarchitecturen kunnen leiden tot dramatische toenames in mogelijkheden. Het Transformer-model, bijvoorbeeld, heeft vrijwel alle recente vooruitgang in AI mogelijk gemaakt. We kunnen de publicatie van dergelijke architecturen beperken om plotselinge mogelijkheidssprongen te voorkomen.

Wanneer we ook hardware en algoritmes reguleren, maken we het niet alleen illegaal, maar ook zeer moeilijk om gevaarlijke modellen te trainen.
Dit biedt ons de beste bescherming tegen de risico's van AI.

## Beperkingen {#limitations-1}

Houd er rekening mee dat dit kader niet perfect is en niet alle mogelijke soorten AI-regulering netjes in één van de genoemde niveaus passen.
Bijvoorbeeld, juridische aansprakelijkheid voor modelontwikkelaars kan worden geclassificeerd als een niveau 1 "gebruik"-type regulering, omdat het wordt afgedwongen na implementatie, maar het kan ook worden geclassificeerd als een niveau 2 of 3 type regulering, omdat het ontwikkelaars kan helpen heroverwegen of een bepaald model moet worden geïmplementeerd of getraind in de eerste plaats.

## Conclusies {#conclusions}

In dit artikel hebben we ons kader van 4 niveaus bekeken voor het denken over hoe AI-veiligheid kan worden gereguleerd.
Met behulp van dit model kunnen we gemakkelijker redeneren over de effectiviteit van AI-regulering op verschillende stappen in de AI-ontwikkelingspipeline.
We kunnen ook zien dat de eerste twee niveaus niet veel bescherming bieden tegen de (existentiële) risico's van AI.
Het voorkomen van gevaarlijke trainingsruns en het reguleren van hardware en algoritmes zijn veel betrouwbaardere manieren om veiligheid te garanderen.
