---
title: Regulering van gevaarlijke capaciteiten in AI
description: Hoe krachtiger AI wordt in specifieke domeinen, hoe groter de risico's worden. Hoe voorkomen we dat deze gevaarlijke capaciteiten ontstaan of zich verspreiden?
---

In dit artikel bespreken we:

- Welke AI-capaciteiten gevaarlijk kunnen zijn
- Hoe we kunnen voorkomen dat deze capaciteiten ontstaan of zich verspreiden
- Waarom het gevaarlijk is om te vertrouwen op evaluaties als beleidsmaatregel

Naarmate AI-modellen krachtiger en nuttiger worden, worden ze ook gevaarlijker.
Dus op welk punt moeten we voorzichtig zijn?
Een bepaalde drempel die vaak wordt genoemd, is AGI - of Kunstmatige Algemene Intelligentie.
Er is veel debat over wat AGI precies betekent.
Sommigen zeggen dat het is wanneer AI alle cognitieve taken kan uitvoeren die mensen kunnen.
Sommigen zeggen dat GPT-4 al AGI is.
Steve Wozniak definieert AGI als het eerste systeem dat een keuken kan binnengaan en een kop koffie kan zetten.

Vanuit een veiligheidsperspectief is de definitie van AGI niet zo belangrijk.
In feite kan het ons een vals gevoel van veiligheid geven, omdat we kunnen denken dat we veilig zijn totdat we AGI bereiken.
Zelfs als een AI geen kop koffie kan zetten, kan het nog steeds gevaarlijk zijn.
Wat belangrijk is, is _welke capaciteiten een AI heeft_.

In dit artikel duiken we in verschillende gevaarlijke capaciteiten en wat we kunnen doen om te voorkomen dat ze ons daadwerkelijk schaden.

## Welke capaciteiten kunnen gevaarlijk zijn? {#which-capabilities-can-be-dangerous}

- **Cyberbeveiliging**. Wanneer een AI in staat is om beveiligingskwetsbaarheden te ontdekken (vooral nieuwe, onbekende), kan het (worden gebruikt om) [in te breken in systemen](/cybersecurity-risks). Huidige [state-of-the-art](/sota) AI-systemen kunnen sommige beveiligingskwetsbaarheden vinden, maar nog niet op gevaarlijke, geavanceerde niveaus. Echter, naarmate de capaciteiten voor cyberbeveiliging toenemen, neemt ook de potentiële schade toe die een AI-gestuurde cyberaanval kan veroorzaken. Grote cyberaanvallen kunnen onze infrastructuur verstoren, betalingen uitschakelen en chaos veroorzaken.
- **Biologisch**. Het ontwerpen van nieuwe biologische agentia, of helpen bij het proces van het creëren van een pandemie. Een groep studenten was in staat om een chatbot te gebruiken om [alle stappen te produceren die nodig zijn om een nieuwe pandemie te creëren](https://arxiv.org/abs/2306.03809). Een AI die was ontworpen om veilige medicijnen te vinden, werd gebruikt om [40.000 nieuwe chemische wapens te ontdekken in zes uur](https://www.theverge.com/2022/3/17/22983197/ai-new-possible-chemical-weapons-generative-models-vx).
- **Algoritmische verbeteringen**. Een AI die efficiënte algoritmes kan vinden voor een bepaald probleem, kan leiden tot een recursieve lus van zelfverbetering, die snel uit de hand loopt. Dit wordt een _intelligentie-explosie_ genoemd. De resulterende AI zou ongelooflijk krachtig zijn en allerlei andere gevaarlijke capaciteiten kunnen hebben. Gelukkig kan geen enkele AI zichzelf nog verbeteren. Echter, er zijn AI's die nieuwe, zeer efficiënte algoritmes kunnen vinden (zoals [AlphaDev](https://www.deepmind.com/blog/alphadev-discovers-faster-sorting-algorithms)).
- **Misleiding**. De mogelijkheid om mensen te manipuleren, wat sociale manipulatie omvat. Verschillende vormen van misleiding zijn [al aanwezig](https://lethalintelligence.ai/post/ai-hired-human-to-solve-captcha/) in huidige AI-systemen. Bijvoorbeeld, Meta's CICERO AI (die was getraind om te leiden tot "betere, meer natuurlijke AI-menselijke samenwerking") bleek een expert in het liegen te zijn, andere agenten in het spel te misleiden. Een AI die mensen kan misleiden, kan mensen misleiden tijdens trainingsruns. Het kan zijn capaciteiten of intenties verbergen.
- **Zelfreplicatie**. Als een AI nieuwe instanties op andere machines kan creëren, is er een risico dat het zich ongecontroleerd verspreidt, wat kan leiden tot een [_AI-overname_](/ai-takeover). Een voldoende capabele AI kan mensen overtreffen en leiden tot [menselijke uitsterving](/xrisk). Houd er rekening mee dat dit zelfs kan gebeuren voordat een AI-model wordt ingezet.

Deze lijst is niet uitputtend, dus er zijn andere gevaarlijke capaciteiten die een AI kan hebben.

## Voorkomen van het ontstaan van gevaarlijke capaciteiten {#preventing-creation-of-dangerous-capabilities}

Kunnen we het ontstaan van deze gevaarlijke capaciteiten voorkomen?
Naarmate AI's groter worden en op meer gegevens worden getraind, verkrijgen ze nieuwe capaciteiten.
Het blijkt heel moeilijk te zijn om te voorspellen welke capaciteiten zullen ontstaan en hoe goed een AI zal presteren.
Daarom worden ze vaak _emergente capaciteiten_ genoemd.

Ons huidige paradigma van grote taalmodellen is bijna inherent onvoorspelbaar.
AI-modellen worden niet geschreven als software - ze worden getraind.
Ze zijn zwarte dozen die bestaan uit miljarden numerieke parameters.
Niemand weet echt wat er binnenin gebeurt.
Deze onvoorspelbaarheid maakt het moeilijk om te zeggen of een trainingsrun zal resulteren in een gevaarlijke AI.
Onderzoek naar interpretatie kan dit in de toekomst veranderen, maar voorlopig kunnen we niet echt uitleggen waarom een AI doet wat het doet.

Dus het voorkomen van het ontstaan van gevaarlijke capaciteiten kan in de praktijk alleen op één manier worden gedaan:
niet steeds krachtigere AI-systemen bouwen in de eerste plaats.
Dit zou de veiligste manier zijn, maar dat is niet wat AI-labs voorstellen.

## Voorkomen van de verspreiding van gevaarlijke capaciteiten {#preventing-the-proliferation-of-dangerous-capabilities}

Op dit moment gebeurt er veel in de ruimte van AI-regulering.
Veel van deze voorstellen (inclusief alle voorstellen van AI-labs) vertrouwen op veiligheidsevaluaties (of _evals_): pre-deployment testing van AI-modellen.
Een voorbeeld van deze eval-gebaseerde benaderingen is de [RSP-benadering van Anthropic](https://evals.alignment.org/blog/2023-09-26-rsp/#:~:text=An%20RSP%20specifies%20what%20level,capabilities%20until%20protective%20measures%20improve.) of de [Coordinated Pausing](https://www.governance.ai/research-paper/coordinated-pausing-evaluation-based-scheme) benadering van GovAI.
We noemen deze [niveau 2 regulering](/4-levels-of-ai-regulation).
Deze evaluaties voorkomen niet dat gevaarlijke AI's worden _gemaakt_, maar ze voorkomen wel dat ze worden _ingeschakeld_.
Dit type beleid is relatief goedkoop en laat AI-labs toe om hun onderzoek voort te zetten.
Echter, wij geloven dat deze benadering heel gevaarlijk is:

- **Modellen kunnen worden gelekt**.
  We zagen dit gebeuren met Meta's LLAMA-model. Zodra het eruit is, is er geen weg terug.
- **Sommige capaciteiten zijn zelfs gevaarlijk binnen AI-labs**.
  Een zelfreplicerende AI, bijvoorbeeld, kan [ontsnappen uit het lab voordat het wordt ingezet](https://lethalintelligence.ai/post/ai-escaped-its-container/).
- **Testen op gevaarlijke capaciteiten is moeilijk**.
  We weten niet hoe we (veilig) kunnen testen of een AI zichzelf kan repliceren, bijvoorbeeld. Of hoe we kunnen testen of het mensen misleidt
- **Capaciteiten kunnen worden toegevoegd of ontdekt na training**.
  Dit omvat fine-tuning, jailbreaking en runtime verbeteringen.

We zullen dieper ingaan op dit laatste punt.

## Capaciteiten kunnen worden toegevoegd na training {#capabilities-can-be-added-after-training}

### Fine-tuning {#fine-tuning}

Fine-tuning kan worden gebruikt om de capaciteiten van een bestaand AI-model te verbeteren.
Dit is vergelijkbaar met training, maar het is veel sneller, veel goedkoper, vereist minder gegevens en kan vaak worden gedaan op consumentenhardware.
Fine-tuning verandert de parameters van de AI en verandert dus zijn capaciteiten.
Nu is fine-tuning niet zo krachtig als een volledige trainingsrun, maar het kan nog steeds bestaande capaciteiten verbeteren.

### Jailbreaking {#jailbreaking}

De grootste AI's worden getraind op absoluut enorme hoeveelheden gegevens.
De meeste boeken, wetenschappelijke artikelen en websites op internet.
Er zit veel lelijks in deze datasets.
AI's worden vaak gefinetuned met behulp van een techniek genaamd RLHF (Reinforcement Learning from Human Feedback) om ze behulpzaam en aardig te maken.
In dit proces moet de AI leren om bepaalde dingen niet te zeggen, zoals racistische opmerkingen, uitleggen hoe je een bom moet maken of hoe je een nieuw biowapen moet creëren.

Maar deze waarborgen zijn niet perfect.
Zogenaamde "jailbreaking" is een techniek waarbij je probeert de AI te laten negeren deze waarborgen.
Dit kan worden gedaan door [specifieke woorden of tekens toe te voegen aan je chatbericht](https://twitter.com/AIPanicLive/status/1678942758872989696), of door [creatief je bericht te herschrijven](https://twitter.com/_annieversary/status/1647865782741749760).
Het is [onduidelijk](https://llm-attacks.org/) of dergelijk gedrag ooit volledig kan worden gepatcht.

### Runtime verbeteringen {#runtime-improvements}

Runtime verbeteringen maken geen veranderingen aan het model, maar verbeteren in plaats daarvan de manier waarop het model wordt gebruikt.

De eenvoudigste hiervan is om de prompts te veranderen.
Zelfs kleine veranderingen in prompts kunnen een groot effect hebben op de output van het model.
Het toevoegen van een paar woorden aan een prompt kan de prestaties [met meer dan 50% verbeteren](https://arxiv.org/pdf/2309.03409.pdf).

Maar we kunnen ook allerlei software gebruiken om een basis model te verbeteren.
Bijvoorbeeld, mensen hebben manieren gevonden om een langetermijngeheugen toe te voegen aan GPT-4, door het model een database te laten raadplegen.
Of overweeg AutoGPT, dat een model zichzelf recursief laat aanroepen, wat betekent dat het autonoom kan draaien voor een willekeurige lengte van tijd.
Of overweeg [Voyager](https://arxiv.org/abs/2305.16291), een tool die GPT-4 in staat stelde om Minecraft volledig autonoom te spelen. Het kreeg zelfs diamanten uitrusting.

We weten niet hoe ver een basis model kan worden uitgerekt.
Zelfs als we nu stoppen met het trainen van nieuwe AI-modellen, zullen we waarschijnlijk belangrijke innovaties zien die nieuwe capaciteiten toevoegen aan bestaande modellen.

## Conclusie {#in-conclusion}

Gevaarlijke capaciteiten van AI kunnen leiden tot allerlei problemen: grootschalige cyberaanvallen, gemanipuleerde pandemieën en rogue AI die [de overhand neemt](/ai-takeover).
Het is verleidelijk om te vertrouwen op evaluaties om deze gevaarlijke capaciteiten te voorkomen of te verspreiden, maar dit is een gevaarlijke benadering:

- Zelfs als we modellen testen voordat ze worden ingezet, zijn er nog steeds manieren waarop ze gevaarlijke capaciteiten kunnen krijgen na inzet (fine-tuning, jailbreaking, runtime verbeteringen).
- Modellen kunnen worden gelekt.
- Sommige capaciteiten zijn zelfs gevaarlijk binnen AI-labs.

De enige veilige optie is om deze krachtige AI-systemen niet te bouwen in de eerste plaats.
We moeten niet toestaan dat deze onvoorspelbare, potentieel zeer gevaarlijke AI-systemen worden gemaakt.
[Helaas voorkomt geen enkel ontwerpvoorstel op dit moment daadwerkelijk of vertraagt superintelligente AI.](https://twitter.com/PauseAI/status/1704998018322141496)
Daarom roepen we op tot een [Pauze](/proposal)!
