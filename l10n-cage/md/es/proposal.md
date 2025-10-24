---
title: Propuesta de PauseAI
description: Implementar una pausa temporal en el entrenamiento de los sistemas de inteligencia artificial más poderosos.
---

**Implementar una pausa temporal en el entrenamiento de los sistemas de inteligencia artificial más poderosos**, hasta que sepamos cómo construirlos de manera segura y mantenerlos bajo control democrático.

_Versión: 4 de febrero de 2025_

Los países individuales pueden y deben implementar esta medida _ahora mismo_.
Especially Estados Unidos (o California, específicamente) debería implementar una pausa, ya que es el hogar de prácticamente todas las empresas líderes en inteligencia artificial.
Muchos científicos y líderes de la industria [están de acuerdo en que una pausa es necesaria](https://futureoflife.org/open-letter/pause-giant-ai-experiments/), y el público estadounidense también apoya fuertemente una pausa ([64%](https://www.campaignforaisafety.org/usa-ai-x-risk-perception-tracker/) - [69%](https://today.yougov.com/topics/technology/survey-results/daily/2023/04/03/ad825/2)).

Sin embargo, no podemos esperar que los países o empresas arriesguen su ventaja competitiva deteniendo las ejecuciones de entrenamiento de inteligencia artificial durante mucho tiempo si otros países o empresas no hacen lo mismo.
Por eso necesitamos una **pausa global**.

Vamos a profundizar en lo que se necesita para llegar allí.

## Llegar a un tratado {#getting-to-a-treaty}

Un acuerdo internacional se establece típicamente a través de una cumbre, donde los líderes de los países se reúnen para discutir el tema y tomar una decisión.
Ya hemos tenido [tres cumbres de seguridad de inteligencia artificial hasta ahora](/summit).

El objetivo principal de estas cumbres debería ser un **tratado**.
Pero hasta ahora, las cumbres no han sido efectivas para producir algo jurídicamente vinculante.
Y la construcción de un tratado tiende a ser lenta y propensa a vetos.
No [tenemos el tiempo](/urgency) para esperar a los procesos tradicionales de elaboración de tratados.

Así que necesitamos un nuevo **proceso de elaboración de tratados**:

- La participación de **Estados Unidos y China** es crucial.
- Debe ser **inmune a vetos** por parte de cualquier país.
- Debe ser **rápido**. Los procesos normales de elaboración de tratados tardan años, y no [tenemos ese tiempo](/urgency).
- La escala de este proceso de elaboración de tratados es sin precedentes, y necesita la aprobación de todos los países.

El tratado en sí debería contener las siguientes **medidas**:

### Medidas del tratado {#treaty-measures}

- **Establecer una agencia internacional de seguridad de inteligencia artificial**, similar a la AIEA. Esta agencia será responsable de:
  - Otorgar la aprobación para _despliegues_. Esto incluirá la evaluación de modelos / [evaluaciones de modelos](/evaluations).
  - Otorgar la aprobación para _nuevas ejecuciones de entrenamiento_ de modelos de inteligencia artificial por encima de un cierto tamaño (por ejemplo, 1.000 millones de parámetros).
  - Reuniones periódicas para discutir el progreso de la investigación en seguridad de inteligencia artificial.

- **Solo permitir el entrenamiento de sistemas de inteligencia artificial generales si su seguridad puede ser garantizada**.
  - Por modelos de inteligencia artificial generales, nos referimos a modelos que son 1) más grandes que 10^12 parámetros, 2) tienen más de 10^25 FLOPs utilizados para el entrenamiento o 3) capacidades que se espera que superen una puntuación del 86% en la prueba MMLU. Tenga en cuenta que esto no se dirige a los sistemas de inteligencia artificial _estrechos_, como el reconocimiento de imágenes utilizado para diagnosticar el cáncer.
  - Es posible que el problema de la alineación de la inteligencia artificial _nunca se resuelva_ - puede ser insoluble. En ese caso, nunca deberíamos permitir el entrenamiento de tales sistemas.
  - **Verificar** que estas ejecuciones de entrenamiento peligrosas no estén teniendo lugar. Esto se puede hacer de [numerosas maneras](https://arxiv.org/abs/2408.16074): [seguimiento de GPUs](https://arxiv.org/abs/2303.11341), incentivando a los denunciantes, monitoreo de energía, inspecciones de centros de datos, inteligencia financiera, inspecciones de instalaciones de fabricación de semiconductores, inspecciones de desarrolladores de inteligencia artificial, seguimiento de ubicación de chips y notificación basada en chips. La [cadena de suministro de chips de inteligencia artificial](https://www.governance.ai/post/computing-power-and-the-governance-of-ai) está muy centralizada, lo que permite la supervisión global.
  - Requerir [supervisión durante las ejecuciones de entrenamiento](https://www.alignmentforum.org/posts/Zfk6faYvcf5Ht7xDx/compute-thresholds-proposed-rules-to-mitigate-risk-of-a-lab).
  - Incluso si podemos construir una inteligencia artificial controlable y segura, solo construir y desplegar dicha tecnología con **fuerte control democrático**. Una superinteligencia es demasiado poderosa para ser controlada por una sola empresa o país.

- **Solo permitir el despliegue de modelos después de que no haya [capacidades peligrosas](/dangerous-capabilities)**. (Evaluación previa al despliegue)
  - Necesitaremos estándares y evaluaciones independientes para determinar si un modelo tiene capacidades peligrosas.
  - La lista de capacidades peligrosas puede cambiar con el tiempo a medida que crecen las capacidades de la inteligencia artificial.
  - Tenga en cuenta que confiar plenamente en las evaluaciones de modelos [no es suficiente](/4-levels-of-ai-regulation).

Implementar una pausa _puede_ tener consecuencias negativas si no se hace correctamente.
Lea más sobre [cómo se pueden mitigar estos riesgos](/mitigating-pause-failures).

Para obtener más detalles sobre cómo se puede utilizar la cadena de suministro de chips de inteligencia artificial para la supervisión global, lea [Construyendo el botón de pausa](/building-the-pause-button).

## Otras medidas que frenan efectivamente {#other-measures-that-effectively-slow-down}

- **Prohibir el entrenamiento de sistemas de inteligencia artificial con material protegido por derechos de autor**. Esto ayuda con los problemas de derechos de autor, reduce la creciente desigualdad y frena el progreso hacia la superinteligencia.
- **Hacer responsables a los creadores de modelos de inteligencia artificial** de los actos delictivos cometidos utilizando sus sistemas de inteligencia artificial. Esto da a los creadores de modelos más incentivos para asegurarse de que sus modelos sean seguros.

## Política a largo plazo {#long-term-policy}

En el momento de escribir, entrenar un modelo del tamaño de GPT-3 cuesta millones de dólares.
Esto hace que sea muy difícil entrenar tales modelos, y esto hace que sea más fácil controlar el entrenamiento utilizando el seguimiento de GPUs.
Sin embargo, el costo de entrenar un modelo está disminuyendo exponencialmente debido a las mejoras en el hardware y los nuevos algoritmos de entrenamiento.

Llegará un momento en que los modelos de inteligencia artificial potencialmente superinteligentes puedan ser entrenados por unos pocos miles de dólares o menos, tal vez incluso en hardware de consumo.
Necesitamos estar preparados para esto.
Debemos considerar las siguientes políticas:

- **Limitar la publicación de algoritmos de entrenamiento / mejoras de tiempo de ejecución**. A veces se publica un nuevo algoritmo que hace que el entrenamiento sea mucho más eficiente. La arquitectura Transformer, por ejemplo, permitió prácticamente todo el progreso reciente en inteligencia artificial. Estos tipos de saltos de capacidad pueden ocurrir en cualquier momento, y debemos considerar limitar la publicación de tales algoritmos para minimizar el riesgo de un salto de capacidad repentino. También hay innovaciones que permiten [entrenamientos descentralizados](https://www.primeintellect.ai/blog/opendiloco). De manera similar, algunas innovaciones de tiempo de ejecución podrían cambiar drásticamente lo que se puede hacer con los modelos existentes. Prohibir la publicación de tales algoritmos se puede implementar utilizando medios similares a cómo prohibimos otras formas de información, como los medios pornográficos ilegales.
- **Limitar los avances de capacidad de los recursos computacionales**. Si entrenar una superinteligencia se vuelve posible en hardware de consumo, estamos en problemas. Debemos considerar limitar los avances de capacidad del hardware (por ejemplo, a través de limitaciones en la litografía, el diseño de chips y los nuevos paradigmas de computación como los chips fotónicos y la computación cuántica).

## Ayúdanos a lograr esto {#help-us-achieve-this}

[Únete](https://pauseai.info/join) al movimiento para colaborar o [toma acción](/action) por tu cuenta.
