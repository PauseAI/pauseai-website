---
title: Test Link Lokalisatie
description: Testpagina voor het verifiëren van linklokalisatiegedrag
---

Deze pagina test verschillende linkpatronen om ervoor te zorgen dat de lokalisatie correct werkt.

## Gewone interne links (moeten worden gelokaliseerd) {#regular-internal-links-should-be-localized}

- [Voorstel](/proposal)
- [Informatie](/learn)
- [Veelgestelde vragen](/faq)
- [Actie](/action)
- [Startpagina](/)

## Lokale startpagina's (moeten NIET worden gelokaliseerd) {#locale-homepages-should-not-be-localized}

- [Engelse startpagina](/en)
- [Duitse startpagina](/de)
- [Nederlandse startpagina](/nl)

## Reeds gelokaliseerde links (moeten NIET worden gelokaliseerd) {#already-localized-links-should-not-be-localized}

- [Engelse Veelgestelde vragen](/en/faq)
- [Duitse Actie](/de/action)
- [Nederlandse Voorstel](/nl/proposal)
- [Engels met afsluitende slash](/en/)

## Uitzonderingslinks (moeten NIET worden gelokaliseerd) {#opt-out-links-should-not-be-localized}

- [Forceer Engels](/en/proposal#no-localize)
- [Forceer Duits](/de/learn#no-localize)
- [Gewone link met uitzondering](/action#no-localize)

## Andere linktypes (moeten NIET worden gelokaliseerd) {#other-link-types-should-not-be-localized}

- [Externe link](https://example.com)
- [Externe link PauseAI](https://pauseai.info/proposal)
- [Protocolrelatief](//example.com)
- [Relatief](./other-page)
- [Ouderrelatief](../parent-page)
- [Anker](#section) <!-- lokaliseer alleen het label -->
- [E-mail](mailto:test@example.com)

## Randgevallen {#edge-cases}

- [Lege href]()
- [Alleen slash](/)
- [Dubbele slash aan het begin](//not-a-locale)
