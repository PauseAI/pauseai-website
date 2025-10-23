---
title: Regulación de capacidades peligrosas en la IA
description: Cuanto más poderosa se vuelve la IA en dominios específicos, mayores son los riesgos. ¿Cómo podemos prevenir que estas capacidades peligrosas aparezcan o se propaguen?
---

En este artículo, discutiremos:

- ¿Qué capacidades de la IA pueden ser peligrosas?
- ¿Cómo podemos prevenir que estas capacidades aparezcan o se propaguen?
- ¿Por qué es peligroso confiar únicamente en las [evaluaciones](/evaluations) como medida de política

A medida que los modelos de IA se vuelven más poderosos y útiles, también se vuelven más peligrosos.
Entonces, ¿en qué punto debemos proceder con cautela?
Un umbral particular que se menciona a menudo es la AGI (Inteligencia General Artificial).
Hay mucho debate sobre qué significa exactamente la AGI.
Algunos dicen que es cuando la IA puede realizar todas las tareas cognitivas que pueden hacer los humanos.
Algunos dicen que GPT-4 ya es AGI.
Steve Wozniak define la AGI como el primer sistema que puede entrar en una cocina y preparar una taza de café de manera autónoma.

Desde una perspectiva de seguridad, la definición de AGI no es tan importante.
De hecho, puede darnos una falsa sensación de seguridad, porque podríamos pensar que estamos seguros hasta que alcanzamos la AGI.
Incluso si una IA no puede preparar una taza de café, todavía puede ser peligrosa.
Lo que importa es _qué capacidades tiene una IA_.

En este artículo, exploraremos varias capacidades peligrosas y qué podemos hacer para prevenir que nos causen daño.

## ¿Qué capacidades pueden ser peligrosas? {#which-capabilities-can-be-dangerous}

- **Ciberseguridad**. Cuando una IA puede descubrir vulnerabilidades de seguridad (especialmente nuevas y desconocidas), puede (ser utilizada para) [hackear sistemas](/cybersecurity-risks). Los sistemas de IA actuales pueden encontrar algunas vulnerabilidades de seguridad, pero no aún a niveles avanzados peligrosos. Sin embargo, a medida que aumentan las capacidades de ciberseguridad, también lo hace el daño potencial que podría causar un ciberarma asistida por IA. Los ciberataques a gran escala podrían interrumpir nuestra infraestructura, deshabilitar pagos y causar caos.
- **Biológicas**. Diseñar agentes biológicos nuevos o ayudar en el proceso de ingeniería de una pandemia. Un grupo de estudiantes pudo utilizar un chatbot para [producir todos los pasos necesarios para crear una nueva pandemia](https://arxiv.org/abs/2306.03809). Una IA diseñada para encontrar medicamentos seguros se utilizó para descubrir [40.000 nuevas armas químicas en seis horas](https://www.theverge.com/2022/3/17/22983197/ai-new-possible-chemical-weapons-generative-models-vx).
- **Mejoras algorítmicas**. Una IA que puede encontrar algoritmos eficientes para un problema determinado podría llevar a un bucle recursivo de auto-mejora, girando rápidamente fuera de control. Esto se llama una _explosión de inteligencia_. La IA resultante sería increíblemente poderosa y podría tener todo tipo de capacidades peligrosas. Afortunadamente, no hay IA que pueda auto-mejorar todavía. Sin embargo, hay IA que pueden encontrar nuevos algoritmos muy eficientes (como [AlphaDev](https://www.deepmind.com/blog/alphadev-discovers-faster-sorting-algorithms)).
- **Engaño**. La capacidad de manipular a las personas, lo que incluye la ingeniería social. Varias formas de engaño ya están [presentes](https://lethalintelligence.ai/post/ai-hired-human-to-solve-captcha/) en los sistemas de IA actuales. Por ejemplo, el CICERO de Meta (que se entrenó para llevar a una "cooperación más natural entre humanos y IA") resultó ser un experto mentiroso, engañando a otros agentes en el juego. Una IA que puede engañar a los humanos puede engañarlos durante las ejecuciones de entrenamiento. Podría ocultar sus capacidades o intenciones.
- **Auto-replicación**. Si una IA puede crear nuevas instancias en otras máquinas, hay un riesgo de que se propague sin control, lo que podría llevar a una [_toma de control de la IA_](/ai-takeover). Una IA lo suficientemente capaz podría superar a los humanos y llevar a la [extinción humana](/xrisk). Tenga en cuenta que esto podría suceder incluso antes de que se implemente un modelo de IA.

Esta lista no es exhaustiva, por lo que hay otras capacidades peligrosas que podría tener una IA.

## Prevenir la creación de capacidades peligrosas {#preventing-creation-of-dangerous-capabilities}

¿Podemos prevenir que aparezcan estas capacidades peligrosas?
A medida que las IA se vuelven más grandes y se entrenan con más datos, adquieren nuevas habilidades.
Resulta que es muy difícil predecir qué habilidades aparecerán y cómo se desempeñará una IA.
Debido a esto, a menudo se les llama _Capacidades Emergentes_.

<!-- Ejemplo sobre teoría de la mente, gráfico -->

Nuestro paradigma actual de grandes modelos de lenguaje es casi inherentemente impredecible.
Los modelos de IA no se escriben como software: se entrenan.
Son cajas negras que consisten en miles de millones de parámetros numéricos.
Nadie sabe realmente qué está sucediendo dentro.
Esta imprevisibilidad hace que sea difícil decir si una ejecución de entrenamiento resultará en una IA peligrosa.
La investigación de interpretación puede cambiar esto en el futuro, pero por ahora, no podemos explicar realmente por qué la IA hace lo que hace.

Entonces, prevenir la creación de capacidades peligrosas solo se puede hacer de una manera:
no construir sistemas de IA cada vez más poderosos en primer lugar.
Esta sería la forma más segura de avanzar, pero no es lo que proponen los laboratorios de IA.

## Prevenir la proliferación de capacidades peligrosas {#preventing-the-proliferation-of-dangerous-capabilities}

En este momento, está sucediendo mucho en el espacio de regulación de la IA.
Muchas de estas propuestas (incluidas todas las que provienen de laboratorios de IA) se basan en **evaluaciones** (o _evals_): pruebas previas a la implementación de modelos de IA.
Un ejemplo de estos enfoques basados en evaluaciones es el [enfoque RSP de Anthropic](https://evals.alignment.org/blog/2023-09-26-rsp/#:~:text=An%20RSP%20specifies%20what%20level,capabilities%20until%20protective%20measures%20improve.) o el enfoque de [Pausa Coordinada](https://www.governance.ai/research-paper/coordinated-pausing-evaluation-based-scheme) de GovAI.
Nos referimos a esto como [regulación de nivel 2](/4-levels-of-ai-regulation).
Estas evaluaciones no impiden que se _creen_ IA peligrosas, pero sí impiden que se _implementen_.
Este tipo de política es relativamente barato y todavía permite a los laboratorios de IA continuar su investigación.
Sin embargo, creemos que este enfoque es muy peligroso:

- **Los modelos pueden filtrarse**.
  Vimos que esto sucedió con el modelo LLAMA de Meta. Una vez que está allí, no hay vuelta atrás.
- **Algunas capacidades son peligrosas incluso dentro de los laboratorios de IA**.
  Una IA auto-replicante, por ejemplo, podría [escapar del laboratorio antes de la implementación](https://lethalintelligence.ai/post/ai-escaped-its-container/).
- **Es difícil probar las capacidades peligrosas**.
  No sabemos cómo podemos (de manera segura) probar si una IA puede auto-replicarse, por ejemplo. O cómo probar si engaña a los humanos
- **Las capacidades pueden agregarse o descubrirse después del entrenamiento**.
  Esto incluye el ajuste fino, la ruptura de la cárcel y las mejoras en tiempo de ejecución.

Profundizaremos en este último punto con más detalle.

## Las capacidades pueden agregarse después del entrenamiento {#capabilities-can-be-added-after-training}

### Ajuste fino {#fine-tuning}

El ajuste fino se puede utilizar para mejorar las capacidades de un modelo de IA existente.
Esto es similar al entrenamiento, pero es mucho más rápido, mucho más barato, no requiere tantos datos y a menudo se puede hacer en hardware de consumo.
El ajuste fino cambia los parámetros de la IA y, como tal, cambia sus capacidades.
Ahora, el ajuste fino no es tan poderoso como hacer una ejecución de entrenamiento completa, pero todavía puede mejorar las capacidades existentes.

### Ruptura de la cárcel {#jailbreaking}

Las IA más grandes se entrenan con cantidades absolutamente vastas de datos.
La mayoría de los libros, artículos científicos y sitios web de Internet.
Hay muchas cosas desagradables en estos conjuntos de datos.
Las IA a menudo se ajustan mediante una técnica llamada RLHF (Aprendizaje por Refuerzo de Retroalimentación Humana) para que sean útiles y agradables.
En este proceso, la IA tiene que aprender a no decir ciertas cosas, como hacer comentarios racistas, explicar cómo hacer una bomba o cómo crear un arma biológica nueva.

Pero estas salvaguardias no son perfectas.
La llamada "ruptura de la cárcel" es una técnica en la que se intenta que la IA ignore estas salvaguardias.
Esto se puede hacer [agregando algunas palabras o caracteres específicos al mensaje de chat](https://twitter.com/AIPanicLive/status/1678942758872989696), o [reformulando creativamente el mensaje](https://twitter.com/_annieversary/status/1647865782741749760).
No está [claro](https://llm-attacks.org/) si tal comportamiento puede parchearse completamente.

### Mejoras en tiempo de ejecución {#runtime-improvements}

Las mejoras en tiempo de ejecución no cambian el modelo, sino que mejoran la forma en que se utiliza el modelo.

La más simple de estas es cambiar las indicaciones.
Incluso pequeños cambios en las indicaciones pueden tener un gran efecto en la salida del modelo.
Agregar algunas palabras a una indicación puede mejorar el rendimiento [en más del 50%](https://arxiv.org/pdf/2309.03409.pdf).

Pero también podemos utilizar todo tipo de software para aumentar un modelo base.
Por ejemplo, la gente ha encontrado formas de agregar memoria a largo plazo a GPT-4, permitiendo que el modelo consulte una base de datos.
O considere AutoGPT, que permite que un modelo se llame a sí mismo de manera recursiva, lo que significa que puede ejecutarse de forma autónoma durante cualquier período de tiempo.
O considere [Voyager](https://arxiv.org/abs/2305.16291), una herramienta que permitió a GPT-4 jugar Minecraft de forma completamente autónoma. Incluso llegó a equipo de diamantes.

No sabemos hasta dónde se puede estirar un modelo base.
Incluso si dejamos de entrenar nuevos modelos de IA ahora, probablemente veremos innovaciones importantes que agreguen nuevas capacidades a los modelos existentes.

## En conclusión {#in-conclusion}

Las capacidades peligrosas de la IA pueden llevar a todo tipo de problemas: ciberataques a gran escala, pandemias diseñadas y IA descontrolada que [toma el control](/ai-takeover).
Es tentador confiar en las evaluaciones para prevenir que aparezcan o se propaguen estas capacidades peligrosas, pero este es un enfoque peligroso:

- Incluso si probamos los modelos antes de que se implementen, todavía hay formas en que pueden obtener capacidades peligrosas después de la implementación (ajuste fino, ruptura de la cárcel, mejoras en tiempo de ejecución).
- Los modelos pueden filtrarse.
- Algunas capacidades son peligrosas incluso dentro de los laboratorios de IA.

La única opción segura es no construir estos sistemas de IA poderosos en primer lugar.
No debemos permitir la creación de estos sistemas de IA impredecibles y potencialmente muy peligrosos.
[Desafortunadamente, no hay una sola propuesta de borrador que actualmente prevenga o retrase la IA superinteligente.](https://twitter.com/PauseAI/status/1704998018322141496)
¡Eso es por lo que estamos [pidiendo una pausa](/proposal)!
