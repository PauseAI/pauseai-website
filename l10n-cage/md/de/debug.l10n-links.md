---
title: Test der Link-Lokalisierung
description: Testseite zur Überprüfung des Lokalisierungsverhaltens
---

Diese Seite testet verschiedene Link-Muster, um sicherzustellen, dass die Lokalisierung korrekt funktioniert.

## Reguläre interne Links (sollten lokalisiert werden) {#regular-internal-links-should-be-localized}

- [Vorschlag](/proposal)
- [Lernen](/learn)
- [Häufig gestellte Fragen](/faq)
- [Aktion](/action)
- [Startseite](/)

## Startseiten für verschiedene Sprachen (sollten NICHT lokalisiert werden) {#locale-homepages-should-not-be-localized}

- [Englische Startseite](/en)
- [Deutsche Startseite](/de)
- [Niederländische Startseite](/nl)

## Bereits lokalisierte Links (sollten NICHT lokalisiert werden) {#already-localized-links-should-not-be-localized}

- [Englische FAQ](/en/faq)
- [Deutsche Aktion](/de/action)
- [Niederländischer Vorschlag](/nl/proposal)
- [Englisch mit nachfolgendem Schrägstrich](/en/)

## Opt-out-Links (sollten NICHT lokalisiert werden) {#opt-out-links-should-not-be-localized}

- [Englisch erzwingen](/en/proposal#no-localize)
- [Deutsch erzwingen](/de/learn#no-localize)
- [Regulärer Link mit Opt-out](/action#no-localize)

## Andere Link-Typen (sollten NICHT lokalisiert werden) {#other-link-types-should-not-be-localized}

- [Externer Link](https://example.com)
- [Externer Link zu PauseAI](https://pauseai.info/proposal)
- [Protokollrelativer Link](//example.com)
- [Relativer Link](./other-page)
- [Elternrelativer Link](../parent-page)
- [Anker](#section) <!-- Ziel nicht lokalisieren, nur Label -->
- [E-Mail-Adresse](mailto:test@example.com)

## Grenzfälle {#edge-cases}

- [Leerer href]()
- [Nur Schrägstrich](/)
- [Doppelter Schrägstrich am Anfang](//not-a-locale)
