---
title: Het reguleren van gevaarlijke capaciteiten in AI
description: Hoe krachtiger AI wordt in specifieke domeinen, hoe groter de risico's worden. Hoe voorkomen we dat deze gevaarlijke capaciteiten verschijnen of zich verspreiden?
---

In dit artikel bespreken we:

- Welke AI-capaciteiten gevaarlijk kunnen zijn
- Hoe we kunnen voorkomen dat deze capaciteiten verschijnen of zich verspreiden
- Waarom het gevaarlijk is om op evaluaties te vertrouwen als beleidsmaatregel

Naarmate AI-modellen krachtiger en nuttiger worden, worden ze ook gevaarlijker.
Dus op welk punt moeten we voorzichtig zijn?
Een specifieke drempel die vaak wordt genoemd, is AGI - of Artificial General Intelligence.
Er is veel debat over wat AGI precies betekent.
Sommigen zeggen dat het is wanneer AI alle cognitieve taken kan uitvoeren die mensen kunnen.
Sommigen zeggen dat GPT-4 al AGI is.
Steve Wozniak definieert AGI als het eerste systeem dat een keuken kan binnenlopen en een kop koffie kan zetten.

Vanuit een veiligheidsperspectief is de definitie van AGI niet zo belangrijk.
In feite kan het ons een valse indruk van veiligheid geven, omdat we zouden kunnen denken dat we veilig zijn totdat we AGI bereiken.
Zelfs als een AI geen kop koffie kan zetten, kan het nog steeds gevaarlijk zijn.
Wat belangrijk is, is _welke capaciteiten een AI heeft_.

In dit artikel duiken we in verschillende gevaarlijke capaciteiten en wat we kunnen doen om te voorkomen dat ze ons daadwerkelijk schaden.

## Welke capaciteiten kunnen gevaarlijk zijn?

- **Cybersecurity**. Wanneer een AI in staat is om beveiligingskwetsbaarheden te ontdekken (vooral nieuwe, onbekende), kan het (worden gebruikt om te) [inbreken in systemen](/cybersecurity-risks). Huidige [state-of-the-art](/sota) AI-systemen kunnen enkele beveiligingskwetsbaarheden vinden, maar nog niet op gevaarlijke, geavanceerde niveaus. Echter, naarmate de cybersecurity-capaciteiten toenemen, neemt ook de potentiële schade die een AI-ondersteunde cyberwapen kan aanrichten toe. Grootschalige cyberaanvallen kunnen onze infrastructuur verstoren, betalingen uitschakelen en chaos veroorzaken.
- **Biologisch**. Nieuwe biologische agenten ontwerpen of helpen bij het proces van het creëren van een pandemie. Een groep studenten was in staat om een chatbot te gebruiken om [alle stappen te produceren die nodig zijn om een nieuwe pandemie te creëren](https://arxiv.org/abs/2306.03809). Een AI die is ontworpen om veilige medicijnen te vinden, werd gebruikt om [40.000 nieuwe chemische wapens in zes uur te ontdekken](https://www.theverge.com/2022/3/17/22983197/ai-new-possible-chemical-weapons-generative-models-vx).
- **Algoritmische verbeteringen**. Een AI die efficiënte algoritmen voor een gegeven probleem kan vinden, kan leiden tot een recursieve lus van zelfverbetering, die snel uit de hand kan lopen. Dit wordt een _intelligentie-explosie_ genoemd. De resulterende AI zou ongelooflijk krachtig zijn en allerlei andere gevaarlijke capaciteiten kunnen hebben. Gelukkig kan geen enkele AI zich nog zelf verbeteren. Er zijn echter AIs die nieuwe, zeer efficiënte algoritmen kunnen vinden (zoals [AlphaDev](https://www.deepmind.com/blog/alphadev-discovers-faster-sorting-algorithms)).
- **Misleiding**. Het vermogen om mensen te manipuleren, wat sociale engineering omvat. Verschillende vormen van misleiding zijn [al aanwezig](https://twitter.com/DanHendrycks/status/1699437800301752332) in huidige AI-systemen. Bijvoorbeeld, Meta's CICERO AI (dat was getraind om te leiden tot "Betere, natuurlijkere AI-menselijke samenwerking") bleek een expert leugenaar te zijn, die andere agenten in het spel misleidde. Een AI die mensen kan misleiden, kan mensen misleiden tijdens trainingsruns. Het kan zijn capaciteiten of intenties verbergen.
- **Zelf-replicatie**. Als een AI nieuwe instanties op andere machines kan creëren, bestaat het risico dat het zich ongecontroleerd verspreidt, wat kan leiden tot een [_AI-overname_](/ai-takeover). Een voldoende capabele AI zou mensen kunnen overtreffen en leiden tot [menselijke uitsterving](/xrisk). Merk op dat dit zelfs kan gebeuren voordat een AI-model wordt ingezet.

Deze lijst is niet uitputtend, dus er zijn andere gevaarlijke capaciteiten die een AI zou kunnen hebben.

## Voorkomen van de creatie van gevaarlijke capaciteiten

Kunnen we voorkomen dat deze gevaarlijke capaciteiten verschijnen?
Naarmate AIs groter worden en op meer data worden getraind, verwerven ze nieuwe vaardigheden.
Het blijkt erg moeilijk te voorspellen welke vaardigheden zullen verschijnen en hoe goed een AI zal presteren.
Om deze reden worden ze vaak _Emergent Capabilities_ genoemd.

Onze huidige paradigma van grote taalmodellen is bijna inherent onvoorspelbaar.
AI-modellen worden niet geschreven zoals software - ze worden getraind.
Ze zijn zwarte dozen die bestaan uit miljarden numerieke parameters.
Niemand weet echt wat er binnenin gebeurt.
Deze onvoorspelbaarheid maakt het moeilijk om te zeggen of een trainingsrun zal resulteren in een gevaarlijke AI.
Onderzoek naar interpretatie kan dit in de toekomst veranderen, maar op dit moment kunnen we niet echt uitleggen waarom AI doet wat het doet.

Dus het voorkomen van de creatie van gevaarlijke capaciteiten kan praktisch alleen op één manier worden gedaan:
bouw in de eerste plaats geen steeds krachtigere AI-systemen.
Dit zou de veiligste manier zijn, maar dat is niet wat AI-laboratoria voorstellen.
Voorkomen van de proliferatie van gevaarlijke capaciteiten

Op dit moment gebeurt er veel op het gebied van AI-regulering.
Veel van deze voorstellen (inclusief alle voorstellen van AI-laboratoria) zijn afhankelijk van veiligheids **evaluaties** (of _evals_): pre-deployment testen van AI-modellen.
Een voorbeeld van deze eval-gebaseerde benaderingen is de [RSP-aanpak van Anthropic](https://evals.alignment.org/blog/2023-09-26-rsp/#:~:text=An%20RSP%20specifies%20what%20level,capabilities%20until%20protective%20measures%20improve.) of de [Gecoördineerde Pauze](https://www.governance.ai/research-paper/coordinated-pausing-evaluation-based-scheme) aanpak van GovAI.
We verwijzen naar deze als [niveau 2 regulering](/4-levels-of-ai-regulation).
Deze evaluaties voorkomen niet dat gevaarlijke AIs _worden gecreëerd_, maar ze voorkomen wel dat ze _worden ingezet_.
Dit type beleid is relatief goedkoop en het staat AI-laboratoria nog steeds toe om hun onderzoek voort te zetten.
Echter, wij geloven dat deze aanpak zeer gevaarlijk is:

- **Modellen kunnen worden gelekt**.
  We hebben dit gezien met Meta's LLAMA-model. Zodra het daarbuiten is, is er geen weg meer terug.
- **Sommige capaciteiten zijn zelfs gevaarlijk binnen AI-laboratoria**.
  Een zelf-replicerende AI, bijvoorbeeld, zou uit het lab kunnen ontsnappen voordat deze wordt ingezet.
- **Testen op gevaarlijke capaciteiten is moeilijk**.
  We weten niet hoe we (veilig) kunnen testen of een AI zich zelf kan repliceren, bijvoorbeeld. Of hoe te testen of het mensen misleidt.
- **Capaciteiten kunnen worden toegevoegd of ontdekt na training**.
  Dit omvat fine-tuning, jailbreaking en runtime verbeteringen.

We zullen dit laatste punt in meer detail bespreken.

## Capaciteiten kunnen worden toegevoegd na training

### Fine-tuning

Fine-tuning kan worden gebruikt om de capaciteiten van een bestaand AI-model te verbeteren.
Dit is vergelijkbaar met trainen, maar het is veel sneller, veel goedkoper, vereist niet zoveel data en kan vaak op consumentenhardware worden gedaan.
Fine-tuning verandert de parameters van de AI, en verandert daarmee zijn capaciteiten.
Nu is fine-tuning niet zo krachtig als een volledige trainingsronde, maar het kan nog steeds bestaande capaciteiten verbeteren.

### Jailbreaking

De grootste AIs worden getraind op absoluut enorme hoeveelheden data.
De meeste boeken, wetenschappelijke artikelen en websites op het internet.
Er zit veel ongewenst spul in deze datasets.
AIs worden vaak gefinetuned met een techniek die RLHF (Reinforcement Learning from Human Feedback) wordt genoemd om ze behulpzaam en vriendelijk te maken.
In dit proces moet de AI leren bepaalde dingen niet te zeggen, zoals racistische opmerkingen maken, uitleggen hoe je een bom maakt of hoe je een nieuw biowapen creëert.

Maar deze waarborgen zijn niet perfect.
Zogenaamde "jailbreaking" is een techniek waarbij je probeert de AI deze waarborgen te laten negeren.
Dit kan worden gedaan door [bepaalde woorden of tekens aan je chatbericht toe te voegen](https://twitter.com/AIPanicLive/status/1678942758872989696), of door [creatief je bericht te herformuleren](https://twitter.com/_annieversary/status/1647865782741749760).
Het is [onduidelijk](https://llm-attacks.org/) of dergelijk gedrag ooit volledig kan worden gepatcht.

### Runtime verbeteringen

Runtime verbeteringen brengen geen wijzigingen aan in het model, maar verbeteren in plaats daarvan de manier waarop het model wordt gebruikt.

De eenvoudigste hiervan is om de prompts te veranderen.
Zelfs kleine wijzigingen in prompts kunnen een groot effect hebben op de output van het model.
Het toevoegen van een paar woorden aan een prompt kan de prestaties [met meer dan 50% verbeteren](https://arxiv.org/pdf/2309.03409.pdf).

Maar we kunnen ook allerlei software gebruiken om een basis model te augmenteren.
Bijvoorbeeld, mensen hebben manieren gevonden om langetermijngeheugen toe te voegen aan GPT-4, door het model een database te laten raadplegen.
Of overweeg AutoGPT, dat een model in staat stelt zichzelf recursief aan te roepen, wat betekent dat het autonoom kan draaien voor elke lengte van tijd.
Of overweeg [Voyager](https://arxiv.org/abs/2305.16291), een tool die GPT-4 in staat stelde om volledig autonoom Minecraft te spelen. Het bereikte zelfs diamantenuitrusting.

We weten niet hoe ver een basis model kan worden uitgerekt.
Zelfs als we nu stoppen met het trainen van nieuwe AI-modellen, zullen we waarschijnlijk belangrijke innovaties zien die nieuwe capaciteiten aan bestaande modellen toevoegen.

## Conclusie

Gevaarlijke capaciteiten van AI kunnen leiden tot allerlei problemen: grootschalige cyberaanvallen, gecreëerde pandemieën en rogue AI die [de overname neemt](/ai-takeover).
Het is verleidelijk om op evaluaties te vertrouwen om te voorkomen dat deze gevaarlijke capaciteiten verschijnen of zich verspreiden, maar dit is een gevaarlijke aanpak:

- Zelfs als we modellen testen voordat ze worden ingezet, zijn er nog steeds manieren waarop ze gevaarlijke capaciteiten kunnen krijgen na de inzet (fine-tuning, jailbreaking, runtime verbeteringen).
- Modellen kunnen worden gelekt.
- Sommige capaciteiten zijn zelfs gevaarlijk binnen AI-laboratoria.

De enige veilige optie is om deze krachtige AI-systemen in de eerste plaats niet te bouwen.
We zouden de creatie van deze onvoorspelbare, potentieel zeer gevaarlijke AI-systemen niet moeten toestaan.
[Helaas voorkomt momenteel geen enkele conceptvoorstel daadwerkelijk superintelligente AI.](https://twitter.com/PauseAI/status/1704998018322141496)
Daarom [roepen we op tot een Pauze](/proposal)!
