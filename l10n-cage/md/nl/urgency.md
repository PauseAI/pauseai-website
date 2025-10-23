---
title: Waarom we mogelijk eerder superintelligentie hebben dan de meesten denken
description: We onderschatten de vooruitgang van AI, en er is een kleine maar realistische kans dat we heel dicht bij superintelligentie zijn.
date: '2023-05-04'
---

Huidige [state-of-the-art](/sota) AI-modellen zijn al bovenmenselijk in veel domeinen, maar gelukkig niet in alle.
Als we superintelligentie bereiken voordat we het afstemmingsprobleem oplossen, [lopen we het risico van uitsterven](/xrisk).
Het hebben van een geschatte termijn voor wanneer we superintelligentie kunnen hebben, is essentieel om ervoor te zorgen dat we niet worden verrast.
Als onze voorspellingen te ver af liggen, kunnen we misschien niet op tijd voorbereid zijn.

Maar hoe ver zijn we af?
Wanneer zullen we superintelligentie hebben?
Het kan eerder zijn dan de meesten denken.

## Samenstelling van exponentiële groei {#compounding-exponential-growth}

AI-modellen hebben algoritmes, gegevens en chips nodig.
Elk van deze componenten verbetert snel dankzij enorme investeringen in AI.
De verbeteringen in elk van deze componenten zijn _cumulatief_, wat leidt tot exponentiële groei in AI-mogelijkheden.

- **Meer chips**. ChatGPT werd getraind op [10.000](https://www.fierceelectronics.com/sensors/chatgpt-runs-10k-nvidia-training-gpus-potential-thousands-more) gespecialiseerde chips. Meta heeft [aangekondigd](https://www.datacenterdynamics.com/en/news/meta-to-operate-600000-gpus-by-year-end/) dat ze dit jaar 600.000 next-gen chips zullen hebben om hun volgende AI-modellen te trainen.
- **Snellere chips**. Elk jaar worden chips sneller dankzij nieuwe architectuur en lithografie-innovaties. De chips die Meta gebruikt, zijn 10x sneller dan de chips die voor ChatGPT werden gebruikt. We zien ook zeer gespecialiseerde hardware zoals de Groq-chips, die [13x sneller](https://mezha.media/en/2024/02/22/groq-s-new-ai-chip-offers-to-increase-chatgpt-speed-by-13-times/) zijn dan de concurrentie. Op een langere termijn kunnen [ternary architecturen](https://arxiv.org/pdf/2402.17764.pdf) of [fotonische chips](https://www.nature.com/articles/s41566-024-01394-2) chips nog sneller maken.
- **Meer gegevens**. GPT3 werd getraind op [45TB](https://community.openai.com/t/what-is-the-size-of-the-training-set-for-gpt-3/360896) aan tekst, GPT4 gebruikte ongeveer 20x zoveel. AI-bedrijven gebruiken nu ook [enorme hoeveelheden videogegevens](https://www.404media.co/nvidia-ai-scraping-foundational-model-cosmos-project/), audio-gegevens en ze genereren zelfs [synthetische gegevens om deze modellen te trainen](https://arxiv.org/pdf/2401.10020). Eerder werd het idee van het gebruik van synthetische gegevens voor training als onmogelijk beschouwd vanwege modelinstorting, maar [recente vooruitgang](https://arxiv.org/abs/2406.07515) laat zien dat het voorkomen van modelinstorting mogelijk is.
- **Betere gegevens**. Het "Textbooks are all you need"-paper [liet zien](https://arxiv.org/abs/2306.11644) dat het gebruik van hoogwaardige synthetische gegevens de prestaties van het model drastisch kan verbeteren, zelfs als er veel minder gegevens en rekenkracht worden gebruikt.
- **Betere algoritmes**. De Transformer-architectuur maakte de huidige LLM-revolutie mogelijk. Nieuwe architectuur kan soortgelijke capaciteitsstappen mogelijk maken. Het Mamba-model, bijvoorbeeld, [laat zien](https://arxiv.org/abs/2312.00752) dat het 5x snellere doorvoer heeft.
- **Betere runtimes**. Agentic runtimes, Retrieval Augmented Generation of zelfs gewoon slimme prompting (via [Graph of Thought](https://arxiv.org/abs/2305.16582), bijvoorbeeld) kan een enorme impact hebben op de mogelijkheden van deze modellen.

Het is helemaal mogelijk dat _het gewoon opschalen_ ons binnen een jaar of twee naar [gevaarlijke capaciteiten](/dangerous-capabilities) brengt, maar met al deze cumulatieve factoren kan het nog eerder zijn.

## We bereikten menselijk niveau in veel domeinen in 2023 {#we-reached-human-level-performance-in-many-domains-in-2023}

In 2022 dachten AI-onderzoekers dat het [17 jaar](https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/) zou duren voordat AI in staat zou zijn om een New York Times-bestseller te schrijven.
Een jaar later won een Chinese professor [een schrijfwedstrijd](https://www.scmp.com/news/china/science/article/3245725/chinese-professor-used-ai-write-science-fiction-novel-then-it-won-national-award) met een door AI geschreven boek.

Op Metaculus was [de gemeenschappelijke voorspelling voor (zwakke) AGI](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) drie jaar geleden 2057, en nu is het ~~2027~~ 2026.

Laten we nu eens kijken naar de definitie van AGI die in die enquête wordt gebruikt:

- Score >90% in de Winograd Schema Challenge
- Score >75% in SAT-scores
- Slaag voor een Turing-test
- Voltooi Montezuma's Revenge

GPT-4 scoort [94,4% op de Winograd Schema Challenge](https://d-kz.medium.com/evaluating-gpt-3-and-gpt-4-on-the-winograd-schema-challenge-reasoning-test-e4de030d190d) en [93% op de SAT-leesexamens, 89% op de SAT-wiskunde-examens](https://www.cnbc.com/2023/03/14/openai-announces-gpt-4-says-beats-90percent-of-humans-on-sat.html).
Het is niet geslaagd voor de Turing-test, maar waarschijnlijk niet vanwege een gebrek aan capaciteiten.
Het is omdat GPT-4 is afgestemd om mensen niet te misleiden. Het is niet goed voor het bedrijf als je AI mensen vertelt dat het eigenlijk een persoon is.
Dat laat alleen Montezuma's Revenge over.
Het is niet ondenkbaar dat het kan worden voltooid door een slimme opstelling van GPT-4, met behulp van iets als AutoGPT om het scherm te analyseren en de juiste invoer te genereren.
In mei 2023 was [GPT-4 in staat om code te schrijven om diamantuitrusting te krijgen in Minecraft](https://the-decoder.com/minecraft-bot-voyager-programs-itself-using-gpt-4/).
In het kort: GPT-4 heeft 2/4 criteria met zekerheid, met de andere twee binnen handbereik.

**We zijn er, mensen.
We hebben al (zwakke) AGI.**
Het duurde ons niet 35 jaar, het duurde ons drie.
We zaten er een factor 10 naast.

## Waarom de meesten de vooruitgang van AI onderschatten {#why-most-underestimate-the-progress-of-ai}

Er zijn veel redenen waarom mensen de vooruitgang van AI onderschatten.

- **Het is moeilijk om bij te houden**. Bijna dagelijks zien we nieuwe doorbraken in AI. Het is bijna onmogelijk om de voortgang bij te houden. Je bent niet alleen als je het gevoel hebt dat je achterop raakt.
- **We blijven de doelpalen verplaatsen**. In de jaren 90 dachten mensen dat de heilige graal van AI iets was dat schaken kon spelen. Toen AI Kasparov versloeg, was de volgende uitdaging Go. Nu hebben we machines die scoren in de [99,9e percentiel in IQ-tests](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/), kunnen [26 talen vertalen](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) en [fotowedstrijden winnen](https://www.scientificamerican.com/article/how-my-ai-image-won-a-major-photography-competition/), maar we vragen nog steeds vragen als "Wanneer zal AI menselijk niveau bereiken?". Het overtreft ons al in veel gebieden, maar we richten ons altijd op het steeds kleinere aantal dingen dat we nog beter kunnen.
- **We vinden het moeilijk om onze eigen superioriteit los te laten**. Mensen vinden het moeilijk om te accepteren dat ze niet uniek zijn. Als een AI iets kan doen wat wij kunnen, zijn we niet meer uniek. Dit is een moeilijke pil om te slikken, en [onze hersenen hebben veel verdedigingsmechanismen om dit te vermijden](psychology-of-x-risk).
- **We zijn slecht in het inschatten van exponentiële groei**. We hebben de neiging om structureel en voorspelbaar de cumulatieve effecten van exponentiële groei te onderschatten. Dit is aangetoond in [wetenschappelijke studies](https://www.researchgate.net/figure/Underestimation-of-exponential-growth-a-shows-the-participants-prediction-of-the_fig4_351171143).

Gelukkig zijn er nog enkele dingen die een AI nog niet kan doen.
Het kan [niet beter hacken dan de beste hackers](/cybersecurity-risks), en het kan geen AI-onderzoek doen dat even goed is als dat van de beste AI-onderzoekers.
**Als we een van deze drempels bereiken, zullen we ons in een nieuw regime van verhoogd risico bevinden**.

Dus wanneer zullen we het punt bereiken waarop een AI alle dingen op een supermenselijk niveau kan doen?
Wanneer zullen we een _superintelligentie_ hebben?

## De Ilya-drempel {#the-ilya-threshold}

Ik denk dat het cruciale punt dat we moeten overwegen, **het punt is waarop een AI beter is in AI-onderzoek dan iemand als Ilya Sutskever** (voormalig hoofdwetenschapper bij OpenAI).
Een AI die zinvolle bijdragen kan leveren aan AI-algoritmes en -architecturen, zal waarschijnlijk in staat zijn om zichzelf te verbeteren.
Laten we dit punt van mogelijke zelfverbetering de _Ilya-drempel_ noemen.
Als het deze drempel bereikt, kan een AI zichzelf verbeteren omdat het expliciet is geprogrammeerd om dit te doen, of omdat het slim is om slimmer te zijn als subdoel voor andere doelen (AI's zijn [al in staat om hun eigen subdoelen te creëren](https://github.com/Significant-Gravitas/Auto-GPT)).
Deze iteraties kunnen weken duren (het trainen van GPT-3 duurde 34 dagen), maar het is ook mogelijk dat een bepaald type runtime-verbetering wordt geïmplementeerd die significante vooruitgang mogelijk maakt in een kwestie van minuten: een [Intelligence Explosion](https://www.youtube.com/watch?v=5qfIgCiYlfY).

Dus hoe ver zijn we verwijderd van de Ilya-drempel?
Het is fundamenteel moeilijk om te voorspellen [wanneer bepaalde capaciteiten zullen ontstaan](https://arxiv.org/abs/2206.07682) als LLM's worden opgeschaald, maar tot nu toe hebben we veel capaciteiten zien ontstaan die eerder als ver weg werden beschouwd.
De [laatste AI-modellen](/sota) verslaan al de meeste menselijke programmeurs, dus het is niet ondenkbaar dat toekomstige modellen, betere chips, meer gegevens en betere algoritmes allemaal zullen bijdragen aan het bereiken van de Ilya-drempel.
We hebben geen idee hoe we zo'n AI moeten afstemmen (zelfs [OpenAI geeft dit toe](https://youtu.be/L_Guz73e6fw?t=1477)), en de gevolgen van een mislukte superintelligentie zullen waarschijnlijk [catastrofaal](/xrisk) zijn.

## Handel {#act}

Anthropic-co-oprichter Ben Mann [denkt](https://x.com/ai_ctrl/status/1819173703869255879/photo/0) dat er een kans van 30% is dat Claude 3 (hun laatste model) autonoom kan repliceren, gegeven fine-tuning en slimme prompting.
Ex-OpenAI-onderzoeker Daniel Kokotajlo denkt dat er een [kans van 15%](https://x.com/ai_ctrl/status/1819173703869255879/photo/0) is dat we AGI zullen hebben in 2024.
Niemand weet zeker wanneer we de Ilya-drempel zullen bereiken.
Maar de [inzet is te hoog](/xrisk) om aan te nemen dat we veel tijd hebben.
We moeten handelen op de kleine kans dat we binnen enkele maanden kunnen zijn.
We moeten [de ontwikkeling van grensverleggende AI pauzeren](/proposal) nu.
Het is aan ons allemaal om [actie te ondernemen](/action) en ervoor te zorgen dat we niet worden verrast.
