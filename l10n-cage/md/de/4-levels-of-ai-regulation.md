---
title: 4 Ebenen der KI-Sicherheitsregulierung
description: Ein Rahmenwerk zum Nachdenken darüber, wie die Risiken durch leistungsfähige KI-Systeme gemildert werden können
image: /4levels.png
---

Mit zunehmenden KI-Fähigkeiten steigen auch die Risiken, die diese Systeme für die Menschheit darstellen.
Viele Wissenschaftler haben bereits vor dem Risiko des menschlichen Aussterbens gewarnt.

In diesem Artikel stellen wir unser 4-Ebenen-Rahmenwerk für die Regulierung der KI-Sicherheit vor.

## KI-Pipeline als Rahmenwerk für Sicherheitsgovernance {#ai-pipeline-as-a-framework-for-safety-governance}

Die KI-Erstellungspipeline besteht aus verschiedenen Schritten, die jeweils auf unterschiedliche Weise reguliert werden können.
Diese Pipeline umfasst:

- **Hardware und Algorithmen**, die für das Training von KI-Modellen verwendet werden
- **Trainingsläufe**, bei denen die Hardware und Algorithmen verwendet werden, um ein Modell zu erstellen
- **Bereitstellung**, bei der das trainierte Modell der Öffentlichkeit zugänglich gemacht wird
- **Nutzung**, bei der das bereitgestellte Modell von Einzelpersonen und Unternehmen genutzt wird

Je später wir in der Pipeline regulieren, desto höher sind die Risiken, denen wir ausgesetzt sind.
Wenn wir ein hohes Maß an Sicherheit erreichen wollen, müssen wir früher in der Pipeline regulieren.
Deshalb gehen wir, wenn wir die 4 Ebenen der KI-Regulierung durchlaufen, die KI-Erstellungspipeline rückwärts.

![4 Ebenen der KI-Sicherheitsregulierung](/4levels.png)

## Ebene 1: Regulierung der Nutzung {#level-1-regulate-usage}

Beispiele:

- **Verbot von autonomen Agenten-Laufzeiten** (wie AutoGPT)
- **Verbot von gefährlichen Anweisungen**

Diese Maßnahmen sollen verhindern, dass Benutzer gefährliche oder schädliche Aktionen mit KI-Modellen durchführen.
Auf dieser Ebene liegt die Verantwortung bei den Benutzern der Modelle, nicht bei den Entwicklern.
Wir sind darauf angewiesen, dass alle Benutzer die Regulierungen einhalten.
Dies bietet jedoch nur einen begrenzten Schutz gegen KI-Gefahren.

## Ebene 2: Regulierung der Bereitstellung {#level-2-regulate-deployment}

Beispiele:

- **Anforderungen an Red-Teaming**. Dies bedeutet, dass ein KI-Modell vor seiner Bereitstellung von einem Red-Team getestet wird, um zu sehen, ob es gehackt oder missbraucht werden kann.
- **Verbot der Bereitstellung und Open-Sourcing** von Modellen mit gefährlichen Fähigkeiten.

Wenn wir die Bereitstellung regulieren, verhindern wir, dass gefährliche Modelle verfügbar sind.
Dies bedeutet, dass die Verantwortung bei den Entwicklern der Modelle liegt.
Dies ist eine sicherere Situation als Ebene 1, da wir nun auf eine kleinere Gruppe von Menschen angewiesen sind, verantwortungsvoll zu handeln.

Allerdings lassen wir immer noch gefährliche Trainingsläufe zu, so dass Unfälle in KI-Labors weiterhin möglich sind.

## Ebene 3: Regulierung der Trainingsläufe {#level-3-regulate-training-runs}

Beispiele:

- **Sicherheitsnachweis** vor der Erteilung der Erlaubnis, ein bestimmtes Modell zu trainieren. Dies kann auch einen formalen Nachweis der Ausrichtung umfassen.
- **Festlegung einer Skalierungsobergrenze** für das Training neuer Modelle.
- **Lizenzierungspflicht** für das Training von KI-Modellen.
- **Verbot des Trainings auf gefährlichen Datentypen**.
- **Verbot des Trainings auf urheberrechtlich geschützten Daten**.

Wenn wir die Trainingsläufe regulieren, verhindern wir, dass gefährliche Modelle überhaupt erstellt werden.
Dies wird Unfälle in KI-Labors, die sich an die Regulierungen halten, verhindern.

Allerdings lassen wir immer noch die Verteilung von Hardware und Algorithmen zu, die für das Training gefährlicher Modelle verwendet werden können.

## Ebene 4: Regulierung von Hardware und Algorithmen {#level-4-regulate-hardware--algorithms}

Beispiele:

- **Begrenzung der Verteilung von Trainingshardware**.
- **Verbot der Veröffentlichung neuer Trainingsarchitekturen**.

Wenn wir auch Hardware und Algorithmen regulieren, machen wir es nicht nur illegal, sondern auch sehr schwierig, gefährliche Modelle zu trainieren.
Dies bietet uns den besten Schutz gegen die Risiken durch KI.

## Einschränkungen {#limitations-1}

Hinweis: Dieses Rahmenwerk ist nicht perfekt, und nicht alle möglichen Arten von KI-Regulierungen passen sauber in eine der genannten Ebenen.

## Schlussfolgerungen {#conclusions}

In diesem Artikel haben wir unser 4-Ebenen-Rahmenwerk für die Regulierung der KI-Sicherheit vorgestellt.
Mit diesem Modell können wir leichter über die Wirksamkeit von KI-Regulierungen nachdenken.
Wir können auch sehen, dass die ersten beiden Ebenen keinen großen Schutz gegen die Risiken durch KI bieten.
Die Verhinderung gefährlicher Trainingsläufe und die Regulierung von Hardware und Algorithmen sind weit zuverlässigere Wege, um Sicherheit zu gewährleisten.
