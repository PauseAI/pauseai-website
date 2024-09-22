---
title: Evenwicht tussen aanval en verdediging in AI-veiligheid
description: Hoe te denken over het evenwicht tussen aanval en verdediging in AI-veiligheid
---

Het evenwicht tussen aanval en verdediging verwijst naar de relatieve sterkte en zwakte van offensieve en defensieve strategieën, meestal in de context van militaire conflicten of sportcompetities.

Aangezien AI een dual-use technologie is, kunnen we zien dat deze evenwichten tussen aanval en verdediging een rol spelen in verschillende AI-veiligheidsproblemen:

- Generatie van nepmedia, detectie van nepmedia
- Cybersecurity-aanvallen, cybersecurity-verdedigingen
- AI-overname, AI-verdediging tegen overname

Hoe zal het evenwicht tussen aanval en verdediging in AI-veiligheid zich ontwikkelen?

## Nepmedia

Moderne grote taalmodellen kunnen tekst in allerlei stijlen creëren, en andere modellen kunnen afbeeldingen, audio en zelfs video maken.
Veel modellen creëren onconvincerende vervalsingen, maar de kwaliteit verbetert snel.

State-of-the-art tekst-, audio- en beeldmodellen zijn al goed genoeg om de meeste mensen te misleiden.
In 2022 won het eerste door AI gegenereerde beeld een kunstwedstrijd.
Een paar maanden later werd een fotografiecompetitie gewonnen met een door AI gegenereerd beeld.

We hebben ook AI's die deepfakes kunnen detecteren.
Dit resulteert in een kat-en-muis-spel tussen de vervalsers en de detectors.

Voor tekst lijkt de aanval te winnen.
OpenAI [heeft](https://news.ycombinator.com/item?id=36862850) hun AI-classificator stopgezet vanwege lage nauwkeurigheid.

Gelukkig kunnen maatregelen zoals [watermerken](https://arxiv.org/abs/2303.07205) en digitale handtekeningen worden gebruikt om vervalsingen te detecteren.
Het vereisen van handtekeningen voor alle media die we consumeren kan een geschikte oplossing zijn.

## Cybersecurity-aanvallen vs verdedigingen

Moderne grote taalmodellen kunnen worden gebruikt om kwetsbaarheden in software te vinden.
Wanneer je een kwetsbaarheid ontdekt, kun je deze verhelpen (verdediging) of uitbuiten (aanval).
En gelukkig zijn verreweg de meeste mensen aan de defensieve kant.

Echter, er zijn enkele voordelen die aanvallers hebben ten opzichte van verdedigers:

- **Aanvallers hoeven maar één kwetsbaarheid te vinden, terwijl verdedigers ze allemaal moeten vinden.** De verdedigers weten niet welke kwetsbaarheid de aanvallers zullen vinden, dus ze moeten zich tegen allemaal verdedigen.
- **Het uitrollen van patches duurt langer dan aanvallen.** Het "venster van kwetsbaarheid" is de tijd die verstrijkt van het ontdekken van een exploit tot het moment dat deze is gepatcht. Verdedigers moeten de bug verhelpen, de applicatie opnieuw compileren of de bijgewerkte bibliotheken publiceren, en dan moeten alle gebruikers hun software bijwerken. Dit kan maanden duren, en in de tussentijd kan de kwetsbaarheid worden uitgebuit.

## Biohazards en biodefensie

AI kan worden gebruikt om nieuwe biologische agentia te ontwerpen, of om te helpen bij het proces van het creëren van een pandemie.
Een groep studenten was in staat om een chatbot te [laten produceren wat nodig is om een nieuwe pandemie te creëren](https://arxiv.org/abs/2306.03809).
Het kan echter ook worden gebruikt om nieuwe vaccins, medicijnen of verdedigingen tegen biologische agentia te creëren.

- **Virussen verspreiden zich sneller dan vaccins.** Een virus is letterlijk een zelf-repliceermachine. Een vaccinatie daarentegen vereist veel moeite om te produceren en te distribueren.

## Onbekende technologie en risico's

Een AI die veel slimmer is dan mensen kan in staat zijn om zijn superieure begrip van de werkelijkheid te gebruiken om nieuwe technologieën te creëren.
Misschien enkele zelf-repliceerende nanobots die alle materie kunnen omzetten in kopieën van zichzelf, of kleine machines die de hersenen van mensen kunnen beïnvloeden.
Voorspellen wat precies dit soort technologie zal zijn is onmogelijk (we zouden minstens zo slim moeten zijn als de AI), maar we kunnen nog steeds redeneren over het evenwicht tussen aanval en verdediging.
De conclusie is niet zo moeilijk: we hebben geen idee wat er komt, en we hebben geen idee hoe we ons ertegen kunnen verdedigen.
We zijn in het nadeel.

## Conclusie

Veel AI-risico's hebben een evenwicht tussen aanval en verdediging.
Voor nepmedia zouden we digitale handtekeningen kunnen gebruiken om vervalsingen te detecteren, waardoor het evenwicht naar verdediging verschuift.
Voor cybersecurity, biohazards en onbekende technologie lijkt de aanval de overhand te hebben.

De belangrijke beleidsimplicatie hiervan is: [laten we deze technologie in de eerste plaats niet bouwen](/proposal).
