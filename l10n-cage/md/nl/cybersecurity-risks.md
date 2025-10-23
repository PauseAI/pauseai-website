---
title: Cyberbeveiligingsrisico's van geavanceerde AI-modellen
description: Hoe AI gebruikt kan worden om alle apparaten te hacken.
---

Vrijwel alles wat we tegenwoordig doen, is op de een of andere manier afhankelijk van computers.
We betalen onze boodschappen, plannen onze dagen, contacteren onze dierbaren en zelfs rijden onze auto's met computers.
En vrijwel alle computers zijn met elkaar verbonden.
Dit maakt ons allemaal kwetsbaar voor cyberaanvallen.

Zeer krachtige cyberwapens, malware en botnets (zoals [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](<https://nl.wikipedia.org/wiki/Mirai_(malware)>) en [EMOTET](https://nl.wikipedia.org/wiki/Emotet)) zijn altijd moeilijk te creëren geweest.
Het [Pegasus-cyberwapen](<https://nl.wikipedia.org/wiki/Pegasus_(spyware)>), bijvoorbeeld, kostte honderden miljoenen dollars om te ontwikkelen.
Het vinden van zogenaamde zero-day-exploits (kwetsbaarheden die nog niet zijn ontdekt) vereist veel expertise en tijd - alleen zeer gespecialiseerde hackers kunnen dit doen.
Echter, wanneer AI voldoende geavanceerd wordt, zal dit niet langer het geval zijn.
In plaats van een team van zeer gespecialiseerde beveiligingsexperts/hackers in te huren om zero-day-exploits te vinden, kan iedereen gewoon een veel goedkopere AI gebruiken.

## AI-modellen kunnen autonoom kwetsbaarheden vinden en exploiteren {#ai-models-can-autonomously-find-and-exploit-vulnerabilities}

De nieuwste AI-systemen kunnen al software analyseren en schrijven.
Ze [kunnen kwetsbaarheden vinden](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) in software, en [ze kunnen worden gebruikt om deze te exploiteren](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).
GPT-4 kan al [autonoom websites hacken](https://arxiv.org/html/2402.06664v1), taken uitvoeren die zo complex zijn als blinde database-schema-extractie en SQL-injecties zonder menselijke feedback, wat 18 maanden na de afronding van de training van GPT-4 werd ontdekt.
GPT-4 presteert al [beter dan 88%](https://arxiv.org/pdf/2402.11814.pdf) van de menselijke hackers in een CTF-competitie.
Het kan ook [autonoom 87% van de geteste kwetsbaarheden exploiteren](https://arxiv.org/abs/2404.08144), wat een enorme stap voorwaarts is ten opzichte van GPT-3.5 of open-source-modellen, die allemaal 0% scoorden.
Teams van meerdere LLM's [presteren nog beter](https://arxiv.org/abs/2406.01637) - ze kunnen echte zero-day-kwetsbaarheden exploiteren.
Naarmate de mogelijkheden van AI toenemen, zullen ook de kwetsbaarheden die ze kunnen detecteren en de exploits die ze kunnen creëren, toenemen.
Ze zijn nog niet zo goed in dit als de beste mensen, dus op dit moment is het gevaar beperkt.
Echter, de mogelijkheden nemen snel toe en kunnen plotseling een grote sprong maken.

Houd er rekening mee dat AI ook volledig nieuwe soorten aanvallen mogelijk maakt.
Bijvoorbeeld, AI kan worden gebruikt om [het wachtwoord dat je typt te horen vanuit een online gesprek](https://beebom.com/ai-crack-password-listening-keyboard-sounds/)
of om [Wi-Fi te gebruiken om mensen door muren heen te zien](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).
AI kan ook worden gebruikt om [zelfmodificerende malware](https://www.hyas.com/blog/blackmamba-using-ai-to-generate-polymorphic-malware) te maken, wat het veel moeilijker maakt om te detecteren.

Er zal waarschijnlijk een moment komen waarop een AI beter is in hacken dan de beste menselijke hackers.
Dit kan op veel manieren misgaan.

- **Infrastructuur**: Cyberwapens kunnen worden gebruikt om toegang te krijgen tot of kritieke infrastructuur uit te schakelen, zoals [olieleidingen](https://nl.wikipedia.org/wiki/Colonial_Pipeline_ransomware-aanval) of [stroomnetwerken](https://obr.uk/box/cyber-aanvallen-tijdens-de-russische-invasie-van-oekraïne/).
- **Financieel**: Cyberwapens kunnen worden gebruikt om [geld te stelen van banken](https://nl.wikipedia.org/wiki/2015%E2%80%932016_SWIFT-bankinghack), of om [de aandelenmarkt te manipuleren](https://nl.wikipedia.org/wiki/2010_flash_crash).
- **Militair**: Apparatuur zoals wapens en sensoren zijn steeds meer afhankelijk van draadloze connectiviteit en complexe software.

## Grote cyberaanvallen {#large-scale-cyberattacks}

Het is mogelijk dat zo'n krachtige AI wordt gebruikt om een virus te creëren dat een groot aantal zero-day-exploits gebruikt.
Een voldoende capabele AI kan de broncode van alle besturingssystemen en andere software analyseren en kwetsbaarheden vinden.
Zo'n virus kan elke computer infecteren, ongeacht het besturingssysteem, via meerdere kanalen zoals Wi-Fi, Bluetooth, UTP, enz.
Dit kan volledige controle geven over deze machines en de controller in staat stellen om gegevens te stelen, de hardware te gebruiken voor eigen berekeningen, de inhoud te versleutelen voor losgeld of [de machine volledig uit te schakelen](https://nl.wikipedia.org/wiki/Hardware_Trojan).

Een virus als dit kan worden gemaakt als een tool door criminelen om geld te stelen, of als een zeer destructief cyberwapen door een natie of terroristische organisatie.
Echter, naarmate AI meer agentisch wordt, kan het ook autonoom worden gecreëerd en ingezet door [misaligned AI](/xrisk).

Als het doel van een cyberaanval was om apparaten en infrastructuur uit te schakelen, kan de schade enorm zijn.
Onze samenleving is steeds meer afhankelijk van computers en het internet.
Betalingen, transport, communicatie, planning, toeleveringsketens, stroomnetwerken...
Als onze apparaten niet meer goed functioneren, falen veel delen van onze samenleving ook.

Meer dan [93% van de cybersecurity-experts](https://www.weforum.org/publications/global-cybersecurity-outlook-2023/) gelooft dat "een verreikende, catastrofale cybergebeurtenis waarschijnlijk is in de komende twee jaar".

## Mitigeren van AI-cyberbeveiligingsrisico's {#mitigating-ai-cybersecurity-risks}

Het verhaal hierboven kan alleen gebeuren als:

1. De **mogelijkheid om zero-day-exploits te vinden** ontstaat. Huidige modellen kunnen al enkele kwetsbaarheden ontdekken, maar dit zal waarschijnlijk verbeteren met nieuwere modellen.
2. Het **model in handen valt van slechte actoren**. Dit kan gebeuren als de modelgewichten worden gelekt, als het model open-source wordt gemaakt, of als het wordt ontwikkeld door een malafide actor.
3. De **beveiligingskwetsbaarheden niet worden gepatcht** voordat zo'n cyberwapen wordt ingezet. Helaas zijn de verdedigers in het nadeel als het model breed wordt verspreid om twee redenen:
   1. Patchen + vrijgeven + implementeren duurt veel langer dan aanvallen. Het venster van kwetsbaarheid is groter dan de tijd die nodig is om de aanval te creëren.
   2. De aanvallers hoeven maar één kwetsbaarheid te vinden, terwijl de verdedigers alle kwetsbaarheden moeten vinden.

Er zijn verschillende maatregelen die we kunnen nemen om dit aan te pakken:

- **Sta niet toe dat modellen worden getraind die zero-day-exploits kunnen vinden**. Dit is de meest effectieve manier om dit te voorkomen. Het is de veiligste weg, en het is wat we [voorstellen](/proposal).
- **Laat modellen alleen worden ingezet of open-source worden gemaakt na uitgebreide tests**. Als ze gevaarlijke mogelijkheden hebben, laat ze dan niet vrij.
- **Leg strenge cybersecurity-regels op om te voorkomen dat modelgewichten worden gelekt**. Als je gevaarlijke modellen toestaat, zorg er dan voor dat ze niet in verkeerde handen vallen.
- **Verplicht AI-bedrijven om de AI te gebruiken om kwetsbaarheden te repareren**. Als een model wordt getraind dat nieuwe beveiligingskwetsbaarheden kan vinden, gebruik dit dan om software-onderhouders te contacteren om deze kwetsbaarheden te patchen. Geef het patchproces voldoende tijd voordat het model wordt vrijgegeven. Zorg ervoor dat de gewichten niet worden gelekt en bescherm het model alsof het de lanceercode voor een nucleaire aanval is. Als dit goed wordt gedaan, kan AI de cybersecurity overal dramatisch verbeteren.
