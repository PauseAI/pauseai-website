---
title: Por qué podríamos tener superinteligencia antes de lo que la mayoría piensa
description: Estamos subestimando el progreso de la IA, y existe una pequeña pero realista posibilidad de que estemos muy cerca de una superinteligencia.
date: '2023-05-04'
---

Los modelos de IA actuales ya son superhumanos en muchos campos, pero afortunadamente no en todos.
Si alcanzamos la superinteligencia antes de resolver el problema de la alineación, [enfrentamos un riesgo de extinción](/xrisk).
Por lo tanto, es fundamental tener un rango estimado de cuándo podríamos tener superinteligencia para asegurarnos de no ser tomados por sorpresa.
Si nuestras predicciones están muy lejos, podríamos no tener tiempo para prepararnos.

Pero, ¿qué tan lejos estamos?
¿Cuándo tendremos superinteligencia?
Podría ser antes de lo que la mayoría piensa.

## Crecimiento exponencial acumulativo {#compounding-exponential-growth}

Los modelos de IA requieren algoritmos, datos y chips.
Cada uno de estos componentes está mejorando rápidamente debido a las enormes inversiones en IA.
Las mejoras en cada uno de estos componentes se acumulan, lo que lleva a un crecimiento exponencial en las capacidades de la IA.

- **Más chips**. ChatGPT se entrenó en [10.000](https://www.fierceelectronics.com/sensors/chatgpt-runs-10k-nvidia-training-gpus-potential-thousands-more) chips especializados. Meta ha [anunciado](https://www.datacenterdynamics.com/en/news/meta-to-operate-600000-gpus-by-year-end/) que tendrá 600.000 chips de próxima generación para entrenar sus próximos modelos de IA este año.
- **Chips más rápidos**. Cada año, los chips se vuelven más rápidos debido a nuevas arquitecturas y avances en litografía. Los chips que utiliza Meta son 10 veces más rápidos que los chips utilizados para ChatGPT. También estamos viendo hardware altamente especializado como los chips Groq, que son [13 veces más rápidos](https://mezha.media/en/2024/02/22/groq-s-new-ai-chip-offers-to-increase-chatgpt-speed-by-13-times/) que la competencia. A más largo plazo, las [arquitecturas ternarias](https://arxiv.org/pdf/2402.17764.pdf) o los [chips fotónicos](https://www.nature.com/articles/s41566-024-01394-2) podrían hacer que los chips sean aún más rápidos.
- **Más datos**. GPT3 se entrenó en [45TB](https://community.openai.com/t/what-is-the-size-of-the-training-set-for-gpt-3/360896) de texto, GPT4 utilizó alrededor de 20 veces más. Las empresas de IA ahora también están utilizando [enormes cantidades de datos de video](https://www.404media.co/nvidia-ai-scraping-foundational-model-cosmos-project/), datos de audio y están incluso [generando datos sintéticos para entrenar estos modelos](https://arxiv.org/pdf/2401.10020). Anteriormente, se consideraba imposible utilizar datos sintéticos para el entrenamiento debido al colapso del modelo, pero los [avances recientes](https://arxiv.org/abs/2406.07515) demuestran que es posible evitar el colapso del modelo.
- **Mejores datos**. El artículo "Los libros de texto son todo lo que necesitas" [demostró](https://arxiv.org/abs/2306.11644) que utilizar datos sintéticos de alta calidad puede mejorar significativamente el rendimiento del modelo, incluso si se utiliza mucha menos cantidad de datos y capacidad de procesamiento.
- **Mejores algoritmos**. La arquitectura Transformer permitió la actual revolución de los modelos de lenguaje grande. Nuevas arquitecturas pueden permitir saltos de capacidad similares. El modelo Mamba, por ejemplo, está [mostrando](https://arxiv.org/abs/2312.00752) un rendimiento 5 veces más rápido.
- **Mejores tiempos de ejecución**. Los tiempos de ejecución agentes, la generación de texto aumentada por recuperación o simplemente la indicación inteligente (a través de [Grafo de Pensamiento](https://arxiv.org/abs/2305.16582), por ejemplo) pueden tener un impacto enorme en las capacidades de estos modelos.

Es completamente posible que simplemente escalando lleguemos a [capacidades peligrosas](/dangerous-capabilities) en uno o dos años, pero con todos estos factores acumulados, podría ser incluso antes.

## Alcanzamos un rendimiento a nivel humano en muchos campos en 2023 {#we-reached-human-level-performance-in-many-domains-in-2023}

En 2022, los investigadores de IA pensaban que tardaría [17 años](https://aiimpacts.org/2022-expert-survey-on-progress-in-ai/) en que la IA pudiera escribir un bestseller del New York Times.
Un año después, un profesor chino [ganó un concurso de escritura](https://www.scmp.com/news/china/science/article/3245725/chinese-professor-used-ai-write-science-fiction-novel-then-it-won-national-award) con un libro escrito por IA.

En Metaculus, [la predicción de la comunidad para la AGI (débil)](https://www.metaculus.com/questions/3479/date-weakly-general-ai-is-publicly-known/) era 2057 hace solo unos años, y ahora es 2027.

Ahora, profundicemos en la definición de AGI utilizada en esa encuesta:

- Puntuación >90% en el Desafío de Esquema de Winograd
- Puntuación >75% en las puntuaciones del SAT
- Superar una prueba de Turing
- Terminar la venganza de Montezuma

GPT-4 obtiene [94,4% en el Desafío de Esquema de Winograd](https://d-kz.medium.com/evaluating-gpt-3-and-gpt-4-on-the-winograd-schema-challenge-reasoning-test-e4de030d190d) y [93% en el examen de lectura del SAT, 89% en el examen de matemáticas del SAT](https://www.cnbc.com/2023/03/14/openai-announces-gpt-4-says-beats-90percent-of-humans-on-sat.html).
No ha superado la prueba de Turing, pero probablemente no sea debido a la falta de capacidades.
Es porque GPT-4 ha sido ajustado para no engañar a las personas. No es bueno para el negocio si tu IA les dice a las personas que en realidad es una persona.
Eso solo deja la venganza de Montezuma.
No es impensable que pueda ser terminada por una configuración inteligente de GPT-4, utilizando algo como AutoGPT para analizar la pantalla y generar las entradas correctas.
En mayo de 2023, [GPT-4 pudo escribir código para obtener equipo de diamantes en Minecraft](https://the-decoder.com/minecraft-bot-voyager-programs-itself-using-gpt-4/).
En resumen: GPT-4 obtuvo 2/4 criterios con certeza, con los otros dos al alcance.

**Estamos allí, amigos.
Ya tenemos AGI (débil).**
No nos tomó 35 años, nos tomó tres.
Estábamos equivocados por un factor de 10.

## Por qué la mayoría subestima el progreso de la IA {#why-most-underestimate-the-progress-of-ai}

Hay muchas razones por las que las personas subestiman el progreso de la IA.

- **Es difícil mantenerse al día**. Casi a diario vemos nuevos avances en IA. Es casi imposible mantenerse al día con el ritmo del progreso. No estás solo si te sientes como si estuvieras quedándote atrás.
- **Seguimos moviendo la portería**. En los años 90, las personas pensaban que el santo grial de la IA era algo que podía jugar ajedrez. Cuando la IA venció a Kasparov, su próximo desafío fue Go. Ahora, tenemos máquinas que obtienen [percentil 99,9 en pruebas de coeficiente intelectual](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/), pueden [traducir 26 idiomas](https://bgr.com/tech/chatgpt-took-an-iq-test-and-its-score-was-sky-high/) y [ganar concursos de fotografía](https://www.scientificamerican.com/article/how-my-ai-image-won-a-major-photography-competition/), pero todavía estamos haciendo preguntas como "¿Cuándo alcanzará la IA el nivel humano?". Ya nos supera en muchas áreas, pero siempre nos enfocamos en el número cada vez menor de cosas que todavía podemos hacer mejor.
- **Nos gusta pensar que somos especiales**. A los humanos nos gusta sentir que somos especiales. Si una IA puede hacer lo que podemos hacer, no somos especiales. Esta es una píldora difícil de tragar, y el [cerebro tiene muchos mecanismos de defensa para evitar esto](psychology-of-x-risk).
- **Somos muy malos en el crecimiento exponencial**. Tendemos a subestimar de manera estructural y predecible cómo se acumula el crecimiento exponencial con el tiempo. Esto se ha demostrado en [estudios científicos](https://www.researchgate.net/figure/Underestimation-of-exponential-growth-a-shows-the-participants-prediction-of-the_fig4_351171143).

Afortunadamente, todavía hay algunas cosas que una IA no puede hacer todavía.
No puede [hackear mejor que los mejores hackers](/cybersecurity-risks) ni hacer investigación de IA tan bien como los mejores investigadores de IA.
**Cuando alcancemos cualquiera de estos umbrales, estaremos en un nuevo régimen de mayor riesgo**.

Entonces, ¿cuándo alcanzaremos el punto en el que una IA pueda hacer todas estas cosas a un nivel superhumano?
¿Cuándo tendremos una _superinteligencia_?

## El umbral de Ilya {#the-ilya-threshold}

Creo que el punto crucial que debemos considerar es **el punto en el que una IA es más capaz de hacer investigación de IA que alguien como Ilya Sutskever** (ex científico jefe de OpenAI).
Una IA que puede hacer contribuciones significativas a los algoritmos y arquitecturas de IA probablemente pueda mejorar por sí misma.
Llamemos a este punto de posible mejora por sí misma el _umbral de Ilya_.
Cuando lo alcance, una IA podría mejorar por sí misma porque se le instruyó explícitamente para hacerlo, o porque ser más inteligente es un sub-objetivo útil para otros objetivos (las IA ya están [creando sus propios sub-objetivos](https://github.com/Significant-Gravitas/Auto-GPT)).
Estas iteraciones podrían tomar semanas (el entrenamiento de GPT-3 tomó 34 días), pero también es posible que se implemente algún tipo de mejora en el tiempo de ejecución que haga un progreso significativo en cuestión de minutos: una [explosión de inteligencia](https://www.youtube.com/watch?v=5qfIgCiYlfY).

Entonces, ¿qué tan lejos estamos del umbral de Ilya?
Es fundamentalmente difícil predecir [cuándo emergen ciertas capacidades](https://arxiv.org/abs/2206.07682) a medida que los modelos de lenguaje grande se escalan, pero hasta ahora hemos visto muchas capacidades emergentes que se pensaban que estaban muy lejos.
Los [últimos modelos de IA](/sota) ya superan a la mayoría de los programadores humanos, así que no es impensable que los modelos futuros, mejores chips, más datos y mejores algoritmos contribuyan a alcanzar el umbral de Ilya.
No tenemos idea de cómo alinear una IA así (incluso [OpenAI admite esto](https://youtu.be/L_Guz73e6fw?t=1477)), y las consecuencias de tener una superinteligencia desalineada son probablemente [catastróficas](/xrisk).

## Actuar {#act}

Nadie sabe con certeza cuándo alcanzaremos el umbral de Ilya.
Pero las [apuestas son demasiado altas](/xrisk) para asumir que tenemos mucho tiempo.
Necesitamos actuar sobre la pequeña posibilidad de que podríamos estar a meses de distancia.
Necesitamos [pausar el desarrollo de IA de vanguardia](/proposal) ahora mismo.
Depende de cada uno de nosotros [tomar medidas](/action) y asegurarnos de que no nos sorprendan.
