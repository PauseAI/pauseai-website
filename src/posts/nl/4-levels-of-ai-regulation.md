---
title: 4 Niveaus van AI veiligheidsregulering
description: Een kader om na te denken over hoe de risico's van krachtige AI-systemen te mitigeren
image: /4levels.png
---

Naarmate de mogelijkheden van AI toenemen, nemen ook de [risico's](/risks) die deze systemen voor de mensheid met zich meebrengen toe.
Veel wetenschappers hebben al gewaarschuwd voor het [risico van menselijke uitsterving](/xrisk).

In dit artikel bekijken we ons 4-niveaus kader om na te denken over hoe AI-veiligheid gereguleerd kan worden.

## AI-pijplijn als kader voor veiligheidsbestuur

De AI-creatiepijplijn bestaat uit verschillende stappen, die elk op verschillende manieren gereguleerd kunnen worden.
Deze pijplijn bestaat uit:

- **Hardware & algoritmen**, die worden gebruikt voor het trainen van AI-modellen
- **Trainingsruns**, waarbij de hardware en algoritmen worden gebruikt om een model te creëren
- **Implementatie**, waarbij het getrainde model met het publiek wordt gedeeld
- **Gebruik**, waarbij het geïmplementeerde model wordt gebruikt door individuen en bedrijven

Hoe verder we in de pijplijn reguleren, hoe groter de risico's die we onder ogen zien.
Als we een hoog niveau van veiligheid willen, moeten we eerder in de pijplijn reguleren.
Daarom, wanneer we de 4 niveaus van AI-regulering beklimmen, lopen we de AI-creatiepijplijn terug.

![4 Niveaus van AI veiligheidsregulering](/4levels.png)

## Niveau 1: Reguleer gebruik

Voorbeelden:

- **Verbied autonome agent-runtime** (zoals AutoGPT)
- **Verbied gevaarlijke instructies**

Deze maatregelen zijn bedoeld om te voorkomen dat gebruikers gevaarlijke of schadelijke acties ondernemen met AI-modellen.
Op dit niveau ligt de verantwoordelijkheid bij de gebruikers van de modellen, niet bij de makers.
We zijn afhankelijk van alle (potentieel miljoenen) gebruikers om zich aan de regels te houden.
Dit biedt slechts een zeer laag niveau van bescherming tegen AI-gevaren.

## Niveau 2: Reguleer implementatie

Voorbeelden:

- **Red-teaming vereisten**. Dit betekent dat voordat een AI-model wordt geïmplementeerd, het wordt getest door een red team om te zien of het kan worden gehackt (jailbroken) of misbruikt.
- **Verbied implementatie en open-sourcing** van modellen met [gevaarlijke mogelijkheden](/dangerous-capabilities).

Bij het reguleren van implementaties voorkomen we dat gevaarlijke modellen beschikbaar komen.
Dit betekent dat de verantwoordelijkheid bij de makers van de modellen ligt.
Dit is een veiligere situatie dan niveau 1, omdat we nu afhankelijk zijn van een veel kleinere groep mensen om verantwoordelijk te handelen.

Echter, we staan nog steeds gevaarlijke trainingsruns toe, zodat ongelukken in AI-laboratoria (inclusief de lekken van gevaarlijke AI-modellen of het creëren van rogue AI) nog steeds kunnen gebeuren.

## Niveau 3: Reguleer trainingsruns

Voorbeelden:

- **Vereis bewijs van veiligheid** voordat toestemming wordt gegeven om een bepaald model te trainen. Dit kan formeel bewijs van afstemming omvatten. [Deze post beschrijft enkele van de huidige veiligheidsproblemen](https://www.lesswrong.com/posts/mnoc3cKY3gXMrTybs/a-list-of-core-ai-safety-problems-and-how-i-hope-to-solve).
- Stel een **maximum voor het trainen van nieuwe modellen** in (bijv. een maximaal aantal flops dat wordt gebruikt). Dit kan ook het proces van fine-tuning omvatten.
- **Vereis een licentie** om AI-modellen te trainen (boven een bepaalde grootte / met bepaalde mogelijkheden).
- **Verbied training op gevaarlijke soorten gegevens**. Sommige soorten trainingsgegevens kunnen leiden tot [gevaarlijke mogelijkheden](/dangerous-capabilities), zoals hacken of het creëren van biowapens. We zouden training op gegevens die dit soort kennis bevatten kunnen verbieden.
- **Verbied training op auteursrechtelijk beschermd materiaal**. Dit richt zich niet direct op onveilige gegevens, maar het beperkt wel de hoeveelheid gegevens die kan worden gebruikt, wat betekent dat het ons tijd geeft om uit te zoeken hoe we veilige AI-modellen kunnen bouwen.

Wanneer we trainingsruns reguleren, voorkomen we dat gevaarlijke modellen in de eerste plaats worden gemaakt.
Dit zal ongelukken in AI-laboratoria die zich aan de regels houden voorkomen.

Echter, we staan nog steeds de distributie van hardware en algoritmen toe die kunnen worden gebruikt voor het trainen van gevaarlijke modellen, dus we blijven afhankelijk van de makers van deze modellen om verantwoordelijk te handelen.

## Niveau 4: Reguleer hardware & algoritmen

Voorbeelden:

- **Beperk distributie van trainingshardware**. Gespecialiseerde hardware voor het trainen van AI-modellen wordt snel het belangrijkste product van chipfabrikanten. De toeleveringsketen voor deze hardware is zeer gecentraliseerd, en de hardware is zeer duur. Dit betekent dat het [relatief eenvoudig te reguleren is](https://arxiv.org/abs/2303.11341) de distributie van deze hardware.
- **Verbied de publicatie van nieuwe trainingsarchitecturen**. Nieuwe AI-trainingsarchitecturen kunnen leiden tot dramatische stijgingen in mogelijkheden. Het Transformer-model, bijvoorbeeld, heeft vrijwel alle recente vooruitgang in AI mogelijk gemaakt. We zouden de publicatie van dergelijke architecturen kunnen beperken om plotselinge sprongen in mogelijkheden te voorkomen.

Wanneer we ook hardware en algoritmen reguleren, maken we het niet alleen illegaal, maar ook zeer moeilijk om gevaarlijke modellen te trainen.
Dit geeft ons de beste bescherming tegen de risico's van AI.

## Beperkingen

Let op dat dit kader niet perfect is, en niet alle mogelijke soorten AI-regulering netjes passen in een van de genoemde niveaus.
Bijvoorbeeld, juridische aansprakelijkheid voor modelmakers kan worden geclassificeerd als een niveau 1 "gebruik" type regulering, aangezien het wordt gehandhaafd na implementatie, maar het kan ook worden geclassificeerd als een niveau 2 of 3 type regulering, aangezien het makers kan helpen om te heroverwegen of een bepaald model in de eerste plaats moet worden geïmplementeerd of getraind.

## Conclusies

In dit artikel hebben we ons 4-niveaus kader bekeken om na te denken over hoe AI-veiligheid gereguleerd kan worden.
Met behulp van dit model kunnen we gemakkelijker redeneren over de effectiviteit van AI-regulering op verschillende stappen in de AI-creatiepijplijn.
We kunnen ook zien dat de eerste twee niveaus niet veel bescherming bieden tegen de (existentiële) risico's van AI.
Het voorkomen van gevaarlijke trainingsruns en het reguleren van hardware en algoritmen zijn veel betrouwbaardere manieren om veiligheid te waarborgen.
