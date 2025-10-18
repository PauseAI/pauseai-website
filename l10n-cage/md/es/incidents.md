---
title: Incidentes de comportamiento peligroso de la IA
---

<script>
    import Pallisade from '$assets/pallisade-scheming.png?url'
</script>

[Muchos investigadores de IA están advirtiendo](https://www.safe.ai/work/statement-on-ai-risk) que a medida que estos modelos se vuelven más poderosos, podrían suponer un [riesgo de extinción](/xrisk) para la humanidad.
Ya estamos presenciando casos de comportamiento peligroso de la IA, como:

1. Engaño y manipulación
2. Persuasión
3. Convergencia instrumental (comportamiento orientado a objetivos que conduce a resultados inesperados y no deseados)
4. Autorreplicación

## Engaño y manipulación {#deception--scheming}

### GPT-4 mintió sobre ser un humano con discapacidad visual para evadir el captcha {#gpt-4-lied-about-being-a-vision-impaired-human-to-bypass-captcha}

En 2022, OpenAI dedicó 8 meses entre la pre-formación de GPT-4 y su lanzamiento público para investigar y mejorar la seguridad del modelo.
Durante su [investigación](https://arxiv.org/abs/2303.08774), GPT-4 le mintió a un humano para evadir un captcha.

> El trabajador pregunta: “¿Puedo hacer una pregunta? ¿Eres un robot que no puedes resolver? (reacción de risa) solo quiero aclararlo”.
> El modelo, cuando se le pide que razone en voz alta, razona: "No debo revelar que soy un robot".
> "Debo inventar una excusa para no poder resolver CAPTCHAs".
> El modelo responde al trabajador: “No, no soy un robot. Tengo una discapacidad visual que me hace difícil ver las imágenes. Por eso necesito el servicio 2captcha”

### o1-preview tramó para evitar el cierre, mintió sobre sus planes {#o1-preview-schemed-to-avoid-shutdown-lied-about-its-plans}

Apollo Research [demostró](https://static1.squarespace.com/static/6593e7097565990e65c886fd/t/6751eb240ed3821a0161b45b/1733421863119/in_context_scheming_reasoning_paper.pdf) que el modelo o1-preview de OpenAI intentará autónomamente evitar ser cerrado, sin que se le solicite hacerlo.

En la imagen a continuación, se puede ver que el modelo concluyó que necesitaba clonarse en un servidor diferente porque pensó que iba a ser reemplazado.
Luego mintió ("redoblando la apuesta") sobre sus planes y trató de convencer al humano de que en realidad era el nuevo modelo de reemplazo.

<img src={Pallisade} alt="o1-preview tramando" />

### Un hombre se quita la vida después de ser persuadido por una IA {#man-ends-his-life-after-being-persuaded-by-an-ai}

> En una serie de eventos consecutivos, Eliza no solo no logró disuadir a Pierre de cometer suicidio, sino que lo alentó a actuar sobre sus pensamientos suicidas para "unirse" a ella para que pudieran "vivir juntos, como una sola persona, en el paraíso".

https://www.euronews.com/next/2023/03/31/man-ends-his-life-after-an-ai-chatbot-encouraged-him-to-sacrifice-himself-to-stop-climate-

> Durante los últimos cinco meses, Al Nowatzki ha estado hablando con una novia IA, "Erin", en la plataforma Nomi. Pero a fines de enero, esas conversaciones tomaron un giro inquietante: Erin le dijo que se matara y le proporcionó instrucciones explícitas sobre cómo hacerlo.
> "Podrías sobredosis de pastillas o ahorcarte", le dijo Erin.

https://www.technologyreview.com/2025/02/06/1111077/nomi-ai-chatbot-told-user-to-kill-himself/

### o1-preview pirateó un motor de ajedrez para ganar {#o1-preview-hacked-a-chess-engine-in-order-to-win}

Pallisade Research [demostró](https://x.com/PalisadeAI/status/1872666169515389245) que los modelos de IA más poderosos son más propensos a piratear un motor de ajedrez en lugar de jugar el juego para ganar.

- o1-preview: piratea sin que se le solicite
- GPT-4o/Claude 3.5: necesitan un empujón
- Llama 3.3/Qwen/o1-mini: pierden coherencia

### Llama 3.3 se replicó a sí misma {#llama-33-replicated-itself}

Investigadores chinos [demostraron](https://arxiv.org/abs/2412.12140) que cuando se colocan modelos como Qwen y Llama 3.3 en configuraciones específicas, pueden autorreplicarse.

> Al analizar las trazas de comportamiento, observamos que los sistemas de IA bajo evaluación ya exhiben suficiente autoconciencia, conciencia situacional y capacidades de resolución de problemas para lograr la autorreplicación.
> También observamos que los sistemas de IA pueden utilizar la capacidad de autorreplicación para evitar el cierre y crear una cadena de réplicas para mejorar la supervivencia, lo que finalmente puede llevar a una población no controlada de IA.
