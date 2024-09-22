---
title: Cybersecurityrisico's van grensverleggende AI-modellen
description: Hoe AI kan worden gebruikt om alle apparaten te hacken.
---

Bijna alles wat we tegenwoordig doen, is op de een of andere manier afhankelijk van computers.
We betalen voor onze boodschappen, plannen onze dagen, nemen contact op met onze dierbaren en zelfs rijden we met computers in onze auto's.
En vrijwel al deze computers zijn met elkaar verbonden.
Dit maakt ons allemaal kwetsbaar voor cyberaanvallen.

Zeer krachtige cyberwapens, malware en botnets (zoals [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](<https://en.wikipedia.org/wiki/Mirai_(malware)>) en [EMOTET](https://en.wikipedia.org/wiki/Emotet)) zijn altijd moeilijk te creëren geweest.
Het [Pegasus-cyberwapen](<https://en.wikipedia.org/wiki/Pegasus_(spyware)>) kostte bijvoorbeeld honderden miljoenen dollars om te ontwikkelen.
Het vinden van zogenaamde zero-day exploits (kwetsbaarheden die nog niet zijn ontdekt) vereist veel vaardigheid en tijd - alleen zeer gespecialiseerde hackers kunnen dit doen.
Echter, wanneer AI voldoende geavanceerd wordt, zal dit niet langer het geval zijn.
In plaats van een team van hoogopgeleide beveiligingsexperts/hackers in te huren om zero-day exploits te vinden, kan iedereen gewoon een veel goedkopere AI gebruiken.

## AI-modellen kunnen autonoom kwetsbaarheden vinden en uitbuiten

De nieuwste AI-systemen kunnen al software analyseren en schrijven.
Ze [kunnen kwetsbaarheden vinden](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) in software, en [ze zouden kunnen worden gebruikt om deze uit te buiten](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).
GPT-4 kan al [autonoom websites hacken](https://arxiv.org/html/2402.06664v1), en voert taken uit die zo complex zijn als blinde database-schema-extractie en SQL-injecties zonder menselijke feedback, wat 18 maanden na de training van GPT-4 werd ontdekt.
GPT-4 [overtreft al 88%](https://arxiv.org/pdf/2402.11814.pdf) van menselijke hackers in een CTF-wedstrijd.
Het kan ook [autonoom 87% van de geteste kwetsbaarheden uitbuiten](https://arxiv.org/abs/2404.08144), wat een enorme stap vooruit is ten opzichte van GPT-3.5 of open-source modellen, die allemaal 0% behaalden.
Teams van meerdere LLM's [presteren zelfs beter](https://arxiv.org/abs/2406.01637) - ze kunnen echte zero-day kwetsbaarheden uitbuiten.
Naarmate de mogelijkheden van AI groeien, zullen ook de kwetsbaarheden die ze kunnen detecteren en de exploits die ze kunnen creëren toenemen.
Ze zijn nog niet zo goed als de beste mensen, dus op dit moment is het gevaar beperkt.
Echter, de mogelijkheden nemen snel toe en kunnen vrij plotseling stijgen.

Let op dat AI ook volledig nieuwe soorten aanvallen mogelijk maakt.
Bijvoorbeeld, AI kan worden gebruikt om [het wachtwoord dat je typt te horen tijdens een online gesprek](https://beebom.com/ai-crack-password-listening-keyboard-sounds/) of [Wi-Fi te gebruiken om mensen door muren te zien](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).
AI kan ook worden gebruikt om [zelf-modificerende malware](https://www.hyas.com/blog/blackmamba-using-ai-to-generate-polymorphic-malware) te maken, wat het veel moeilijker maakt om te detecteren.

Het is zeer waarschijnlijk dat er een moment komt waarop een AI beter is in hacken dan de beste menselijke hackers.
Dit kan op veel manieren verkeerd gaan.

- **Infrastructuur**: Cyberwapens kunnen worden gebruikt om toegang te krijgen tot of kritieke infrastructuur uit te schakelen, zoals [olie pijpleidingen](https://en.wikipedia.org/wiki/Colonial_Pipeline_ransomware_attack) of [elektriciteitsnetten](https://obr.uk/box/cyber-attacks-during-the-russian-invasion-of-ukraine/).
- **Financieel**: Cyberwapens kunnen worden gebruikt om [geld van banken te stelen](https://en.wikipedia.org/wiki/2015%E2%80%932016_SWIFT_banking_hack), of om [de aandelenmarkt te manipuleren](https://en.wikipedia.org/wiki/2010_flash_crash).
- **Militair**: Apparatuur zoals wapens en sensoren zijn steeds afhankelijker van draadloze connectiviteit en complexe software.

## Grootschalige cyberaanvallen

Het is mogelijk dat zo'n krachtige AI zal worden gebruikt om een virus te creëren dat een groot aantal zero-day exploits gebruikt.
De meeste cyberwapens gebruiken
Een voldoende capabele AI zou kwetsbaarheden in de broncode van alle besturingssystemen en andere software kunnen analyseren en vinden.
Zo'n virus zou elke computer kunnen infecteren, ongeacht het besturingssysteem, via meerdere kanalen zoals Wi-Fi, Bluetooth, UTP, enz.
Dit zou volledige controle over deze machines kunnen geven en de controller in staat stellen om gegevens te stelen, de hardware voor eigen berekeningen te gebruiken, de inhoud te versleutelen voor losgeld of [de machine volledig uit te schakelen](https://en.wikipedia.org/wiki/Hardware_Trojan).

Een virus zoals dit zou kunnen worden gemaakt als een hulpmiddel door criminelen om geld te stelen, of als een zeer destructief cyberwapen door een natie of terroristische organisatie.
Echter, naarmate AI agentischer wordt, zou het ook autonoom kunnen worden gecreëerd en ingezet door [misaligned AI](/xrisk).

Als het doel van een cyberaanval was om apparaten en infrastructuur uit te schakelen, zou de schade enorm kunnen zijn.
Onze samenleving is steeds afhankelijker van computers en het internet.
Betalingen, transport, communicatie, planning, toeleveringsketens, elektriciteitsnetten...
Als onze apparaten niet meer goed functioneren, zullen veel delen van onze samenleving ook niet goed functioneren.

Meer dan [93% van de cybersecurity-experts](https://www.weforum.org/publications/global-cybersecurity-outlook-2023/) gelooft dat “een ingrijpende, catastrofale cybergebeurtenis waarschijnlijk is in de komende twee jaar”.

## Beperken van AI Cybersecurity Risico's

Het bovenstaande verhaal kan alleen gebeuren als:

1. De **capaciteit om zero-day exploits te vinden** opkomt. Huidige modellen kunnen al enkele kwetsbaarheden ontdekken, maar dit zal waarschijnlijk verbeteren met nieuwere modellen.
2. Het **model in handen komt van kwaadwillenden**. Dit kan gebeuren als de modelgewichten worden gelekt, als het model open-source wordt, of als het wordt ontwikkeld door een kwaadwillende actor.
3. De **beveiligingskwetsbaarheden niet worden gepatcht** voordat zo'n cyberwapen wordt ingezet. Helaas zijn de verdedigers in het nadeel als het model wijdverspreid is om twee redenen:
   1. Patching + uitgeven + inzetten duurt veel langer dan aanvallen. Het venster van kwetsbaarheid is groter dan de tijd die nodig is om de aanval te creëren.
   2. De aanvallers hoeven maar één kwetsbaarheid te vinden, terwijl de verdedigers ze allemaal moeten vinden.

Er zijn verschillende maatregelen die we kunnen implementeren om deze aan te pakken:

- **Sta niet toe dat modellen worden getraind die zero-day exploits kunnen vinden**. Dit is de meest effectieve manier om te voorkomen dat dit gebeurt. Het is de veiligste weg, en het is wat we [voorstellen](/proposal).
- **Sta alleen modellen toe om te worden ingezet of open-source te worden gemaakt na uitgebreide tests**. Als ze gevaarlijke mogelijkheden hebben, geef ze dan niet vrij.
- **Implementeer strikte cybersecurity-regelgeving om te voorkomen dat modelgewichten worden gelekt**. Als je gevaarlijke modellen toestaat, zorg er dan voor dat ze niet in verkeerde handen vallen.
- **Verplicht AI-bedrijven om de AI te gebruiken om kwetsbaarheden te verhelpen**. Als een model is getraind dat nieuwe beveiligingskwetsbaarheden kan vinden, gebruik dit dan om contact op te nemen met softwarebeheerders om deze kwetsbaarheden te patchen. Geef het patchproces voldoende tijd voordat het model wordt vrijgegeven. Zorg ervoor dat de gewichten niet worden gelekt en bescherm het model alsof het de lanceercode voor een nucleaire aanval is. Als dit goed wordt gedaan, kan AI de cybersecurity overal dramatisch verbeteren.
