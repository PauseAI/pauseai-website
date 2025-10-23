---
title: Warum wir möglicherweise früher als die meisten denken eine Superintelligenz haben werden
description: Wir unterschätzen den Fortschritt der KI, und es besteht eine kleine, aber realistische Chance, dass wir sehr nahe an einer Superintelligenz sind.
date: '2023-05-04'
---

Aktuelle [State-of-the-Art](/sota)-KI-Modelle sind bereits in vielen Bereichen übermenschlich, aber glücklicherweise nicht in allen.
Wenn wir die Superintelligenz erreichen, bevor wir das Alignmentsproblem lösen, [droht uns ein Aussterberisiko](/xrisk).
Daher ist es wichtig, einen ungefähren Zeitrahmen für die mögliche Entstehung einer Superintelligenz zu haben, um sicherzustellen, dass wir nicht unvorbereitet sind.
Wenn unsere Vorhersagen zu weit entfernt sind, könnten wir möglicherweise nicht rechtzeitig vorbereitet sein.

Aber wie weit entfernt sind wir?
Wann werden wir eine Superintelligenz haben?
Es könnte früher sein als die meisten denken.

## Exponentielles Wachstum durch Kombination von Faktoren {#compounding-exponential-growth}

KI-Modelle benötigen Algorithmen, Daten und Chips.
Jeder dieser Komponenten verbessert sich rasant aufgrund enormer Investitionen in die KI.
Die Verbesserungen in jeder dieser Komponenten summieren sich auf und führen zu exponentiellem Wachstum in den Fähigkeiten der KI.

- **Mehr Chips**. ChatGPT wurde auf [10.000](https://www.fierceelectronics.com/sensors/chatgpt-runs-10k-nvidia-training-gpus-potential-thousands-more) spezialisierten Chips trainiert. Meta hat [angekündigt](https://www.datacenterdynamics.com/en/news/meta-to-operate-600000-gpus-by-year-end/), dass sie 600.000 Next-Gen-Chips haben werden, um ihre nächsten KI-Modelle dieses Jahr zu trainieren.
- **Schnellere Chips**. Jedes Jahr werden Chips aufgrund neuer Architekturen und Lithographie-Innovationen schneller. Die Chips, die Meta verwendet, sind 10-mal schneller als die Chips, die für ChatGPT verwendet wurden. Wir sehen auch hochspezialisierte Hardware wie die Groq-Chips, die [13-mal schneller](https://mezha.media/en/2024/02/22/groq-s-new-ai-chip-offers-to-increase-chatgpt-speed-by-13-times/) sind als die Konkurrenz. Auf einem längeren Zeitraum könnten [ternäre Architekturen](https://arxiv.org/pdf/2402.17764.pdf) oder [photonische Chips](https://www.nature.com/articles/s41566-024-01394-2) Chips noch schneller machen.
- **Mehr Daten**. GPT3 wurde auf [45 TB](https://community.openai.com/t/what-is-the-size-of-the-training-set-for-gpt-3/360896) Text trainiert, GPT4 verwendete etwa 20-mal so viel. KI-Unternehmen verwenden jetzt auch [riesige Mengen an Videodaten](https://www.404media.co/nvidia-ai-scraping-foundational-model-cosmos-project/), Audiodaten und generieren sogar [synthetische Daten, um diese Modelle zu trainieren](https://arxiv.org/pdf/2401.10020). Früher wurde die Idee, synthetische Daten für das Training zu verwenden, als unmöglich angesehen, da das Modell zusammenbricht, aber [neue Fortschritte](https://arxiv.org/abs/2406.07515) zeigen, dass es möglich ist, das Modellkollaps zu verhindern.
- **Bessere Daten**. Die Studie "Textbooks are all you need" [zeigte](https://arxiv.org/abs/2306.11644), dass die Verwendung von hochwertigen synthetischen Daten die Modellleistung drastisch verbessern kann, selbst wenn weniger Daten und Rechenleistung verwendet werden.
- **Bessere Algorithmen**. Die Transformer-Architektur ermöglichte die aktuelle LLM-Revolution. Neue Architekturen können ähnliche Fähigkeitssprünge ermöglichen. Das Mamba-Modell zeigt beispielsweise [5-mal schnelleren Durchsatz](https://arxiv.org/abs/2312.00752).
- **Bessere Laufzeiten**. Agentic-Laufzeiten, Retrieval-Augmented-Generation oder einfach cleveres Prompting (durch [Graph of Thought](https://arxiv.org/abs/2305.16582) zum Beispiel) können einen enormen Einfluss auf die Fähigkeiten dieser Modelle haben.

Es ist durchaus möglich, dass das _einfache Hochskalieren_ uns in einem Jahr oder zwei zu [gefährlichen Fähigkeiten](/dangerous-capabilities) bringt, aber mit all diesen kombinierten Faktoren könnte es noch früher sein.

## Wir haben 2023 in vielen Bereichen menschliche Leistung erreicht {#we-reached-human-level-performance-in-many-domains-in-2023}

Im Jahr 2022 dachten KI-Forscher, dass es [17 Jahre](https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/) dauern würde, bis KI in der Lage wäre, einen New-York-Times-Bestseller zu schreiben.
Ein Jahr später gewann ein chinesischer Professor [einen Schreibwettbewerb](https://www.scmp.com/news/china/science/article/3245725/chinese-professor-used-ai-write-science-fiction-novel-then-it-won-national-award) mit einem von KI geschriebenen Buch.

Auf Metaculus war [die Gemeinschaftsvorhersage für (schwache) AGI](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) vor drei Jahren 2057, und jetzt ist es ~~2027~~ 2026.

Lassen Sie uns nun in die Definition von AGI eintauchen, die in dieser Umfrage verwendet wurde:

- Score >90% in der Winograd-Schema-Herausforderung
- Score >75% in SAT-Ergebnissen
- Bestehen eines Turing-Tests
- Beenden von Montezumas Rache

GPT-4 erreicht [94,4% in der Winograd-Schema-Herausforderung](https://d-kz.medium.com/evaluating-gpt-3-and-gpt-4-on-the-winograd-schema-challenge-reasoning-test-e4de030d190d) und [93% im SAT-Lesetest, 89% im SAT-Mathetest](https://www.cnbc.com/2023/03/14/openai-announces-gpt-4-says-beats-90percent-of-humans-on-sat.html).
Es hat den Turing-Test nicht bestanden, aber wahrscheinlich nicht wegen mangelnder Fähigkeiten.
Es liegt daran, dass GPT-4 darauf trainiert wurde, Menschen nicht zu täuschen. Es ist nicht gut für das Geschäft, wenn Ihre KI den Menschen sagt, dass sie eigentlich ein Mensch ist.
Das lässt nur noch Montezumas Rache übrig.
Es ist nicht undenkbar, dass es durch eine clevere Einrichtung von GPT-4, unter Verwendung von etwas wie AutoGPT, um den Bildschirm zu analysieren und die richtigen Eingaben zu generieren, beendet werden kann.
Im Mai 2023 konnte [GPT-4 Code schreiben, um Diamantausrüstung in Minecraft zu erhalten](https://the-decoder.com/minecraft-bot-voyager-programs-itself-using-gpt-4/).
Kurz gesagt: GPT-4 hat 2/4 Kriterien mit Sicherheit erreicht, mit den anderen beiden in Reichweite.

**Wir sind da, Leute.
Wir haben bereits (schwache) AGI.**
Es hat uns nicht 35 Jahre gedauert, sondern drei.
Wir lagen um den Faktor 10 daneben.

## Warum die meisten den Fortschritt der KI unterschätzen {#why-most-underestimate-the-progress-of-ai}

Es gibt viele Gründe, warum Menschen den Fortschritt der KI unterschätzen.

- **Es ist schwer, Schritt zu halten**. Fast täglich sehen wir neue Durchbrüche in der KI. Es ist fast unmöglich, mit dem Tempo des Fortschritts Schritt zu halten. Sie sind nicht allein, wenn Sie sich wie fallen gelassen fühlen.
- **Wir verschieben ständig die Zielpfosten**. In den 90er Jahren dachten die Menschen, dass der Heilige Gral der KI etwas war, das Schach spielen konnte. Als KI Kasparow besiegte, war die nächste Herausforderung Go. Jetzt haben wir Maschinen, die im [99,9. Perzentil in IQ-Tests](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) punkten, [26 Sprachen übersetzen](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) und [Fotowettbewerbe gewinnen](https://www.scientificamerican.com/article/how-my-ai-image-won-a-major-photography-competition/), und doch fragen wir immer noch: "Wann wird KI menschliches Niveau erreichen?". Sie übertrifft uns bereits in vielen Bereichen, aber wir konzentrieren uns immer auf die immer kleiner werdende Anzahl von Dingen, die wir noch besser können.
- **Wir möchten gerne denken, dass wir besonders sind**. Menschen möchten gerne denken, dass sie besonders sind. Wenn eine KI das kann, was wir können, sind wir nicht mehr besonders. Das ist eine bittere Pille, und das [Gehirn hat viele Abwehrmechanismen, um dies zu vermeiden](psychology-of-x-risk).
- **Wir sind wirklich schlecht in exponentiellem Wachstum**. Wir neigen dazu, systematisch und vorhersehbar zu unterschätzen, wie sich exponentielles Wachstum im Laufe der Zeit kumuliert. Dies wurde in [wissenschaftlichen Studien](https://www.researchgate.net/figure/Underestimation-of-exponential-growth-a-shows-the-participants-prediction-of-the_fig4_351171143) gezeigt.

Glücklicherweise gibt es noch einige Dinge, die eine KI noch nicht kann.
Sie kann nicht [besser hacken als die besten Hacker](/cybersecurity-risks), und sie kann nicht so gut KI-Forschung betreiben wie die besten KI-Forscher.
**Wenn wir eine dieser Schwellen erreichen, werden wir uns in einem neuen Regime erhöhten Risikos befinden**.

Also, wann werden wir den Punkt erreichen, an dem eine KI all diese Dinge auf übermenschlichem Niveau kann?
Wann werden wir eine _Superintelligenz_ haben?

## Die Ilya-Schwelle {#the-ilya-threshold}

Ich denke, der entscheidende Punkt, den wir berücksichtigen sollten, ist **der Punkt, an dem eine KI besser darin ist, KI-Forschung zu betreiben als jemand wie Ilya Sutskever** (ehemaliger Chefingenieur bei OpenAI).
Eine KI, die sinnvolle Beiträge zu KI-Algorithmen und -Architekturen leisten kann, ist wahrscheinlich in der Lage, sich selbst zu verbessern.
Nennen wir diesen Punkt der möglichen Selbstverbesserung die _Ilya-Schwelle_.
Wenn sie diese Schwelle erreicht, könnte eine KI sich selbst verbessern, weil sie explizit dazu angewiesen wurde, oder weil es ein nützliches Teilziel für andere Ziele ist (KIs [erstellen bereits ihre eigenen Teilziele](https://github.com/Significant-Gravitas/Auto-GPT)).
Diese Iterationen könnten Wochen dauern (das Training von GPT-3 dauerte 34 Tage), aber es ist auch möglich, dass eine Art Laufzeitverbesserung implementiert wird, die in wenigen Minuten signifikante Fortschritte macht: eine [Intelligenzexplosion](https://www.youtube.com/watch?v=5qfIgCiYlfY).

Also, wie weit entfernt sind wir von der Ilya-Schwelle?
Es ist grundlegend schwierig vorherzusagen, [wann bestimmte Fähigkeiten entstehen](https://arxiv.org/abs/2206.07682), wenn LLMs skaliert werden, aber bisher haben wir viele Fähigkeiten gesehen, die zuvor als weit entfernt galten.
Die [neuesten KI-Modelle](/sota) schlagen bereits die meisten menschlichen Programmierer, also ist es nicht undenkbar, dass zukünftige Modelle, bessere Chips, mehr Daten und bessere Algorithmen alle dazu beitragen werden, die Ilya-Schwelle zu erreichen.
Wir haben keine Ahnung, wie wir eine solche KI ausrichten können (sogar [OpenAI gibt dies zu](https://youtu.be/L_Guz73e6fw?t=1477)), und die Konsequenzen einer fehlgeleiteten Superintelligenz sind wahrscheinlich [katastrophal](/xrisk).

## Handeln {#act}

Anthropic-Mitgründer Ben Mann [glaubt](https://x.com/ai_ctrl/status/1819173703869255879/photo/0), dass es eine 30%ige Chance gibt, dass Claude 3 (ihr neuestes Modell) autonom repliziert werden kann, wenn es fein abgestimmt und clever angeregt wird.
Ex-OpenAI-Forscher Daniel Kokotajlo denkt, dass es eine [15%ige Chance](https://x.com/ai_ctrl/status/1819173703869255879/photo/0) gibt, dass wir 2024 AGI haben werden.
Niemand weiß genau, wann wir die Ilya-Schwelle erreichen werden.
Aber die [Einsätze sind zu hoch](/xrisk), um anzunehmen, dass wir viel Zeit haben.
Wir müssen auf die kleine Chance reagieren, dass wir nur noch Monate entfernt sind.
Wir müssen die [Entwicklung von Frontier-KI pausieren](/proposal) - jetzt sofort.
Es liegt an jedem von uns, [Maßnahmen zu ergreifen](/action) und sicherzustellen, dass wir nicht unvorbereitet sind.
