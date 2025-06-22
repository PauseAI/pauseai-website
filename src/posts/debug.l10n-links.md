---
title: Test Link Localization
description: Test page for verifying link localization behavior
---

This page tests various link patterns to ensure proper localization behavior.

## Regular internal links (should be localized)

- [Proposal](/proposal)
- [Learn](/learn)
- [FAQ](/faq)
- [Action](/action)
- [Root](/)

## Locale homepages (should NOT be localized)

- [English homepage](/en)
- [German homepage](/de)
- [Dutch homepage](/nl)

## Already-localized links (should NOT be localized)

- [English FAQ](/en/faq)
- [German Action](/de/action)
- [Dutch Proposal](/nl/proposal)
- [English with trailing slash](/en/)

## Opt-out links (should NOT be localized)

- [Force English](/en/proposal#no-localize)
- [Force German](/de/learn#no-localize)
- [Regular link with opt-out](/action#no-localize)

## Other link types (should NOT be localized)

- [External](https://example.com)
- [External PauseAI](https://pauseai.info/proposal)
- [Protocol relative](//example.com)
- [Relative](./other-page)
- [Parent relative](../parent-page)
- [Anchor](#section)
- [Mailto](mailto:test@example.com)

## Edge cases

- [Empty href]()
- [Just slash](/)
- [Double slash start](//not-a-locale)
