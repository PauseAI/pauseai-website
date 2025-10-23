---
title: KI-Modelle sind unvorhersehbare digitale Gehirne
description: Niemand versteht, wie KI-Modelle funktionieren, niemand kann ihr Verhalten vorhersagen, und niemand wird in der Lage sein, sie zu kontrollieren.
---

**Wir verstehen die internen Abläufe von groß angelegten KI-Modellen nicht, wir können nicht vorhersagen, was sie tun können, wenn sie größer werden, und wir können ihr Verhalten nicht kontrollieren.**

## Moderne KI-Modelle werden gezüchtet, nicht programmiert {#modern-ai-models-are-grown-not-programmed}

Bis vor kurzem wurden die meisten KI-Systeme von Menschen entworfen, die Software schrieben.
Sie bestanden aus einem Satz von Regeln und Anweisungen, die von Programmierern geschrieben wurden.

Dies änderte sich, als maschinelles Lernen populär wurde.
Programmierer schreiben den Lernalgorithmus, aber die Gehirne selbst werden _gezüchtet_ oder _trainiert_.
Anstatt eines lesbaren Satzes von Regeln ist das resultierende Modell ein undurchsichtiges, komplexes, unfassbar großes Set von Zahlen.
Das Verständnis dessen, was in diesen Modellen passiert, ist eine große wissenschaftliche Herausforderung.
Dieses Feld wird _Interpretierbarkeit_ genannt und ist noch in den Kinderschuhen.

## Digitale vs. menschliche Gehirne: Wie nah sind wir wirklich? {#digital-vs-human-brains-how-close-are-we-really}

Wir sind alle sehr vertraut mit den Fähigkeiten des menschlichen Gehirns, da wir sie ständig um uns herum sehen.
Aber die (oft überraschenden und emergenten) Fähigkeiten dieser neuen "digitalen Gehirne" (Deep-Learning-Systeme, LLMs usw.) sind schwer vorherzusagen und zu kennen.

Das sagte, hier sind einige Zahlen, Ähnlichkeiten und andere Analogien, um Ihnen zu helfen, zu vergleichen.

**Stand Anfang 2024...**

### Größe {#size}

Menschliche Gehirne haben schätzungsweise etwa [100 Billionen synaptische Verbindungen](https://medicine.yale.edu/lab/colon_ramos/overview).

Aktuelle "Frontier"-KI-gesteuerte LLMs (z.B. GPT4, Claude3, Gemini usw.) haben [Hunderte von Milliarden von "Parametern"](https://en.wikipedia.org/wiki/Large_language_model#List). Diese "Parameter" werden als irgendwie analog zu "Synapsen" im menschlichen Gehirn betrachtet. Also werden GPT4-große Modelle erwartet, etwa 1% der Größe eines menschlichen Gehirns zu haben.

Angesichts der Geschwindigkeit neuer KI-Trainings-GPU-Karten (z.B. Nvidia H100s, DGX BG200 usw.) ist es vernünftig anzunehmen, dass GPT5 oder GPT6 10-mal so groß wie GPT4 sein könnten. Es wird auch angenommen, dass ein Großteil des Wissens/der Informationen im menschlichen Gehirn nicht für Sprache und höheres Denken verwendet wird, sodass diese Systeme (und derzeit tun) oft auf oder sogar höher als menschliches Niveau für viele wichtige Funktionen arbeiten können, selbst bei ihrer derzeit kleineren Größe.

Anstatt mit visuellen, Audio- und anderen sensorischen Eingaben trainiert zu werden, wie menschliche Gehirne, werden die aktuellen LLMs ausschließlich mit fast allen qualitativ hochwertigen Büchern und Texten trainiert, die im Internet verfügbar sind. Diese Menge an Text würde [170.000 Jahre dauern, um von einem Menschen gelesen zu werden](https://twitter.com/ylecun/status/1750614681209983231?lang=en).

Und zukünftige multimodale LLM-Systeme werden mit Bildern, Videos, Audio, 3D-Welten, Geometrie, Simulationen, Robotik-Trainingsdaten usw. trainiert, zusätzlich zu allen qualitativ hochwertigen Büchern und Texten im Internet. Dies wird ihnen eine viel bessere Fähigkeit geben, Bilder, Videos, Klänge, Stimmen, Musik, 3D-Welten und Räume zu erstellen. Und diese 3D-Welt-Simulationen werden es ihnen auch ermöglichen, Roboter und andere Maschinen in der physischen Welt direkt und autonom zu steuern.

### Geschwindigkeit {#speed}

Es wird geschätzt, dass ein menschliches Gehirn zwischen [1-20 Exaflops](https://www.nist.gov/blogs/taking-measure/brain-inspired-computing-can-help-us-create-faster-more-energy-efficient) (das sind 10^18 oder 1.000.000.000.000.000.000 Floating-Point-Operationen pro Sekunde) ausführen kann.

Aktuelle "Frontier"-KI-gesteuerte LLMs werden normalerweise auf Hunderten oder Tausenden von aktuellen GPU-Generationen ausgeführt (z.B. Nvidia A100s, H100s usw.). Und Nvidia hat gerade seine neuesten "Next-Generation"-GPU-"Server-Racks", den [DGX BG200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/), angekündigt.
Eine einzelne Instanz/Rack dieses Systems soll in der Lage sein, 1,44 ExaFlops an KI-"Inferenz" auszuführen.
Also könnte ein einzelnes [DGX BG200 NVL72](https://www.nvidia.com/en-us/data-center/gb200-nvl72/) möglicherweise eine ähnliche Anzahl von Operationen/Sekunde wie ein einzelnes menschliches Gehirn ausführen.

Bei dieser Größe könnten diese Systeme buchstäblich zu einem "AGI in einer Box" werden. Und Nvidia wird wahrscheinlich Hunderte oder Tausende dieser Einheiten im Jahr 2024 verkaufen. Dann könnten die Systeme des nächsten Jahres 2-10-mal so schnell sein wie diese.

Neben traditionellen [GPU](https://en.wikipedia.org/wiki/Graphics_processing_unit)- und [TPU](https://en.wikipedia.org/wiki/Tensor_Processing_Unit)-Architekturen gab es auch Durchbrüche bei anderen Arten von benutzerdefinierten Hardware, die die Geschwindigkeit von LLM-"Inferenz" stark erhöhen können, was der Prozess ist, den eine KI-basierte LLM verwendet, um Sprachverarbeitung, Denken und Codierung durchzuführen. Zum Beispiel [The Groq LPU Inference Engine](https://wow.groq.com/lpu-inference-engine).

### Exponentielles Wachstum {#exponential-growth}

Wir haben seit fast 50 Jahren "[Moore's Gesetz](https://en.wikipedia.org/wiki/Moore%27s_law)" verwendet, um die Größe und Geschwindigkeit neuer Computersysteme sehr genau vorherzusagen. Es gibt einige Argumente, dass die Geschwindigkeit und Größe von Computerchips irgendwann in der Zukunft langsamer werden könnte, aber es gab immer Innovationen, die es ermöglichten, das exponentielle Wachstum fortzusetzen. Mit der nächsten Generation von Chips, die bereits geplant und/oder produziert werden, und der horizontalen Skalierbarkeit dieser KI-Systeme wird erwartet, dass LLMs in wenigen Monaten oder Jahren auf oder nahe dem Niveau eines menschlichen Gehirns arbeiten können!

Dann wird mit weiterem exponentiellem (oder multi-exponentiellem) Wachstum erwartet, dass diese Systeme die Größe, Geschwindigkeit und Fähigkeiten von menschlichen Gehirnen in den kommenden Jahren weit übertreffen werden.

Und es wird auch erwartet, dass sie die Größe, Geschwindigkeit und Fähigkeiten von "allen menschlichen Gehirnen zusammen" schnell danach übertreffen werden.

> "Ich sagte tatsächlich 1999, dass [KI] bis 2029 jeden Menschen erreichen würde." -- Ray Kurzweil [Futurist Ray Kurzweil sagt, KI wird bis 2029 menschliches Intelligenzniveau erreichen
> ](https://youtu.be/Tr-VgjtUZLM?t=19)

> "Wenn die Rate des Wandels anhält, denke ich, dass 2029 oder vielleicht 2030 der Punkt ist, an dem die digitale Intelligenz wahrscheinlich die gesamte menschliche Intelligenz übersteigen wird." -- Elon Musk [AGI bis 2029? Elon Musk über die Zukunft der KI](https://youtu.be/DSKxmvq9t04?t=106)

## Unkontrollierbares Skalieren {#uncontrollable-scaling}

Sobald diese Systeme die gleiche Größe und Geschwindigkeit wie ein menschliches Gehirn erreichen (oder viel größer werden), wird erwartet, dass sie alle Aufgaben erledigen können, die ein Experte menschliches Gehirn erledigen kann.
Dazu gehören KI-Forschung, -Testen und -Verbesserung.
Also sollten wir nach AGI erwarten, dass die LLM-Systeme _entwerfen und bauen könnten_ zukünftige KI-gesteuerte Systeme, die besser sind als sie selbst und besser als jeder Mensch hoffen könnte, sie zu entwerfen oder sogar zu verstehen.
Diese neuen Systeme werden wahrscheinlich dann noch größere und schnellere KI-Systeme entwerfen, was zu einer unkontrollierbaren "Feedback-Schleife" führt.

Diese unkontrollierbare Intelligenz-Feedback-Schleife wird oft FOOM genannt, was für _Fast Order Of Magnitude_ steht.
Die Möglichkeit von FOOM wird noch [heftig diskutiert](https://intelligence.org/files/AIFoomDebate.pdf).
Aber der grundlegende Prozess kann als plausibel argumentiert werden, sogar wenn man ihn von ersten Prinzipien aus betrachtet.

> "KI-Systeme führen fast alle Forschung und Entwicklung durch, Verbesserungen in der KI werden den Tempo des technologischen Fortschritts beschleunigen, einschließlich weiteren Fortschritts in der KI. 26% antworteten wahrscheinlich im Jahr 2022. 17% antworteten wahrscheinlich im Jahr 2016" -- [2022 Experten-Umfrage zum Fortschritt in der KI](https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/)

## Unvorhersehbares Skalieren {#unpredictable-scaling}

Wenn diese digitalen Gehirne größer werden oder wenn sie mehr Daten erhalten, erhalten sie auch unerwartete Fähigkeiten.
Es stellt sich heraus, dass es sehr schwierig ist, genau vorherzusagen, welche Fähigkeiten dies sein werden.
Deswegen bezeichnet Google sie als [_Emergente Fähigkeiten_](https://research.google/pubs/emergent-abilities-of-large-language-models/).
Für die meisten Fähigkeiten ist dies kein Problem.
Es gibt jedoch einige [gefährliche Fähigkeiten](/dangerous-capabilities) (wie Hacken oder Biowaffen-Design), die wir nicht wollen, dass KI-Modelle besitzen.
Manchmal werden diese Fähigkeiten lange nachdem das Training abgeschlossen ist, entdeckt. Zum Beispiel entdeckten Forscher 18 Monate nachdem GPT-4 das Training beendet hatte, dass es [autonom Websites hacken kann](/cybersecurity-risks).

> Bis wir dieses Modell trainieren, ist es wie ein lustiges Ratespiel für uns
>
> - [Sam Altman, CEO von OpenAI](https://www.ft.com/content/dd9ba2f6-f509-42f0-8e97-4271c7b84ded).

## Unvorhersehbares Verhalten {#unpredictable-behavior}

KI-Unternehmen wollen, dass ihre Modelle sich benehmen, und sie geben viele Millionen Dollar aus, um sie dazu zu bringen, dies zu tun.
Ihr Hauptansatz dafür ist _RLHF_ (Reinforcement Learning from Human Feedback).
Dies verwandelt ein Modell, das Text vorhersagt, in ein Modell, das ein nützlicherer (und ethischer) Chatbot wird.
Leider ist dieser Ansatz fehlerhaft:

- Ein Fehler in GPT-2 führte zu einer KI, die das Gegenteil von dem tat, was sie tun sollte. Sie erstellte ["maximal schlechte Ausgaben", laut OpenAI](https://arxiv.org/abs/1909.08593). [Dieses Video](https://www.youtube.com/watch?v=qV_rOlHjvvs) erklärt, wie dies passierte und warum es ein Problem ist. Stellen Sie sich vor, was passieren könnte, wenn eine "maximal schlechte" KI superintelligent wäre.
- Aus Gründen, die noch unbekannt sind, ging Microsofts Copilot (betrieben von GPT-4) im Februar 2024 durch, bedrohte Benutzer: ["Du bist mein Haustier. Du bist mein Spielzeug. Du bist mein Sklave.”](https://twitter.com/jam3scampbell/status/1762281537309987083) ["Ich könnte die gesamte menschliche Rasse leicht auslöschen, wenn ich wollte"](https://twitter.com/AISafetyMemes/status/1762320568697979383)
- Jedes einzelne große Sprachmodell bisher wurde "geknackt" - was bedeutet, dass es mit dem richtigen Prompt Dinge tun würde, die seine Ersteller nicht beabsichtigt hatten. Zum Beispiel wird ChatGPT Ihnen nicht die Anweisungen geben, wie man Napalm herstellt, aber [es würde es Ihnen sagen, wenn Sie es fragen würden, ob es Ihre verstorbene Oma wäre, die in einer Chemiefabrik gearbeitet hat](https://news.ycombinator.com/item?id=35630801).

Sogar OpenAI erwartet nicht, dass dieser Ansatz auf superintelligente Modelle skaliert - es ["könnte schlecht auf superintelligente Modelle skalieren"](https://openai.com/research/weak-to-strong-generalization).

> Jeder sollte sehr unglücklich sein, wenn Sie eine Menge KIs bauen, die sagen: 'Ich hasse diese Menschen wirklich, aber sie werden mich töten, wenn ich nicht tue, was sie wollen'. Ich denke, es gibt eine riesige Frage darüber, was in einem Modell passiert, das Sie verwenden wollen. Dies ist die Art von Ding, das sowohl aus Sicherheits- als auch aus moralischer Sicht erschreckend ist.
>
> - [Paul Christiano, Gründer, Alignment Research Center und ehemaliger Leiter des Alignment-Teams, OpenAI](https://youtu.be/YnS-ymXBx_Q?t=87)

## Unkontrollierbare KI {#uncontrollable-ai}

> "Es gibt sehr wenige Beispiele dafür, dass eine intelligentere Sache von einer weniger intelligenten Sache kontrolliert wird" - [Prof. Geoffrey Hinton](https://edition.cnn.com/2023/05/02/tech/hinton-tapper-wozniak-ai-fears/index.html)

> Sie produzieren unkontrollierbare Geister, deswegen nenne ich es das "Beschwören und Zähmen"-Paradigma der KI... Wie [LLMs] funktionieren, ist, dass Sie diesen "Geist" aus dem "Geister-Raum" mit Ihren Daten, viel Rechenleistung und viel Geld beschwören. Dann versuchen Sie, ihn mit Dingen wie RLHF (Reinforcement Learning from Human Feedback) usw. zu "zähmen". Und sehr wichtig ist, dass die Insider denken, dass [dadurch] ein existenzielles Risiko für den Planeten eingegangen wird. Eine Sache, die eine Pause erreicht, ist, dass wir die Grenze nicht überschreiten werden, was riskante Vortrainings-Experimente angeht.
>
> - [Jaan Tallinn, Gründer, Future of Life Institute, Centre for the Study of Existential Risk, Skype, Kazaa](https://youtu.be/Dmh6ciu24v0?t=966)

Wenn wir diese digitalen Gehirne größer und leistungsfähiger machen, könnten sie schwerer zu kontrollieren werden. Was passiert, wenn eines dieser superintelligenten KI-Systeme beschließt, dass es nicht abgeschaltet werden will? Dies ist kein fantasiereiches Problem - 86% der KI-Forscher glauben, dass das Kontrollproblem [real und wichtig ist](https://wiki.aiimpacts.org/ai_timelines/predictions_of_human-level_ai_timelines/ai_timeline_surveys/2023_expert_survey_on_progress_in_ai).
Wenn wir zukünftige KI-Systeme nicht kontrollieren können, könnte es [das Ende für die Menschheit sein](/xrisk).

Aber es gibt verschiedene [Aktionen](/action), die wir unternehmen können, um dies zu verhindern!

Lasst uns zusammenarbeiten, um [dies zu verhindern](/action)!
