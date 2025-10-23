---
title: Evenwicht tussen aanval en verdediging in AI-veiligheid
description: Hoe denken over het evenwicht tussen aanval en verdediging in AI-veiligheid
---

Aanval-verdedigingsevenwicht verwijst naar de relatieve sterktes en zwaktes van aanvallende en verdedigende strategieën, meestal in de context van militaire conflicten of sportwedstrijden.

Aangezien AI een technologie met meervoudig gebruik is, zien we deze aanval-verdedigingsevenwichten een rol spelen in verschillende AI-veiligheidsproblemen:

- Nepnieuws genereren, nepnieuws detecteren
- Cyberaanvallen, cybersecurityverdediging
- AI-overname, AI-verdediging tegen overname

Hoe zal het aanval-verdedigingsevenwicht in AI-veiligheid zich ontwikkelen?

## Nepmedia {#fake-media}

Moderne grote taalmodellen kunnen tekst in allerlei stijlen creëren, en andere modellen kunnen afbeeldingen, audio en zelfs video creëren.
Veel modellen creëren onovertuigende vervalsingen, maar de kwaliteit verbetert snel.

State-of-the-art tekst-, audio- en afbeeldingsmodellen zijn al goed genoeg om de meeste mensen te misleiden.
In 2022 won de eerste door AI gegenereerde afbeelding een kunstwedstrijd.
Een paar maanden later werd een fotowedstrijd gewonnen met een door AI gegenereerde afbeelding.

We beschikken ook over AI die diepe vervalsingen kan detecteren.
Dit resulteert in een kat-en-muisspel tussen de vervalsers en de detectoren.

Voor tekst lijkt de aanval aan de winnende hand te zijn.
OpenAI heeft hun AI-classificator [stopgezet](https://news.ycombinator.com/item?id=36862850) vanwege lage nauwkeurigheid.

Gelukkig kunnen maatregelen als [watermerken](https://arxiv.org/abs/2303.07205) en digitale handtekeningen worden gebruikt om vervalsingen te detecteren.
Het vereisen van handtekeningen voor alle media die we consumeren, kan een geschikte oplossing zijn.

## Cyberaanvallen versus verdediging {#cybersecurity-attacks-vs-defenses}

Moderne grote taalmodellen kunnen worden gebruikt om kwetsbaarheden in software te vinden.
Als je een kwetsbaarheid ontdekt, kun je deze repareren (verdediging) of exploiteren (aanval).
En gelukkig staan de meeste mensen aan de verdedigingskant.

Er zijn echter enkele voordelen die aanvallers hebben ten opzichte van verdedigers:

- **Aanvallers hoeven maar één kwetsbaarheid te vinden, terwijl verdedigers alle kwetsbaarheden moeten vinden.** De verdedigers zullen niet weten welke kwetsbaarheid de aanvallers zullen vinden, dus ze moeten zich tegen alle kwetsbaarheden verdedigen.
- **Het implementeren van patches duurt langer dan aanvallen.** Het "kwetsbaarheidsvenster" is de tijd die nodig is vanaf het moment dat een exploit wordt ontdekt tot het moment dat deze wordt gepatcht. Verdedigers moeten de fout repareren, de applicatie opnieuw compileren of de bijgewerkte bibliotheken publiceren, en vervolgens moeten alle gebruikers hun software updaten. Dit kan maanden duren, en in de tussentijd kan de kwetsbaarheid worden geëxploiteerd.

## Biohazards en biodefensie {#biohazards-and-biodefense}

AI kan worden gebruikt om nieuwe biologische agenten te ontwerpen of te helpen bij het proces van het creëren van een pandemie.
Een groep studenten kon een chatbot gebruiken om [alle stappen te produceren die nodig zijn om een nieuwe pandemie te creëren](https://arxiv.org/abs/2306.03809).
AI kan echter ook worden gebruikt om nieuwe vaccins, medicijnen of verdedigingen tegen biologische agenten te creëren.

- **Virussen verspreiden zich sneller dan vaccins**. Een virus is letterlijk een zelfreplicerende machine. Een vaccinatie daarentegen vereist veel inspanning om te produceren en te distribueren.

## Onbekende technologie en risico's {#unknown-technology-and-risks}

Een AI die veel slimmer is dan mensen kan zijn superieure begrip van de realiteit gebruiken om nieuwe technologieën te creëren.
Misschien kan deze AI zelfreplicerende nanobots creëren die alle materie kunnen omzetten in kopieën van zichzelf, of kleine machines die de hersenen van mensen kunnen beïnvloeden.
Het voorspellen van wat deze technologie precies zal zijn, is onmogelijk (we zouden minstens zo slim moeten zijn als de AI), maar we kunnen nog steeds redeneren over het aanval-verdedigingsevenwicht.
De conclusie is niet zo moeilijk: we hebben geen idee wat er komt, en we hebben geen idee hoe we ons ertegen moeten verdedigen.
We staan in het nadeel.

## Conclusie {#conclusion-1}

Veel AI-risico's hebben een aanval-verdedigingsevenwicht.
Voor nepmedia kunnen we digitale handtekeningen gebruiken om vervalsingen te detecteren, waardoor het evenwicht naar verdediging verschuift.
Voor cybersecurity, biohazards en onbekende technologie lijkt de aanval in het voordeel te zijn.

De belangrijke beleidsimplicatie hiervan is: [laten we deze technologie in de eerste plaats niet bouwen](/proposal).
