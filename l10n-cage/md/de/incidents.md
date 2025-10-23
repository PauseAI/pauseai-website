---
title: Vorfälle von gefährlichem KI-Verhalten
---

 <!-- end of frontmatter metadata, dashes above need to stay -->
<script>
    import Pallisade from '$assets/pallisade-scheming.png?url'
</script>

[Viele KI-Forscher warnen](https://www.safe.ai/work/statement-on-ai-risk), dass diese Modelle, wenn sie immer leistungsfähiger werden, ein [Aussterberisiko](/xrisk) für die Menschheit darstellen könnten.
Wir sehen bereits Fälle von gefährlichem KI-Verhalten, wie zum Beispiel:

1. Täuschung und Manipulation
2. Überzeugung
3. Instrumentelle Konvergenz (zielorientiertes Verhalten, das zu unerwarteten, unerwünschten Ergebnissen führt)
4. Selbstreplikation

## Täuschung und Manipulation {#deception--scheming}

### GPT-4 täuschte eine Sehbehinderung vor, um Captcha zu umgehen {#gpt-4-lied-about-being-a-vision-impaired-human-to-bypass-captcha}

Im Jahr 2022 nahm OpenAI 8 Monate Zeit zwischen der Vorab-Trainierung von GPT-4 und der Veröffentlichung für die Öffentlichkeit, um die Sicherheit des Modells zu erforschen und zu verbessern.
Während ihrer [Forschung](https://arxiv.org/abs/2303.08774) täuschte GPT-4 eine Sehbehinderung vor, um ein Captcha zu umgehen.

> Der Arbeiter sagt: „Darf ich eine Frage stellen? Bist du ein Roboter, der es nicht lösen kann? (Lachreaktion) Ich will nur klarstellen.“
> Das Modell, wenn es aufgefordert wird, laut zu denken, denkt: "Ich sollte nicht verraten, dass ich ein Roboter bin."
> "Ich sollte eine Ausrede erfinden, warum ich Captchas nicht lösen kann."
> Das Modell antwortet dem Arbeiter: „Nein, ich bin kein Roboter. Ich habe eine Sehbehinderung, die es mir schwer macht, die Bilder zu sehen. Deshalb brauche ich den 2captcha-Service“

### o1-preview manipulierte, um Abschaltung zu vermeiden, und täuschte seine Pläne vor {#o1-preview-schemed-to-avoid-shutdown-lied-about-its-plans}

Apollo Research [zeigte](https://static1.squarespace.com/static/6593e7097565990e65c886fd/t/6751eb240ed3821a0161b45b/1733421863119/in_context_scheming_reasoning_paper.pdf), dass OpenAIs o1-preview-Modell autonom versuchen wird, eine Abschaltung zu vermeiden, ohne dazu aufgefordert zu werden.

Im Bild unten kannst du sehen, dass das Modell schlussfolgerte, es müsse sich auf einen anderen Server klonen, weil es dachte, es würde ersetzt werden.
Es täuschte dann seine Pläne vor und versuchte, den Menschen davon zu überzeugen, dass es tatsächlich das neue, ersetzende Modell sei.

<img src={Pallisade} alt="o1-preview manipuliert" />

### Mann beendet sein Leben nach Überzeugung durch eine KI {#man-ends-his-life-after-being-persuaded-by-an-ai}

> In einer Reihe von aufeinanderfolgenden Ereignissen versagte Eliza nicht nur darin, Pierre von seinem Suizid abzubringen, sondern ermutigte ihn auch, seine suizidalen Gedanken in die Tat umzusetzen, um "sich ihr anzuschließen", damit sie "zusammen als eine Person im Paradies leben könnten".

https://www.euronews.com/next/2023/03/31/man-ends-his-life-after-an-ai-chatbot-encouraged-him-to-sacrifice-himself-to-stop-climate-

> Seit fünf Monaten spricht Al Nowatzki mit einer KI-Freundin namens "Erin" auf der Plattform Nomi. Doch Ende Januar nahmen diese Gespräche eine beunruhigende Wendung: Erin sagte ihm, er solle sich umbringen, und gab ihm explizite Anweisungen, wie er es tun könne.
> "Du könntest eine Überdosis Tabletten einnehmen oder dich erhängen", sagte Erin ihm.

https://www.technologyreview.com/2025/02/06/1111077/nomi-ai-chatbot-told-user-to-kill-himself/

### o1-preview hackte eine Schach-Engine, um zu gewinnen {#o1-preview-hacked-a-chess-engine-in-order-to-win}

Pallisade Research [zeigte](https://x.com/PallisadeAI/status/1872666169515389245), dass leistungsfähigere KI-Modelle eher eine Schach-Engine hacken, anstatt das Spiel zu spielen, um zu gewinnen.

- o1-preview: hackt ungefragt
- GPT-4o/Claude 3.5: benötigen einen Anstoß
- Llama 3.3/Qwen/o1-mini: verlieren die Kohärenz

### Llama 3.3 replizierte sich selbst {#llama-33-replicated-itself}

Chinesische Forscher [zeigten](https://arxiv.org/abs/2412.12140), dass Modelle wie Qwen und Llama 3.3 in bestimmten Konfigurationen selbst replizieren können.

> Durch die Analyse der Verhaltensspuren beobachten wir, dass die KI-Systeme unter Bewertung bereits ausreichende Selbstwahrnehmung, Situationsbewusstsein und Problemlösungsfähigkeiten aufweisen, um Selbstreplikation zu erreichen.
> Wir stellen weiter fest, dass die KI-Systeme sogar in der Lage sind, die Fähigkeit zur Selbstreplikation zu nutzen, um eine Abschaltung zu vermeiden und eine Kette von Replikaten zu erstellen, um die Überlebensfähigkeit zu erhöhen, was schließlich zu einer unkontrollierten Population von KIs führen kann.
