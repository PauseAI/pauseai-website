---
title: Crear el Botón de Pausa
description: ¿Cómo sería una pausa en la IA? ¿Cómo podemos evitar realmente la creación de una superinteligencia?
---

Si permitimos la creación de una IA superinteligente, estamos [poniendo en riesgo cada vida en la Tierra](/xrisk).
Cuando hablamos de una pausa, nos referimos a [implementar una prohibición internacional sobre la creación de una IA superinteligente](/proposal).
Algunos argumentan que es demasiado pronto para presionar el botón de pausa (no [estamos](/urgency)), pero la mayoría de los expertos parecen estar de acuerdo en que puede ser beneficioso hacer una pausa si los avances van demasiado rápido.
Sin embargo, por ahora, _no tenemos un botón de pausa_.
Así que debemos empezar a pensar en cómo funcionaría esto y cómo podemos implementarlo.
Afortunadamente, crear una IA superinteligente es difícil y requiere muchos recursos.

_Esta página es un trabajo en progreso gestionado por el equipo de Crear el Botón de Pausa en PauseAI, como parte del Campamento de Seguridad de IA 2025._

## Contenido {#contents}

## La Carrera: por qué necesitamos cooperación internacional {#the-race-why-we-need-international-cooperation}

No esperamos que ningún país pueda implementar una pausa por sí solo.
Los incentivos económicos son demasiado fuertes, y frenar el desarrollo de la IA pondría a un país en desventaja económica y geopolítica.
Los costos de invertir poco en seguridad se distribuyen globalmente, mientras que los beneficios de acelerar son locales.
Este problema teórico de juegos se conoce a veces como "Moloch" o una "Carrera hacia el Abismo".

La única salida es tener un _acuerdo internacional_.
Por eso estamos tan enfocados en las [cumbres](/summit): estos son los eventos donde los tomadores de decisiones globales se reúnen y trabajan en una solución global.
O al menos, eso es lo que queremos que hagan.
Hasta ahora, todas las cumbres de seguridad de IA no han llevado a una regulación significativa.
Depende de ti y de mí [convencerlos](/action).

## Gobernanza de la Computación {#compute-governance}

Para entrenar un modelo de lenguaje de vanguardia (como GPT-4), se necesitan muchos recursos de hardware especializados y costosos.
GPT-4 se entrenó en 25.000 GPU Nvidia A100, que cuestan $10.000 cada una.
Aunque hay innovaciones que permiten un entrenamiento más eficiente, la tendencia es que los modelos de IA se están volviendo cada vez más grandes.

La escala de los requisitos de entrenamiento de IA modernos es inmensa.
Microsoft anunció recientemente un plan para [construir una planta de energía nuclear](https://www.theverge.com/2024/9/20/24249770/microsoft-three-mile-island-nuclear-power-plant-deal-ai-data-centers) para sus necesidades de energía de IA.
Afortunadamente para nosotros, esto significa que las ejecuciones de entrenamiento de IA son difíciles de ocultar, al menos en el futuro cercano.

Al controlar y monitorear la cadena de suministro de chips de IA, los gobiernos u otros organismos reguladores pueden asegurarse de que nadie inicie una ejecución de entrenamiento de IA peligrosa.
Vamos a profundizar en los diversos puntos de estrangulamiento en esta cadena de suministro.

### Puntos de estrangulamiento en la cadena de suministro de chips {#choke-points-in-the-chip-supply-chain}

Es difícil exagerar la complejidad y la interdependencia de la cadena de suministro de chips de IA.
Consiste en varias empresas altamente especializadas, algunas de las cuales son las únicas en el mundo que pueden producir ciertos componentes.
Esto es una buena noticia para la gobernanza.
A través del hardware, podemos regular las ejecuciones de entrenamiento.
Vamos a profundizar en los diversos puntos de estrangulamiento en la cadena de suministro de chips de IA.

#### Obleas de silicio: Shin-Etsu, Sumco, Siltronic {#silicon-wafers-shin-etsu-sumco-siltronic}

#### Litografía: ASML y SMEE {#lithography-asml--smee}

Todos los chips modernos se fabrican utilizando máquinas de litografía: máquinas enormes que cuestan 200 millones de dólares cada una y que proyectan luz sobre una oblea de silicio.
Este proceso de litografía es una de las partes más complejas y costosas del proceso de fabricación de chips.
Los chips de IA de vanguardia se fabrican utilizando litografía EUV, y ASML es la única empresa que fabrica estas máquinas.
Esta empresa holandesa es uno de los puntos de estrangulamiento más importantes para la gobernanza de la IA.
Estas máquinas son increíblemente complejas y requieren mucha experiencia para construir y mantener.
En particular, tienen [interruptores de apagado remoto](https://www.businessinsider.com/asml-tsmc-semiconductor-chip-equipment-kill-switch-china-invade-taiwan-2024-5) (principalmente en caso de que Taiwán sea invadida), así que en algunos aspectos importantes, el botón de pausa ya está construido.

El gobierno holandés ha establecido controles de exportación estrictos sobre sus máquinas de litografía EUV, que requieren permisos para exportar.
Estos controles de exportación se han establecido principalmente para frenar las ambiciones de China en cuanto a chips.
Los [EE. UU., Japón y los Países Bajos](https://apnews.com/article/technology-district-of-columbia-netherlands-china-business-6801d6c5f65b0bc1df6186e2e89a6f7d) están en un acuerdo (no público) destinado a restringir las exportaciones de chips y litografía a China.

La empresa china SMEE está tratando de alcanzar a ASML, pero no puede fabricar sus propias máquinas EUV.
Sus máquinas DUV están [atascadas en 28nm](https://www.scmp.com/tech/big-tech/article/3278235/chinese-chip-making-shows-progress-new-euv-patent-domestic-lithography-champion), lo que está generaciones detrás del proceso EUV de 5nm de ASML, por no hablar de las máquinas de 2nm de ASML que están en camino.
Así que SMEE no puede producir chips de IA modernos.

En otras palabras: ASML es un punto de estrangulamiento fundamental en la cadena de suministro de chips de IA.

#### Óptica: Zeiss {#optics-zeiss}

Las máquinas EUV de ASML utilizan espejos y lentes fabricados por la empresa alemana Zeiss.
En 2016, ASML [compró](https://optics.org/news/7/11/11) una participación del 25% en Zeiss, y las dos empresas tienen una relación muy estrecha.
Es probable que ninguna otra empresa pueda producir esta óptica.

#### Fotorresistencia {#photoresist}

La fotorresistencia es un producto químico que se utiliza para grabar patrones en la oblea de silicio.
Las empresas japonesas dominan este campo.

Las empresas más importantes en este campo son:

- JSR (Japón)
- Shin-Etsu (Japón)
- Tokyo Ohka Kogyo (Japón)
- DuPont (EE. UU.)

#### Interconexión y empaquetado: ASE {#interconnect--packaging-ase}

Cuando un chip sale de una fábrica, necesita ser "empaquetado".
ASE es probablemente la empresa de interconexión más grande para chips de IA.

#### Fabricación: TSMC, Samsung y SMIC {#fabrication-tsmc-samsung-amd-smic}

Construir una "fábrica" (una fábrica de chips) es asombrosamente difícil: no tolera partículas de polvo, requiere el equipo de alta tecnología más caro y tiene una cadena de suministro muy compleja.
Una fábrica moderna cuesta alrededor de 10 a 20 mil millones de dólares para fabricar.

La empresa taiwanesa de fabricación de semiconductores representa [aproximadamente el 90%](https://www.fool.com/investing/2025/02/03/meet-the-monster-stock-that-continues-to-crush-the/) de los chips de IA modernos, que son todos los chips fabricados con una precisión de 7nm o mejor.
Samsung es la única otra fábrica que puede producir chips de IA modernos.

Pero la empresa china SMIC está alcanzando rápidamente - ya tiene un [proceso de 7nm funcional](https://wccftech.com/smic-to-limit-huawei-to-7nm-chips-until-2026-reducing-advancement/).
Debido a los controles de exportación de EE. UU. y los Países Bajos, SMIC no puede comprar máquinas EUV de ASML, y ahora también está restringida en la compra de máquinas DUV más antiguas.
En junio de 2024, un [informe](https://evertiq.com/news/55926) mostró que SMIC puede producir chips de 5nm utilizando hardware DUV,
y ahora puede producir chips de IA de 7nm (unos tres años detrás del proceso de 4nm que pueden producir las máquinas EUV de ASML), pero la litografía de SMIC está plagada de bajos rendimientos.

#### Fabricación de memoria: Micron, SK Hynix {#memory-fabrication-micron-sk-hynix}

Los chips de IA requieren mucha memoria de alta velocidad (HBM), que es el tipo de memoria más avanzado.
Actualmente, la competencia en el mercado de memoria de alta velocidad (HBM) de alta gama se limita a unos pocos jugadores clave.
La producción de las variantes más modernas y potentes (HBM3 y HBM3E, que se utilizan en aceleradores de IA, GPU y aplicaciones de HPC) está dominada por:

- SK Hynix - El líder del mercado en la producción de HBM, que suministra a Nvidia con HBM3 y HBM3E.
- Samsung - Un fuerte competidor que trabaja para asegurar los contratos de Nvidia y otras empresas de IA.
- Micron - El tercer jugador importante, que está aumentando la producción de HBM3E en 2024 para competir con SK Hynix y Samsung.

Estas empresas también utilizan máquinas EUV de ASML para producir sus HBM.

#### Diseño de chips de IA: Nvidia, AMD, Intel, Google, Apple {#ai-chip-design-nvidia-amd-intel-google-apple}

Los nombres de las empresas más famosas en esta página son todos diseñadores de chips.
Y hay empresas nuevas, como Cerebras y Groq, que están diseñando chips específicamente para la IA.
En particular, algunas de estas empresas utilizan procesos relativamente obsoletos para producir sus chips, como Groq que utilizó 14nm, lo que es un punto de estrangulamiento potencial para la gobernanza.

### Gobernanza en el chip {#on-chip-governance}

- El artículo ["Chips seguros y gobernables"](https://www.cnas.org/publications/reports/secure-governable-chips) propone un nuevo enfoque para la gobernanza de la IA.
- **[Informe de servidor](https://www.lesswrong.com/posts/uSSPuttae5GHfsNQL/ai-compute-governance-verifying-ai-chip-location)**. Los chips podrían responder a mensajes de servidores de confianza para demostrar que están dentro de una cierta distancia de una ubicación de confianza. Esto puede ser preciso dentro de decenas de kilómetros.
- **[flexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf)**: Un nuevo tipo de chip que puede ser programado para autodestruirse cuando se cumplen ciertas condiciones. Esto todavía está en la fase de investigación y podría tardar mucho tiempo en desarrollarse.
- **[Informe basado en firmware](https://arxiv.org/abs/2404.18308)**: Al instalar un firmware personalizado en las GPU, los usuarios necesitarían obtener una licencia para utilizar la GPU durante más de x ciclos. Esto es una solución más a corto plazo y podría implementarse "dentro de un año".

1. **[Seguimiento GPS](https://arxiv.org/abs/2408.16074)**: Al instalar un firmware personalizado en las GPU, los usuarios necesitarían obtener una licencia para utilizar la GPU durante más de x ciclos. Esto es una solución más a corto plazo y podría implementarse "dentro de un año"

### Métodos de verificación - prevención de ejecuciones de entrenamiento a gran escala {#verification-methods---preventing-large-training-runs}

Ahora que hemos identificado varios puntos de estrangulamiento en la cadena de suministro de chips, podemos empezar a pensar en cómo prevenir las ejecuciones de entrenamiento a gran escala.
Los actores mencionados anteriormente pueden ser presionados (por los gobiernos) para asegurarse de que sus productos no se utilicen para ejecuciones de entrenamiento de IA peligrosas.

Pero ¿cómo se puede verificar esto?

El documento ["Métodos de verificación para acuerdos internacionales de IA"](https://arxiv.org/abs/2408.16074) enumera varias opciones:

1. **Detección remota**: Utiliza imágenes satelitales e infrarrojas para detectar centros de datos mediante firmas visuales y térmicas. Muy factible pero limitado por el camuflaje o las instalaciones subterráneas.
2. **Denunciantes**: Se basa en informantes que denuncian incumplimientos, incentivados por protecciones legales y financieras. Factible pero dependiente del acceso y la voluntad de los informantes de revelar información.
3. **Monitoreo de energía**: Rastrea el uso de energía para identificar operaciones de IA a gran escala, viable si los patrones son distintos. La factibilidad varía; los datos pueden ser oscurecidos por otras actividades de alta energía.
4. **Análisis de datos de aduanas**: Monitorea la importación/exportación de hardware de IA para detectar anomalías. Factible, especialmente para importaciones, aunque los países con fabricación nacional pueden evitar la detección.
5. **Inteligencia financiera**: Observa transacciones grandes o inusuales relacionadas con compras de hardware de IA. Factible si las leyes de privacidad y bancarias permiten, a menudo mejor combinado con otros métodos.
6. **Inspecciones de centros de datos**: Inspecciones físicas de sitios para verificar el cumplimiento de los límites de hardware y protocolos de seguridad. Efectivo si el país anfitrión acepta las inspecciones; invasivo y requiere muchos recursos.
7. **Inspecciones de instalaciones de fabricación de semiconductores**: Verifica el cumplimiento de la producción de chips mediante la inspección de instalaciones con hardware relevante. Factible pero requiere recursos significativos y el consentimiento del país anfitrión.
8. **Inspecciones de desarrolladores de IA**: Revisa las instalaciones para verificar la autorización de código, protocolos de seguridad y registros de evaluación de IA. Efectivo pero muy invasivo, requiere experiencia especializada y cooperación del país.
9. **Seguimiento de la ubicación de chips**: Rastrea los movimientos de chips de IA para monitorear su despliegue. Factible con acuerdos internacionales, pero puede ser evitado desactivando el seguimiento o falsificando datos de ubicación.
10. **Informe basado en chips**: Incorpora mecanismos de informe en chips para alertar si se utilizan más allá de los límites autorizados. Factible pero desafiante, requiere estándares internacionales y desarrollo de hardware; puede ser evitado modificando el firmware.

Cada método tiene sus fortalezas y debilidades, y a menudo requiere enfoques complementarios o cooperación internacional para una implementación efectiva.

Una institución internacional podría establecerse para monitorear estos métodos de verificación y hacer cumplir la pausa.

## Gobernanza de software {#software-governance}

Los chips físicos son nuestro enfoque principal, pero también podemos querer regular el _software_ utilizado para entrenar y ejecutar modelos de IA.
Es posible que los clústeres de computación más grandes tengan suficiente poder para entrenar un modelo peligrosamente catastrófico, pero todavía carecen del software.
Vamos a profundizar en los tipos de innovaciones de software que podemos distinguir.

### Innovaciones de software {#software-innovations}

En primer lugar, hay innovaciones de _entrenamiento_.
La arquitectura Transformer, por ejemplo, permitió que los modelos de IA fueran mucho más capaces a un costo mucho menor.
El modelo ALBERT basado en Transformer [superó](https://arxiv.org/pdf/2308.04950) al modelo BERT, aunque consistía en 18 veces menos parámetros.
En el futuro, podemos ver arquitecturas aún más eficientes.
También hay innovaciones en los datos que se alimentan a un modelo.

Además de las mejoras de entrenamiento, hemos visto varias mejoras de _tiempo de ejecución_.
Las técnicas de cadena de pensamiento, gráficos de pensamiento y otras pueden dar mejoras drásticas en el rendimiento de los modelos de IA.
Herramientas como AutoGPT pueden convertir chatbots simples en agentes autónomos que navegan por la web, envían correos electrónicos y realizan otras tareas.
El modelo o1 de OpenAI permite mayores capacidades de razonamiento al permitirle pasar más tiempo pensando en una respuesta antes de proporcionarla.

### Regulación de software {#regulating-software}

El lado del software de la IA es más difícil de controlar que el lado del hardware.
El software es solo información - puede ser copiado y distribuido muy fácilmente.
Sin embargo, hemos prohibido información antes.
La pornografía infantil, por ejemplo, es ilegal de producir, distribuir y poseer.
Los mismos mecanismos de aplicación podrían utilizarse para regular el software de IA peligroso.

## Qué pueden hacer los gobiernos para crear el botón de pausa {#what-governments-can-do-to-build-the-pause-button}

1. **Diseñar firmware de GPU compatible con el botón de pausa**. El enfoque para esto se describe en [este documento](https://arxiv.org/abs/2404.18308).
2. **Forzar a los diseñadores de chips de IA a hacer que su firmware sea compatible**.
3. **Establecer un organismo de licencias**. Una autoridad debe ser responsable de emitir licencias a empresas que deseen utilizar chips de IA. Esta autoridad gestiona las claves criptográficas.
4. **Mapear dónde están los chips de IA ahora**. Enumerar todas las empresas y centros de datos que tienen chips de IA. Llamarlos y, en el futuro, hacer que actualicen sus chips a firmware compatible.
5. **Invertir en hardware a prueba de manipulación y técnicas de gobernanza en el chip**. Los flexHEGs son un enfoque prometedor aquí.

## Lecturas adicionales {#further-reading}

- [Mecanismos de gobernanza habilitados por hardware](https://www.rand.org/pubs/working_papers/WRA3056-1.html)
- [Métodos de verificación para acuerdos internacionales de IA](https://arxiv.org/abs/2408.16074)
- [Chips seguros y gobernables](https://www.cnas.org/publications/reports/secure-governable-chips)
- [FlexHEGs](https://yoshuabengio.org/wp-content/uploads/2024/09/FlexHEG-Interim-Report_2024.pdf)
- [Informe basado en firmware](https://arxiv.org/abs/2404.18308)
