---
title: Regulierung gefährlicher Fähigkeiten in der KI
description: Je leistungsfähiger KI in bestimmten Bereichen wird, desto größer werden die Risiken. Wie können wir verhindern, dass diese gefährlichen Fähigkeiten entstehen oder sich verbreiten?
---

In diesem Artikel werden wir diskutieren:

- Welche KI-Fähigkeiten gefährlich sein können
- Wie wir verhindern können, dass diese Fähigkeiten entstehen oder sich verbreiten
- Warum es gefährlich ist, sich auf Bewertungen als politische Maßnahme zu verlassen

Je leistungsfähiger KI-Modelle werden, desto gefährlicher werden sie auch.
An welchem Punkt sollten wir also vorsichtig sein?
Ein bestimmter Schwellenwert, der oft erwähnt wird, ist AGI - oder künstliche allgemeine Intelligenz.
Es gibt viel Diskussion darüber, was AGI genau bedeutet.
Einige sagen, es ist, wenn KI alle kognitiven Aufgaben erledigen kann, die Menschen können.
Einige sagen, GPT-4 sei bereits AGI.
Steve Wozniak definiert AGI als das erste System, das in eine Küche eintreten und eine Tasse Kaffee zubereiten kann.

Aus Sicherheitssicht ist die Definition von AGI nicht so wichtig.
Tatsächlich kann sie uns ein falsches Gefühl von Sicherheit geben, weil wir denken könnten, dass wir sicher sind, bis wir AGI erreichen.
Auch wenn eine KI keinen Kaffee zubereiten kann, kann sie immer noch gefährlich sein.
Was wichtig ist, sind die Fähigkeiten, die eine KI hat.

In diesem Artikel werden wir uns verschiedenen gefährlichen Fähigkeiten widmen und was wir tun können, um zu verhindern, dass sie uns schaden.

## Welche Fähigkeiten können gefährlich sein? {#which-capabilities-can-be-dangerous}

- **Cybersicherheit**. Wenn eine KI in der Lage ist, Sicherheitslücken zu entdecken (insbesondere neue, unbekannte), kann sie (verwendet werden, um) [in Systeme einzudringen](/cybersecurity-risks). Aktuelle [State-of-the-Art](/sota)-KI-Systeme können einige Sicherheitslücken finden, aber noch nicht auf gefährlichem, fortgeschrittenem Niveau. Allerdings steigt mit zunehmenden Cybersicherheitsfähigkeiten auch das potenzielle Schadenspotential, das eine KI-gestützte Cyberwaffe anrichten könnte. Groß angelegte Cyberangriffe könnten unsere Infrastruktur stören, Zahlungen deaktivieren und Chaos verursachen.
- **Biologische Gefahren**. Entwurf neuer biologischer Agenzien oder Hilfe bei der Entwicklung einer Pandemie. Eine Gruppe von Studenten konnte einen Chatbot verwenden, um [alle Schritte zu erstellen, die benötigt werden, um eine neue Pandemie zu schaffen](https://arxiv.org/abs/2306.03809). Eine KI, die entwickelt wurde, um sichere Medikamente zu finden, wurde verwendet, um [40.000 neue chemische Waffen in sechs Stunden zu entdecken](https://www.theverge.com/2022/3/17/22983197/ai-new-possible-chemical-weapons-generative-models-vx).
- **Algorithmische Verbesserungen**. Eine KI, die effiziente Algorithmen für ein bestimmtes Problem finden kann, könnte zu einer rekursiven Schleife der Selbstverbesserung führen, die schnell außer Kontrolle gerät. Dies wird als _Intelligenzexplosion_ bezeichnet. Die resultierende KI wäre unglaublich leistungsfähig und könnte alle möglichen anderen gefährlichen Fähigkeiten haben. Glücklicherweise kann noch keine KI sich selbst verbessern. Allerdings gibt es KIs, die neue, sehr effiziente Algorithmen finden können (wie [AlphaDev](https://www.deepmind.com/blog/alphadev-discovers-faster-sorting-algorithms)).
- **Täuschung**. Die Fähigkeit, Menschen zu manipulieren, einschließlich sozialer Ingenieurskunst. Verschiedene Formen der Täuschung sind [bereits in aktuellen KI-Systemen vorhanden](https://lethalintelligence.ai/post/ai-hired-human-to-solve-captcha/). Zum Beispiel wurde Meta's CICERO-KI (die darauf trainiert wurde, zu "besserer, natürlicher KI-Mensch-Kooperation" zu führen) zu einem Expertenlügner, der andere Agenten im Spiel täuschte. Eine KI, die Menschen täuschen kann, kann Menschen während des Trainings täuschen. Sie könnte ihre Fähigkeiten oder Absichten verbergen.
- **Selbstreplikation**. Wenn eine KI neue Instanzen auf anderen Maschinen erstellen kann, besteht das Risiko, dass sie sich unkontrolliert verbreitet und zu einem [_KI-Übernahme_](/ai-takeover) führt. Eine hinreichend fähige KI könnte Menschen überlegen sein und zu [menschlichem Aussterben](/xrisk) führen. Beachten Sie, dass dies sogar passieren kann, bevor ein KI-Modell eingesetzt wird.

Diese Liste ist nicht erschöpfend, es gibt also andere gefährliche Fähigkeiten, die eine KI haben könnte.

## Verhinderung der Entstehung gefährlicher Fähigkeiten {#preventing-creation-of-dangerous-capabilities}

Können wir die Entstehung dieser gefährlichen Fähigkeiten verhindern?
Je größer KIs werden und je mehr Daten sie trainiert werden, erlangen sie neue Fähigkeiten.
Es stellt sich heraus, dass es sehr schwierig ist, vorherzusagen, welche Fähigkeiten entstehen werden und wie gut eine KI performen wird.
Deshalb werden sie oft als _Emergente Fähigkeiten_ bezeichnet.

Unser aktuelles Paradigma von großen Sprachmodellen ist fast inhärent unvorhersehbar.
KI-Modelle werden nicht wie Software geschrieben - sie werden trainiert.
Sie sind Black-Box-Systeme, die aus Milliarden numerischer Parameter bestehen.
Niemand weiß wirklich, was darin vor sich geht.
Diese Unvorhersehbarkeit macht es schwierig zu sagen, ob ein Trainingslauf zu einer gefährlichen KI führen wird.
Interpretierbarkeitsforschung kann dies in Zukunft ändern, aber momentan können wir nicht wirklich erklären, warum KI tut, was sie tut.

Die Verhinderung der Entstehung gefährlicher Fähigkeiten kann also praktisch nur auf eine Weise erfolgen:
Baue keine immer leistungsfähigeren KI-Systeme.
Dies wäre der sicherste Weg, aber das ist nicht, was KI-Labore vorschlagen.

## Verhinderung der Verbreitung gefährlicher Fähigkeiten {#preventing-the-proliferation-of-dangerous-capabilities}

Derzeit passiert viel im Bereich der KI-Regulierung.
Viele dieser Vorschläge (einschließlich aller, die von KI-Laboren kommen) basieren auf Sicherheitsbewertungen (oder _Evals_): Vor-Implementierungstests von KI-Modellen.
Ein Beispiel für diese eval-basierten Ansätze ist der [RSP-Ansatz von Anthropic](https://evals.alignment.org/blog/2023-09-26-rsp/#:~:text=An%20RSP%20specifies%20what%20level,capabilities%20until%20protective%20measures%20improve.) oder der [Coordinated Pausing](https://www.governance.ai/research-paper/coordinated-pausing-evaluation-based-scheme)-Ansatz von GovAI.
Wir bezeichnen diese als [Level-2-Regulierung](/4-levels-of-ai-regulation).
Diese Bewertungen verhindern nicht, dass gefährliche KIs _entstehen_, aber sie verhindern, dass sie _eingesetzt_ werden.
Diese Art von Politik ist relativ billig und ermöglicht es KI-Laboren, ihre Forschung fortzusetzen.
Allerdings glauben wir, dass dieser Ansatz sehr gefährlich ist:

- **Modelle können geleakt werden**.
  Wir haben gesehen, dass dies mit Meta's LLAMA-Modell passiert ist. Sobald es draußen ist, gibt es kein Zurück.
- **Einige Fähigkeiten sind sogar gefährlich innerhalb von KI-Laboren**.
  Eine selbstreplizierende KI könnte zum Beispiel [aus dem Labor entkommen, bevor sie eingesetzt wird](https://lethalintelligence.ai/post/ai-escaped-its-container/).
- **Das Testen auf gefährliche Fähigkeiten ist schwierig**.
  Wir wissen nicht, wie wir (sicher) testen können, ob eine KI sich selbst replizieren kann, zum Beispiel. Oder wie wir testen können, ob sie Menschen täuscht.
- **Fähigkeiten können nach dem Training hinzugefügt oder entdeckt werden**.
  Dies umfasst Feinabstimmung, Jailbreaking und Laufzeitverbesserungen.

Wir werden auf diesen letzten Punkt genauer eingehen.

## Fähigkeiten können nach dem Training hinzugefügt werden {#capabilities-can-be-added-after-training}

### Feinabstimmung {#fine-tuning}

Feinabstimmung kann verwendet werden, um die Fähigkeiten eines bestehenden KI-Modells zu verbessern.
Dies ist ähnlich wie Training, aber es ist viel schneller, viel billiger, erfordert nicht so viele Daten und kann oft auf Consumer-Hardware durchgeführt werden.
Feinabstimmung ändert die Parameter der KI und ändert somit ihre Fähigkeiten.
Jetzt ist Feinabstimmung nicht so leistungsfähig wie ein vollständiger Trainingslauf, aber es kann immer noch bestehende Fähigkeiten verbessern.

### Jailbreaking {#jailbreaking}

Die größten KIs werden auf absolut riesigen Datenmengen trainiert.
Die meisten Bücher, wissenschaftlichen Artikel und Websites im Internet.
Es gibt viel hässliches Zeug in diesen Datensätzen.
KIs werden oft mit einer Technik namens RLHF (Reinforcement Learning from Human Feedback) feinabgestimmt, um sie hilfreich und nett zu machen.
In diesem Prozess muss die KI lernen, bestimmte Dinge nicht zu sagen, wie rassistische Bemerkungen, Erklärungen, wie man eine Bombe baut oder wie man eine neue Biowaffe erstellt.

Aber diese Sicherheitsvorkehrungen sind nicht perfekt.
So genanntes "Jailbreaking" ist eine Technik, bei der man versucht, die KI dazu zu bringen, diese Sicherheitsvorkehrungen zu ignorieren.
Dies kann durch [Anhängen bestimmter Wörter oder Zeichen an die Chat-Nachricht](https://twitter.com/AIPanicLive/status/1678942758872989696) oder durch [kreative Umformulierung der Nachricht](https://twitter.com/_annieversary/status/1647865782741749760) erfolgen.
Es ist [unklar](https://llm-attacks.org/), ob ein solches Verhalten jemals vollständig gepatcht werden kann.

### Laufzeitverbesserungen {#runtime-improvements}

Laufzeitverbesserungen ändern das Modell nicht, sondern verbessern die Art und Weise, wie das Modell verwendet wird.

Die einfachste dieser Verbesserungen ist die Änderung der Eingabeaufforderungen.
Selbst kleine Änderungen an den Eingabeaufforderungen können einen großen Effekt auf die Ausgabe des Modells haben.
Das Hinzufügen einiger Wörter zu einer Eingabeaufforderung kann die Leistung [um über 50% verbessern](https://arxiv.org/pdf/2309.03409.pdf).

Aber wir können auch alle möglichen Software verwenden, um ein Basis-Modell zu erweitern.
Zum Beispiel haben Menschen Möglichkeiten gefunden, um ein Langzeitgedächtnis zu GPT-4 hinzuzufügen, indem sie das Modell eine Datenbank abfragen lassen.
Oder betrachten Sie AutoGPT, das es einem Modell ermöglicht, sich selbst rekursiv aufzurufen, was bedeutet, dass es autonom für beliebige Zeiträume laufen kann.
Oder betrachten Sie [Voyager](https://arxiv.org/abs/2305.16291), ein Tool, das es GPT-4 ermöglichte, Minecraft vollständig autonom zu spielen. Es bekam sogar Diamant-Ausrüstung.

Wir wissen nicht, wie weit ein Basis-Modell gestreckt werden kann.
Selbst wenn wir jetzt aufhören, neue KI-Modelle zu trainieren, werden wir wahrscheinlich wichtige Innovationen sehen, die neue Fähigkeiten zu bestehenden Modellen hinzufügen.

## Fazit {#in-conclusion}

Gefährliche Fähigkeiten von KI können zu allen möglichen Problemen führen: groß angelegten Cyberangriffen, konstruierten Pandemien und verrückten KIs, die [die Kontrolle übernehmen](/ai-takeover).
Es ist verlockend, sich auf Bewertungen zu verlassen, um diese gefährlichen Fähigkeiten zu verhindern oder zu verbreiten, aber dies ist ein gefährlicher Ansatz:

- Selbst wenn wir Modelle vor dem Einsatz testen, gibt es immer noch Möglichkeiten, wie sie gefährliche Fähigkeiten nach dem Einsatz erhalten können (Feinabstimmung, Jailbreaking, Laufzeitverbesserungen).
- Modelle können geleakt werden.
- Einige Fähigkeiten sind sogar gefährlich innerhalb von KI-Laboren.

Die einzige sichere Option ist, diese leistungsfähigen KI-Systeme nicht zu bauen.
Wir sollten die Erstellung dieser unvorhersehbaren, potenziell hochgefährlichen KI-Systeme nicht zulassen.
[Leider verhindert kein einziger Entwurfsvorschlag derzeit tatsächlich die Entstehung oder Verzögerung von superintelligenter KI.](https://twitter.com/PauseAI/status/1704998018322141496)
Deshalb fordern wir eine [Pause](/proposal)!
