---
title: Cybersicherheitsrisiken durch fortschrittliche KI-Modelle
description: Wie KI genutzt werden könnte, um alle Geräte zu hacken.
---

Virtuell alles, was wir heutzutage tun, hängt auf irgendeine Weise von Computern ab.
Wir bezahlen unsere Einkäufe, planen unsere Tage, kontaktieren unsere Liebsten und sogar fahren unsere Autos mit Computern.
Und praktisch alle diese Computer sind miteinander verbunden.
Dies macht uns alle anfällig für Cyberangriffe.

Hochentwickelte Cyberwaffen, Malware und Botnetze (wie [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](<https://de.wikipedia.org/wiki/Mirai_(Malware)>) und [EMOTET](https://de.wikipedia.org/wiki/Emotet)) waren immer schwierig zu erstellen.
Die [Cyberwaffe Pegasus](<https://de.wikipedia.org/wiki/Pegasus_(Spionagesoftware)>), zum Beispiel, kostete Hunderte Millionen Dollar zu entwickeln.
Das Auffinden sogenannter Zero-Day-Exploits (Sicherheitslücken, die noch nicht entdeckt wurden) erfordert viel Geschick und viel Zeit - nur hochspezialisierte Hacker können dies tun.
Wenn jedoch KI ausreichend fortgeschritten ist, wird dies nicht mehr der Fall sein.
Anstatt ein Team von hochqualifizierten Sicherheitsexperten/Hackern zu engagieren, um Zero-Day-Exploits zu finden, könnte jeder einfach eine viel billigere KI verwenden.

## KI-Modelle können autonom Sicherheitslücken finden und ausnutzen {#ai-models-can-autonomously-find-and-exploit-vulnerabilities}

Die neuesten KI-Systeme können bereits Software analysieren und schreiben.
Sie [können Sicherheitslücken finden](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) in Software und [sie könnten genutzt werden, um sie auszunutzen](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).
GPT-4 kann bereits [autonom Websites hacken](https://arxiv.org/html/2402.06664v1), indem es Aufgaben wie die Extraktion von Datenbankschemata und SQL-Injektionen ohne menschliches Feedback ausführt, was 18 Monate nach Abschluss des Trainings von GPT-4 entdeckt wurde.
GPT-4 übertrifft bereits [88%](https://arxiv.org/pdf/2402.11814.pdf) der menschlichen Hacker in einem CTF-Wettbewerb.
Es kann auch [autonom 87% der getesteten Sicherheitslücken ausnutzen](https://arxiv.org/abs/2404.08144), was einen enormen Fortschritt gegenüber GPT-3.5 oder Open-Source-Modellen darstellt, die alle 0% erreichten.
Teams aus mehreren LLMs [funktionieren noch besser](https://arxiv.org/abs/2406.01637) - sie können reale Zero-Day-Sicherheitslücken ausnutzen.
Wenn die Fähigkeiten von KI wachsen, werden auch die Sicherheitslücken, die sie erkennen können, und die Exploits, die sie erstellen können, zunehmen.
Sie sind noch nicht so gut darin wie die besten Menschen, also ist die Gefahr im Moment begrenzt.
Die Fähigkeiten nehmen jedoch rapide zu und können plötzlich stark ansteigen.

Es ist zu beachten, dass KI auch völlig neue Arten von Angriffen ermöglicht.
Zum Beispiel kann KI genutzt werden, um [das Passwort, das du getippt hast, aus einem Online-Anruf zu hören](https://beebom.com/ai-crack-password-listening-keyboard-sounds/)
oder [Wi-Fi zu nutzen, um Menschen durch Wände zu sehen](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).
KI kann auch genutzt werden, um [selbstmodifizierende Malware](https://www.hyas.com/blog/blackmamba-using-ai-to-generate-polymorphic-malware) zu erstellen, was es viel schwieriger macht, sie zu erkennen.

Es wird wahrscheinlich einen Punkt geben, an dem eine KI besser im Hacken ist als die besten menschlichen Hacker.
Dies kann auf viele Arten schiefgehen.

- **Infrastruktur**: Cyberwaffen können genutzt werden, um Zugang zu oder die Kontrolle über kritische Infrastruktur wie [Ölpipelines](https://de.wikipedia.org/wiki/Colonial_Pipeline_Ransomware-Angriff) oder [Stromnetze](https://obr.uk/box/cyber-attacks-during-the-russian-invasion-of-ukraine/) zu erlangen.
- **Finanzen**: Cyberwaffen können genutzt werden, um [Geld von Banken zu stehlen](https://de.wikipedia.org/wiki/2015%E2%80%932016_SWIFT_Banking_Hack) oder um [den Aktienmarkt zu manipulieren](https://de.wikipedia.org/wiki/2010_Flash_Crash).
- **Militär**: Geräte wie Waffen und Sensoren sind zunehmend von drahtloser Konnektivität und komplexer Software abhängig.

## Groß angelegte Cyberangriffe {#large-scale-cyberattacks}

Es ist möglich, dass eine solche leistungsfähige KI genutzt wird, um einen Virus zu erstellen, der eine große Anzahl von Zero-Day-Exploits nutzt.
Eine ausreichend leistungsfähige KI könnte den Quellcode aller Betriebssysteme und anderer Software analysieren und Sicherheitslücken finden.
Ein solcher Virus könnte jeden Computer infizieren, unabhängig vom Betriebssystem, über mehrere Kanäle wie Wi-Fi, Bluetooth, UTP usw.
Dies könnte volle Kontrolle über diese Maschinen geben und dem Kontroller ermöglichen, Daten zu stehlen, die Hardware für eigene Berechnungen zu nutzen, den Inhalt zu verschlüsseln, um Lösegeld zu erpressen, oder [die Maschine vollständig zu deaktivieren](https://de.wikipedia.org/wiki/Hardware-Trojaner).

Ein Virus wie dieser könnte als Werkzeug von Kriminellen erstellt werden, um Geld zu stehlen, oder als sehr zerstörerische Cyberwaffe von einer Nation oder terroristischen Organisation.
Wenn jedoch KI immer agenter wird, könnte sie auch autonom erstellt und eingesetzt werden von [fehlgeleiteter KI](/xrisk).

Wenn das Ziel eines Cyberangriffs darin besteht, Geräte und Infrastruktur zu deaktivieren, könnte der Schaden massiv sein.
Unsere Gesellschaft ist zunehmend von Computern und dem Internet abhängig.
Zahlungen, Transport, Kommunikation, Planung, Lieferketten, Stromnetze...
Wenn unsere Geräte nicht mehr ordnungsgemäß funktionieren, versagen auch viele Teile unserer Gesellschaft.

Über [93% der Cybersicherheitsexperten](https://www.weforum.org/publications/global-cybersecurity-outlook-2023/) glauben, dass „ein weitreichendes, katastrophales Cyberereignis in den nächsten zwei Jahren wahrscheinlich ist“.

## Minderung von KI-Cybersicherheitsrisiken {#mitigating-ai-cybersecurity-risks}

Die oben beschriebene Geschichte kann nur passieren, wenn:

1. Die **Fähigkeit, Zero-Day-Exploits zu finden**, entsteht. Aktuelle Modelle können bereits einige Sicherheitslücken entdecken, aber dies wird wahrscheinlich mit neueren Modellen verbessert.
2. Das **Modell in die Hände von böswilligen Akteuren gerät**. Dies kann passieren, wenn die Modellgewichte geleakt werden, wenn das Modell Open-Source ist oder wenn es von einem böswilligen Akteur entwickelt wird.
3. Die **Sicherheitslücken nicht gepatcht werden**, bevor ein solches Cyberwaffen eingesetzt wird. Leider sind die Verteidiger im Nachteil, wenn das Modell weit verbreitet ist, aus zwei Gründen:
   1. Patchen + Veröffentlichen + Deployen dauert viel länger als angreifen. Das Fenster der Verwundbarkeit ist größer als die Zeit, die benötigt wird, um den Angriff zu starten.
   2. Die Angreifer müssen nur eine Sicherheitslücke finden, während die Verteidiger alle finden müssen.

Es gibt verschiedene Maßnahmen, die wir ergreifen können, um dies zu bekämpfen:

- **Verhindern Sie die Ausbildung von Modellen, die Zero-Day-Exploits finden können**. Dies ist der effektivste Weg, um dies zu verhindern. Es ist der sicherste Weg, und es ist das, was wir [vorschlagen](/proposal).
- **Erlauben Sie nur die Veröffentlichung von Modellen nach umfangreichen Tests**. Wenn sie gefährliche Fähigkeiten haben, veröffentlichen Sie sie nicht.
- **Erlassen Sie strenge Cybersicherheitsvorschriften, um zu verhindern, dass Modellgewichte geleakt werden**. Wenn Sie gefährliche Modelle zulassen, stellen Sie sicher, dass sie nicht in die falschen Hände geraten.
- **Verlangen Sie von KI-Unternehmen, die KI zu nutzen, um Sicherheitslücken zu beheben**. Wenn ein Modell trainiert wird, das neue Sicherheitslücken finden kann, nutzen Sie dies, um Software-Entwickler zu kontaktieren, um diese Sicherheitslücken zu patchen. Geben Sie dem Patch-Prozess genügend Zeit, bevor das Modell veröffentlicht wird. Stellen Sie sicher, dass die Gewichte nicht geleakt werden, und schützen Sie das Modell, als ob es der Startcode für einen nuklearen Angriff wäre. Wenn dies richtig gemacht wird, kann KI die Cybersicherheit überall dramatisch verbessern.
