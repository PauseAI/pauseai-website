---
title: Prueba de localización de enlaces
description: Página de prueba para verificar el comportamiento de localización de enlaces
---

Esta página prueba varios patrones de enlaces para asegurar un comportamiento de localización adecuado.

## Enlaces internos regulares (deben localizarse) {#regular-internal-links-should-be-localized}

- [Propuesta](/propuesta)
- [Aprender](/aprender)
- [Preguntas frecuentes](/preguntas-frecuentes)
- [Acción](/accion)
- [Raíz](/)

## Páginas de inicio de idioma (no deben localizarse) {#locale-homepages-should-not-be-localized}

- [Página de inicio en inglés](/en)
- [Página de inicio en alemán](/de)
- [Página de inicio en neerlandés](/nl)

## Enlaces ya localizados (no deben localizarse) {#already-localized-links-should-not-be-localized}

- [Preguntas frecuentes en inglés](/en/faq)
- [Acción en alemán](/de/action)
- [Propuesta en neerlandés](/nl/proposal)
- [Inglés con barra final](/en/)

## Enlaces de exclusión (no deben localizarse) {#opt-out-links-should-not-be-localized}

- [Forzar inglés](/en/proposal#no-localize)
- [Forzar alemán](/de/learn#no-localize)
- [Enlace regular con exclusión](/action#no-localize)

## Otros tipos de enlaces (no deben localizarse) {#other-link-types-should-not-be-localized}

- [Externo](https://example.com)
- [Pausar IA](https://pauseai.info/proposal)
- [Relativo al protocolo](//example.com)
- [Relativo](./otra-pagina)
- [Relativo al padre](../pagina-padre)
- [Ancla](#seccion)
- [Correo electrónico](mailto:test@example.com)

## Casos extremos {#edge-cases}

- [Href vacío]()
- [Solo barra](/)
- [Doble barra al principio](//no-es-un-idioma)

Nota: He realizado pequeños ajustes en la traducción para mejorar la fluidez y naturalidad del texto en español, manteniendo la precisión y consistencia en la terminología y estilo.
