---
title: De Pauzeknop Bouwen
description: Hoe zou een AI-pauze eruitzien? Hoe voorkom je daadwerkelijk dat een superintelligente AI wordt gecreëerd?
---

Als we de creatie van een superintelligente AI toestaan, riskeren we [ieder leven op aarde](/xrisk).
Wanneer we over een pauze spreken, hebben we het over [het implementeren van een internationaal verbod op de creatie van een superintelligente AI](/proposal).
Sommigen beweren dat het te vroeg is om op de pauzeknop te drukken (we [doen het niet](/urgency)), maar de meeste experts lijken het erover eens te zijn dat het goed zou zijn om even te pauzeren als de ontwikkelingen te snel gaan.
Maar op dit moment _hebben we geen pauzeknop_.
Dus moeten we beginnen met nadenken over hoe dit zou werken, en hoe we het kunnen implementeren.
Gelukkig is het bouwen van een superintelligente AI moeilijk en vereist het veel middelen.

_Deze pagina is een work in progress en wordt beheerd door het Building the Pause Button-team bij PauseAI, als onderdeel van de AI Safety Camp 2025._

## Inhoud {#contents-1}

## De Wedloop: waarom we internationale samenwerking nodig hebben {#the-race-why-we-need-international-cooperation-1}

We verwachten niet dat een enkel land in staat zal zijn om een pauze te implementeren.
De economische prikkels zijn te sterk, en het vertragen van de AI-ontwikkeling zou een land in een economisch en geopolitiek nadeel brengen.
De kosten van onderinvestering in veiligheid worden wereldwijd verdeeld, terwijl de voordelen van het versnellen lokaal zijn.
Dit speltheoretische probleem wordt soms "Moloch" of een "Wedloop naar de Bodem" genoemd.

De enige uitweg is een _internationale overeenkomst_.
Daarom zijn we zo geobsedeerd door [topconferenties](/summit): dit zijn de evenementen waar wereldwijde besluitvormers samen komen en werken aan een wereldwijde oplossing.
Of tenminste, dat is wat we willen dat ze doen.
Tot nu toe hebben alle AI-veiligheidstopconferenties niet geleid tot zinvolle regulering.
Het is aan jou en mij om [hen te overtuigen](/action).

## Rekenkrachtbeheer {#compute-governance-1}

Om een grensverleggende LLM (zoals GPT-4) te trainen, heb je veel zeer gespecialiseerde en dure hardware nodig.
GPT-4 werd getraind op 25.000 Nvidia A100 GPU's, die elk $10.000 kosten.
Hoewel er innovaties zijn die efficiëntere training mogelijk maken, is de trend dat AI-modellen steeds groter en groter worden.

De schaal van moderne AI-trainingsvereisten is enorm.
Microsoft kondigde onlangs een plan aan om [een kerncentrale te bouwen](https://www.theverge.com/2024/9/20/24249770/microsoft-three-mile-island-nuclear-power-plant-deal-ai-data-centers) voor zijn AI-stroombehoeften.
Gelukkig voor ons betekent dit dat AI-trainingsruns moeilijk te verbergen zijn, althans in de nabije toekomst.

Door de AI-chipketen te controleren en te monitoren, kunnen overheden of andere regelgevende instanties ervoor zorgen dat niemand een gevaarlijke AI-trainingsrun start.
Laten we dieper ingaan op de verschillende knelpunten in deze toeleveringsketen.

### Knelpunten in de chipketen {#choke-points-in-the-chip-supply-chain-1}

Het is moeilijk om de complexiteit en onderlinge afhankelijkheid van de AI-chipketen te overdrijven.
Het bestaat uit verschillende zeer gespecialiseerde bedrijven, waarvan sommige de enige in de wereld zijn die bepaalde componenten kunnen produceren.
Dit is goed nieuws voor governance.
Via de hardware kunnen we de trainingsruns reguleren.
Laten we een duik nemen in de verschillende knelpunten in de AI-chipketen.

#### Siliciumwafers: Shin-Etsu, Sumco, Siltronic {#silicon-wafers-shin-etsu-sumco-siltronic-1}

#### Lithografie: ASML & SMEE {#lithography-asml--smee-1}

Alle moderne chips worden gemaakt met behulp van lithografiemachines: enorme machines die $200 miljoen kosten en licht op een siliciumwafer projecteren.
Dit lithografiaproces is een van de meest complexe en dure delen van het chipproductieproces.
Top-tier AI-chips worden allemaal gemaakt met behulp van EUV-lithografie, en ASML is het enige bedrijf dat deze machines maakt.
Dit Nederlandse bedrijf is een van de belangrijkste potentiële knelpunten voor AI-governance.
Deze machines zijn waanzinnig complex en vereisen veel expertise om te bouwen en te onderhouden.
Opmerkelijk is dat ze [afstandsbedieningen](https://www.businessinsider.com/asml-tsmc-semiconductor-chip-equipment-kill-switch-china-invade-taiwan-2024-5) hebben (voornamelijk voor het geval Taiwan wordt binnengevallen), dus in sommige belangrijke opzichten is de pauzeknop al gebouwd.

De Nederlandse regering heeft strikte exportcontroles ingesteld voor hun EUV-lithografiemachines, waarvoor exportvergunningen nodig zijn.
Deze exportcontroles zijn voornamelijk ingesteld om China's chipambities te vertragen.
De [VS, Japan en Nederland](https://apnews.com/article/technology-district-of-columbia-netherlands-china-business-6801d6c5f65b0bc1df6186e2e89a6f7d) hebben een (niet-openbaar) akkoord om chip- en lithografie-exporten naar China te beperken.

Het Chinese bedrijf SMEE probeert bij te blijven, maar is niet in staat om zijn eigen EUV-machines te maken.
Hun DUV-machines zijn [nog steeds vast op 28nm](https://www.scmp.com/tech/big-tech/article/3278235/chinese-chip-making-shows-progress-new-euv-patent-domestic-lithography-champion), wat generaties achter ligt op ASML's 5nm EUV-proces, laat staan ASML's toekomstige 2nm-machines.
Dus SMEE is niet in staat om moderne AI-chips te produceren.

Met andere woorden: ASML is een fundamenteel knelpunt in de AI-chipketen.

#### Optica: Zeiss {#optics-zeiss-1}

ASML's EUV-machines gebruiken spiegels en lenzen gemaakt door het Duitse bedrijf Zeiss.
In 2016 kocht ASML [een belang van 25%](https://optics.org/news/7/11/11) in Zeiss, en de twee bedrijven hebben een zeer nauwe relatie.
Het is waarschijnlijk dat geen enkel ander bedrijf deze optica kan produceren.

#### Photoresist {#photoresist-1}

De photoresist is een chemisch product dat wordt gebruikt om de patronen in de siliciumwafer te etsen.
Japanse bedrijven zijn dominant in dit veld.

De belangrijkste bedrijven in dit veld zijn:

- JSR (Japan)
- Shin-Etsu (Japan)
- Tokyo Ohka Kogyo (Japan)
- DuPont (VS)

#### Interconnect & Packaging: ASE {#interconnect--packaging-ase-1}

Wanneer een chip-die een fab verlaat, moet deze worden "verpakt".
ASE is waarschijnlijk het grootste interconnect-bedrijf voor AI-chips.

#### Fabricage: TSMC, Samsung en SMIC {#fabrication-tsmc-samsung-amd-smic-1}

Het bouwen van een "fab" (een chipfabriek) is verbazingwekkend moeilijk: het heeft een nultolerantie voor stofdeeltjes, vereist de duurste hightech-apparatuur en heeft een zeer complexe toeleveringsketen.
Een moderne fab kost ongeveer 10 tot 20 miljard dollar om te produceren.

De Taiwan Semiconductor Manufacturing Company is verantwoordelijk voor [ongeveer 90%](https://www.fool.com/investing/2025/02/03/meet-the-monster-stock-that-continues-to-crush-the/) van de moderne AI-chips, die allemaal chips zijn gemaakt met een precisie van 7nm of beter.
Samsung is het enige andere bedrijf dat moderne AI-chips kan produceren.

Maar het Chinese SMIC haalt snel in - ze hebben al een [functioneel 7nm-proces](https://wccftech.com/smic-to-limit-huawei-to-7nm-chips-until-2026-reducing-advancement/).
Vanwege de exportcontroles van de VS/Nederland is SMIC niet in staat om ASML EUV-machines te kopen, en zijn nu ook beperkt in het kopen van de oudere DUV-machines.
In juni 2024 liet een [rapport](https://evertiq.com/news/55926) zien dat SMIC 5nm-chips kan produceren met behulp van DUV-hardware,
en is nu in staat om 7nm AI-chips te produceren (ongeveer drie jaar achter op het 4nm-proces dat ASML's EUV-machines kunnen produceren), maar SMIC's lithografie wordt geplaagd door lage opbrengsten.

#### Geheugenfabricage: Micron, SK Hynix {#memory-fabrication-micron-sk-hynix-1}

AI-chips vereisen veel HBMs (High Bandwidth Memory), wat de meest geavanceerde geheugentype is.
Momenteel is de concurrentie in de high-end High Bandwidth Memory (HBM)-markt beperkt tot slechts een paar belangrijke spelers.
De productie van de meest moderne/krachtige varianten (HBM3 en HBM3E, die worden gebruikt in AI-versnellers, GPU's en HPC-toepassingen) wordt gedomineerd door:

- SK Hynix - De marktleider in HBM-productie, die Nvidia van HBM3 en HBM3E voorziet.
- Samsung - Een sterke concurrent die werkt aan het veiligstellen van contracten met Nvidia en andere AI-bedrijven.
- Micron - De derde grote speler, die in 2024 de productie van HBM3E opvoert om te concurreren met SK Hynix en Samsung.

Deze bedrijven gebruiken ook ASML's EUV-machines om hun HBMs te produceren.

#### AI-chipontwerp: Nvidia, AMD, Intel, Google, Apple {#ai-chip-design-nvidia-amd-intel-google-apple-1}

De beroemdste bedrijfsnamen op deze pagina zijn allemaal chipontwerpers.
En er zijn nieuwe bedrijven, zoals Cerebras en Groq, die chips specifiek voor AI ontwerpen.
Opmerkelijk is dat sommige van deze bedrijven relatief verouderde processen gebruiken om hun chips te produceren, zoals Groq die 14nm gebruikte, wat een potentieel knelpunt is voor governance.

### On-Chip Governance {#on-chip-governance-1}

- Het artikel ["Secure, Governable Chips"](https://www.cnas.org/publications/reports/secure-governable-chips) stelt een nieuwe aanpak voor AI-governance voor.
- **[Serverrapportage](https://www.lesswrong.com/posts/uSSPuttae5GHfsNQL/ai-compute-governance-verifying-ai-chip-location)**. Chips kunnen reageren op berichten van vertrouwde servers om te bewijzen dat ze zich binnen een bepaalde afstand van een vertrouwde locatie bevinden. Dit kan nauwkeurig zijn tot op tientallen kilometers.
- **[flexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf)**: Een nieuw type chip dat kan worden geprogrammeerd om zichzelf te vernietigen wanneer bepaalde voorwaarden worden voldaan. Dit is nog in de onderzoeksfase en kan nog lang duren om te ontwikkelen.
- **[Firmware-gebaseerde rapportage](https://arxiv.org/abs/2404.18308)**: Door een aangepaste firmware op GPU's te installeren, zouden gebruikers een licentie nodig hebben om de GPU voor meer dan x cycli te gebruiken. Dit is een meer nabije oplossing en kan binnen een jaar worden geïmplementeerd.

1. **[GPS-tracking](https://arxiv.org/abs/2408.16074)**: Door een aangepaste firmware op GPU's te installeren, zouden gebruikers een licentie nodig hebben om de GPU voor meer dan x cycli te gebruiken. Dit is een meer nabije oplossing en kan binnen een jaar worden geïmplementeerd.

### Verificatiemethoden - het voorkomen van grote trainingsruns {#verification-methods---preventing-large-training-runs-1}

Nu we verschillende knelpunten in de chipketen hebben geïdentificeerd, kunnen we beginnen met nadenken over hoe we grote trainingsruns kunnen voorkomen.
Deze eerder genoemde actoren kunnen worden onder druk gezet (door overheden) om ervoor te zorgen dat hun producten niet worden gebruikt voor gevaarlijke AI-trainingsruns.

Maar hoe kan dit worden geverifieerd?

Het artikel ["Verificatiemethoden voor internationale AI-overeenkomsten"](https://arxiv.org/abs/2408.16074) noemt verschillende opties:

1. **Remote Sensing**: Gebruikt satelliet- en infraroodbeeldvorming om datacentra te detecteren door visuele en thermische signaturen. Zeer haalbaar, maar beperkt door camouflage of ondergrondse faciliteiten.
2. **Klokkenluiders**: Vertrouwt op insiders die non-conformiteit melden, gestimuleerd door juridische en financiële bescherming. Haalbaar, maar afhankelijk van toegang en bereidheid van insiders om te onthullen.
3. **Energiemonitoring**: Volgt stroomverbruik om grote AI-operaties te identificeren, haalbaar als patronen duidelijk zijn. Haalbaarheid varieert; gegevens kunnen worden verhuld door andere activiteiten met hoog energieverbruik.
4. **Douanegegevensanalyse**: Monitort import/export van AI-hardware voor afwijkingen. Haalbaar, vooral voor import, hoewel landen met binnenlandse productie detectie kunnen vermijden.
5. **Financiële inlichtingen**: Observeert grote of ongebruikelijke transacties gerelateerd aan AI-hardware-aankopen. Haalbaar als financiële privacy en bankwetten toestaan, vaak het beste in combinatie met andere methoden.
6. **Datacentruminspecties**: Fysieke locatie-inspecties om naleving van hardwarelimieten en beveiligingsprotocollen te verifiëren. Effectief als het gastland akkoord gaat met inspecties; invasief en middelenintensief.
7. **Halfgeleiderproductiefaciliteitinspecties**: Verifieert chipproductieconformiteit door inspectie van faciliteiten met relevante hardware. Haalbaar, maar vereist aanzienlijke middelen en toestemming van het gastland.
8. **AI-ontwikkelaarinspecties**: Beoordeelt faciliteiten voor geautoriseerde code, veiligheidsprotocollen en AI-evaluatierapporten. Effectief, maar zeer invasief, vereist gespecialiseerde expertise en landelijke samenwerking.
9. **Chiplocatievolging**: Volgt AI-chipbewegingen om hun inzet te monitoren. Haalbaar met internationale overeenkomsten, maar kan worden omzeild door locatiegegevens uit te schakelen of te vervalsen.
10. **Chipgebaseerde rapportage**: Integreert rapportagemechanismen in chips om te waarschuwen als ze buiten geautoriseerde limieten worden gebruikt. Haalbaar, maar uitdagend, vereist internationale normen en hardwareontwikkeling; kan worden omzeild door firmware te wijzigen.

Elke methode heeft zijn sterke en zwakke punten, vaak vereist complementaire benaderingen of internationale samenwerking voor effectieve implementatie.

Een internationale instelling kan worden opgericht om deze verificatiemethoden te monitoren en de pauze af te dwingen.

## Softwaregovernance {#software-governance-1}

Fysieke chips zijn onze primaire focus, maar we willen ook de _software_ reguleren die wordt gebruikt om AI-modellen te trainen en uit te voeren.
Het is heel goed mogelijk dat de grootste rekenclusters voldoende kracht hebben om een catastrofaal gevaarlijk model te trainen, maar ze missen nog steeds de software.
Laten we dieper ingaan op de soorten software-innovaties die we kunnen onderscheiden.

### Software-innovaties {#software-innovations-1}

Ten eerste zijn er \_trainings_innovaties.
De Transformer-architectuur, bijvoorbeeld, stelde AI-modellen in staat om veel capabeler te zijn, tegen een veel lagere prijs.
Het op de Transformer gebaseerde ALBERT-model [overtrof](https://arxiv.org/pdf/2308.04950) het BERT-model, zelfs met 18x minder parameters.
In de toekomst kunnen we nog efficiëntere architecturen zien.
Er zijn ook innovaties in de gegevens die aan een model worden gevoerd.

Naast trainingsverbeteringen hebben we verschillende _runtime_-verbeteringen gezien.
Chain-of-thought, graph-of-thought en andere technieken kunnen drastische verbeteringen opleveren in de prestaties van AI-modellen.
Tools als AutoGPT kunnen eenvoudige chatbots omzetten in volledig autonome agenten die het web browsen, e-mails sturen en andere taken uitvoeren.
OpenAI's o1-model maakt grotere redeneercapaciteiten mogelijk door het model toe te staan meer tijd te besteden aan het denken over een antwoord voordat het wordt gegeven.

### Software reguleren {#regulating-software-1}

De softwarekant van AI is moeilijker te controleren dan de hardwarekant.
Software is slechts informatie - het kan gemakkelijk worden gekopieerd en verspreid.
Toch hebben we eerder informatie verboden.
Kinderpornografie, bijvoorbeeld, is illegaal om te maken, illegaal om te verspreiden en illegaal om te bezitten.
Dezelfde handhavingsmechanismen kunnen worden gebruikt om gevaarlijke AI-software te reguleren.

## Wat overheden kunnen doen om de pauzeknop te bouwen {#what-governments-can-do-to-build-the-pause-button-1}

1. **Pauzeknop-compatibele GPU-firmware ontwerpen**. De aanpak hiervoor wordt beschreven in [dit artikel](https://arxiv.org/abs/2404.18308).
2. **AI-chipontwerpers dwingen om hun firmware compatibel te maken**.
3. **Een licentieautoriteit oprichten**. Eén autoriteit moet verantwoordelijk zijn voor het uitgeven van licenties aan bedrijven die AI-chips willen gebruiken. Deze autoriteit beheert de cryptografische sleutels.
4. **In kaart brengen waar AI-chips nu zijn**. Lijst alle bedrijven en datacentra op die AI-chips hebben. Bel hen, en in de toekomst laat hen hun chips updaten naar compatibele firmware.
5. **Investeren in tamper-proof hardware & on-chip governance-technieken**. flexHEGs zijn een veelbelovende aanpak hier.

## Verder lezen {#further-reading-1}

- [Hardware-Enabled Governance Mechanisms](https://www.rand.org/pubs/working_papers/WRA3056-1.html)
- [Verificatiemethoden voor internationale AI-overeenkomsten](https://arxiv.org/abs/2408.16074)
- [Secure, Governable Chips](https://www.cnas.org/publications/reports/secure-governable-chips)
- [FlexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf)
- [Firmware-gebaseerde rapportage](https://arxiv.org/abs/2404.18308)
