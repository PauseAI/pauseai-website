---
title: Waarom we misschien eerder superintelligentie hebben dan de meeste mensen denken
description: We onderschatten de vooruitgang van AI, en er is een kleine maar realistische kans dat we heel dicht bij een superintelligentie zijn.
date: '2023-05-04'
---

Huidige [State-of-the-Art](/sota) AI-modellen zijn al superieur in veel domeinen, maar gelukkig niet in allemaal.
Als we superintelligentie bereiken voordat we het afstemmingsprobleem oplossen, [staan we voor een risico op uitsterven](/xrisk).
Het is dus essentieel om een geschatte periode te hebben wanneer we superintelligentie zouden kunnen hebben, om ervoor te zorgen dat we niet verrast worden.
Als onze voorspellingen te ver weg zijn, kunnen we mogelijk niet op tijd voorbereiden.

Maar hoe ver zijn we nog?
Wanneer zullen we superintelligentie hebben?
Het zou eerder kunnen zijn dan de meeste mensen denken.

## Samengestapelde exponentiële groei

AI-modellen vereisen algoritmen, data en chips.
Elk van deze componenten verbetert snel door enorme investeringen in AI.
De verbeteringen in elk van deze componenten zijn _samengestapeld_, wat leidt tot exponentiële groei in AI-capaciteiten.

- **Meer chips**. ChatGPT is getraind op [10.000](https://www.fierceelectronics.com/sensors/chatgpt-runs-10k-nvidia-training-gpus-potential-thousands-more) gespecialiseerde chips. Meta heeft [aangekondigd](https://www.datacenterdynamics.com/en/news/meta-to-operate-600000-gpus-by-year-end/) dat ze dit jaar 600.000 next-gen chips zullen hebben om hun volgende AI-modellen te trainen.
- **Snellere chips**. Elk jaar worden chips sneller door nieuwe architecturen en lithografie-innovaties. De chips die Meta gebruikt zijn 10x sneller dan de chips die voor ChatGPT zijn gebruikt. We zien ook zeer gespecialiseerde hardware zoals de Groq-chips, die [13x sneller](https://mezha.media/en/2024/02/22/groq-s-new-ai-chip-offers-to-increase-chatgpt-speed-by-13-times/) zijn dan de concurrentie. Op langere termijn zouden [ternaire architecturen](https://arxiv.org/pdf/2402.17764.pdf) of [fotonic chips](https://www.nature.com/articles/s41566-024-01394-2) chips zelfs nog sneller kunnen maken.
- **Meer data**. GPT3 is getraind op [45TB](https://community.openai.com/t/what-is-the-size-of-the-training-set-for-gpt-3/360896) aan tekst, GPT4 gebruikte ongeveer 20x zoveel. AI-bedrijven gebruiken nu ook [enorme hoeveelheden videodata](https://www.404media.co/nvidia-ai-scraping-foundational-model-cosmos-project/), audiogegevens en ze zijn zelfs [synthetische data aan het genereren om deze modellen te trainen](https://arxiv.org/pdf/2401.10020). Eerder werd het idee om synthetische data voor training te gebruiken als onmogelijk beschouwd vanwege modelinstorting, maar [recente vooruitgangen](https://arxiv.org/abs/2406.07515) tonen aan dat het mogelijk is om modelinstorting te voorkomen.
- **Betere data**. Het artikel "Textbooks are all you need" [toonde aan](https://arxiv.org/abs/2306.11644) dat het gebruik van hoogwaardige synthetische data de modelprestaties drastisch kan verbeteren, zelfs als er veel minder data en rekencapaciteit wordt gebruikt.
- **Betere algoritmen**. De Transformer-architectuur maakte de huidige LLM-revolutie mogelijk. Nieuwe architecturen kunnen vergelijkbare capaciteitsverhogingen mogelijk maken. Het Mamba-model, bijvoorbeeld, [toont](https://arxiv.org/abs/2312.00752) 5x snellere doorvoer.
- **Betere runtime**. Agentic runtimes, Retrieval Augmented Generation of zelfs gewoon slimme prompting (bijvoorbeeld via [Graph of Thought](https://arxiv.org/abs/2305.16582)) kunnen een enorme impact hebben op de capaciteiten van deze modellen.

Het is heel goed mogelijk dat _simply scaling up_ ons in een jaar of twee naar [gevaarlijke capaciteiten](/dangerous-capabilities) zal brengen, maar met al deze samengevoegde factoren zou het zelfs nog eerder kunnen zijn.

## We hebben in 2023 menselijke prestaties in veel domeinen bereikt

In 2022 dachten AI-onderzoekers dat het [17 jaar](https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/) zou duren voordat AI in staat zou zijn om een New York Times-bestseller te schrijven.
Een jaar later [won een Chinese professor een schrijfwedstrijd](https://www.scmp.com/news/china/science/article/3245725/chinese-professor-used-ai-write-science-fiction-novel-then-it-won-national-award) met een door AI geschreven boek.

Op Metaculus was [de gemeenschapsvoorspelling voor (zwakke) AGI](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) drie jaar geleden 2057, en nu is het ~~2027~~ 2026.

Laten we nu de definitie van AGI bekijken die in die enquête werd gebruikt:

- Score >90% in de Winograd Schema Challenge
- Score >75% in SAT-scores
- Een Turing-test doorstaan
- Montezuma's Revenge voltooien

GPT-4 scoort [94,4% op de Winograd Schema Challenge](https://d-kz.medium.com/evaluating-gpt-3-and-gpt-4-on-the-winograd-schema-challenge-reasoning-test-e4de030d190d), en [93% op het SAT-leestoets, 89% op de SAT-wiskundetoets](htthttps://www.cnbc.com/2023/03/14/openai-announces-gpt-4-says-beats-90percent-of-humans-on-sat.html).
Het heeft de Turing-test niet doorstaan, maar waarschijnlijk niet vanwege een gebrek aan capaciteiten.
Het is omdat GPT-4 is afgesteld om mensen niet te misleiden. Het is niet goed voor het bedrijf als je AI tegen mensen zegt dat het eigenlijk een persoon is.
Dat laat alleen Montezuma's Revenge over.
Het is niet ondenkbaar dat het kan worden voltooid door een slimme opstelling van GPT-4, waarbij iets als AutoGPT wordt gebruikt om het scherm te analyseren en de juiste invoer te genereren.
In mei 2023 was [GPT-4 in staat om code te schrijven om diamanten uitrusting in Minecraft te krijgen](https://the-decoder.com/minecraft-bot-voyager-programs-itself-using-gpt-4/).
Kortom: GPT-4 voldeed met zekerheid aan 2/4 criteria, met de andere twee binnen bereik.

**We zijn er, mensen.
We hebben al (zwakke) AGI.**
Het heeft ons geen 35 jaar gekost, maar drie.
We zaten er 10 keer naast.

## Waarom de meeste mensen de vooruitgang van AI onderschatten

Er zijn veel redenen waarom mensen de vooruitgang van AI onderschatten.

- **Het is moeilijk om bij te blijven**. Bijna dagelijks zien we nieuwe doorbraken in AI. Het is bijna onmogelijk om het tempo van de vooruitgang bij te houden. Je bent niet alleen als je het gevoel hebt dat je achterloopt.
- **We blijven de doelpalen verplaatsen**. In de jaren '90 dachten mensen dat de heilige graal van AI iets was dat schaak kon spelen. Toen AI Kasparov versloeg, was de volgende uitdaging Go. Nu hebben we machines die scoren in de [99,9e percentiel in IQ-tests](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/), kunnen [26 talen vertalen](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) en [fotografie wedstrijden winnen](https://www.scientificamerican.com/article/how-my-ai-image-won-a-major-photography-competition/), en toch stellen we nog steeds vragen zoals "Wanneer zal AI het menselijke niveau bereiken?". Het overtreft ons al in veel gebieden, maar we richten ons altijd op het steeds kleiner aantal dingen dat we nog beter kunnen doen.
- **We vinden het leuk om te denken dat we speciaal zijn**. Mensen vinden het fijn om te voelen dat we speciaal zijn. Als een AI kan doen wat wij kunnen, zijn we niet meer speciaal. Dit is een moeilijke pil om te slikken, en de [hersenen hebben veel verdedigingsmechanismen om dit te vermijden](psychology-of-x-risk).
- **We zijn echt slecht in exponentiële groei**. We hebben de neiging om structureel en voorspelbaar te onderschatten hoe exponentiële groei zich in de loop van de tijd ophoopt. Dit is aangetoond in [wetenschappelijke studies](https://www.researchgate.net/figure/Underestimation-of-exponential-growth-a-shows-the-participants-prediction-of-the_fig4_351171143).

Gelukkig zijn er nog steeds enkele dingen die een AI nog niet kan doen.
Het kan niet [beter hacken dan de beste hackers](/cybersecurity-risks), en het kan niet zo goed AI-onderzoek doen als de beste AI-onderzoekers.
**Wanneer we een van deze drempels bereiken, zullen we in een nieuw regime van verhoogd risico zijn**.

Dus wanneer zullen we het punt bereiken waarop een AI al deze dingen op een supermenselijk niveau kan doen?
Wanneer zullen we een _superintelligentie_ hebben?

## De Ilya-drempel

Ik denk dat het cruciale punt dat we moeten overwegen, **het punt is waarop een AI meer in staat is om AI-onderzoek te doen dan iemand zoals Ilya Sutskever** (voormalig hoofdwetenschapper bij OpenAI).
Een AI die betekenisvolle bijdragen kan leveren aan AI-algoritmen en architecturen, zal waarschijnlijk in staat zijn zichzelf te verbeteren.
Laten we dit punt van potentiële zelfverbetering de _Ilya-drempel_ noemen.
Wanneer het deze bereikt, kan een AI zichzelf verbeteren omdat het expliciet is opgedragen dit te doen, of omdat slimmer zijn een nuttig subdoel is voor andere doelen (AI's zijn [al hun eigen subdoelen aan het creëren](https://github.com/Significant-Gravitas/Auto-GPT)).
Deze iteraties kunnen weken duren (het trainen van GPT-3 duurde 34 dagen), maar het is ook mogelijk dat een soort runtime-verbetering wordt geïmplementeerd die aanzienlijke vooruitgang in enkele minuten mogelijk maakt: een [Intelligence Explosion](https://www.youtube.com/watch?v=5qfIgCiYlfY).

Dus hoe ver zijn we van de Ilya-drempel?
Het is fundamenteel moeilijk om te voorspellen [wanneer bepaalde capaciteiten opkomen](https://arxiv.org/abs/2206.07682) naarmate LLM's opschalen, maar tot nu toe hebben we veel capaciteiten gezien die eerder als ver weg werden beschouwd.
De [laatste AI-modellen](/sota) verslaan al de meeste menselijke programmeurs, dus het is niet ondenkbaar dat toekomstige modellen

Betere chips, meer data en betere algoritmen zullen allemaal bijdragen aan het bereiken van de Ilya-drempel.
We hebben geen idee hoe we zo'n AI moeten afstemmen (zelfs [OpenAI geeft dit toe](https://youtu.be/L_Guz73e6fw?t=1477)), en de gevolgen van het hebben van een niet-afgestemde superintelligentie zullen waarschijnlijk [catastrofaal](/xrisk) zijn.

## Actie

Anthropic mede-oprichter Ben Mann [gelooft](https://x.com/ai_ctrl/status/1819173703869255879/photo/0) dat er een kans van 30% is dat Claude 3 (hun nieuwste model) autonoom kan repliceren, gegeven fine-tuning en slimme prompting.
Ex-OpenAI-onderzoeker Daniel Kokotajlo denkt dat er een [15% kans](https://x.com/ai_ctrl/status/1819173703869255879/photo/0) is dat we AGI in 2024 zullen hebben.
Niemand weet zeker wanneer we de Ilya-drempel zullen bereiken.
Maar de [inzet is te hoog](/xrisk) om aan te nemen dat we veel tijd hebben.
We moeten actie ondernemen op de kleine kans dat we maanden verwijderd zijn.
We moeten [de ontwikkeling van grens-AI nu pauzeren](/proposal).
Het is aan ieder van ons om [actie te ondernemen](/action) en ervoor te zorgen dat we niet verrast worden.
