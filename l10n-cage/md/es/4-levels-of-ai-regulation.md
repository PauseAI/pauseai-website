---
title: 4 Niveles de regulación de la seguridad de la IA
description: Un marco para pensar en cómo mitigar los riesgos de los sistemas de IA potentes
image: /4levels.png
---

A medida que aumentan las capacidades de la IA, también aumentan los riesgos que estos sistemas plantean para la humanidad.
Muchos científicos ya han advertido sobre el [riesgo de extinción humana](/xrisk).

En este artículo, examinaremos nuestro marco de 4 niveles para pensar en cómo se puede regular la seguridad de la IA.

## La cadena de creación de IA como marco para la gobernanza de la seguridad {#ai-pipeline-as-a-framework-for-safety-governance}

La cadena de creación de IA consta de varios pasos, cada uno de los cuales se puede regular de diferentes maneras.
Esta cadena consta de:

- **Hardware y algoritmos**, que se utilizan para entrenar modelos de IA
- **Ejecuciones de entrenamiento**, donde se utilizan el hardware y los algoritmos para crear un modelo
- **Despliegue**, donde el modelo entrenado se pone a disposición del público
- **Uso**, donde el modelo desplegado es utilizado por individuos y empresas

Cuanto más tarde se regule en la cadena, mayores son los riesgos que se enfrentan.
Si se desea un alto nivel de seguridad, es necesario regular más temprano en la cadena.
Por eso, cuando se asciende a los 4 niveles de regulación de la IA, se retrocede en la cadena de creación de IA.

![4 Niveles de regulación de la seguridad de la IA](/4levels.png)

## Nivel 1: Regular el uso {#level-1-regulate-usage}

Ejemplos:

- **Prohibir entornos de ejecución de agentes autónomos** (como AutoGPT)
- **Prohibir instrucciones peligrosas**

Estas medidas están diseñadas para evitar que los usuarios realicen acciones peligrosas o dañinas con modelos de IA.
En este nivel, la responsabilidad recae en los usuarios de los modelos, no en los creadores.
Se depende de todos los usuarios (potencialmente millones) para que cumplan con las regulaciones.
Esto solo proporciona un nivel muy bajo de protección contra los peligros de la IA.

## Nivel 2: Regular el despliegue {#level-2-regulate-deployment}

Ejemplos:

- **Requisitos de pruebas de equipo rojo**. Esto significa que antes de que se despliegue un modelo de IA, es probado por un equipo rojo para ver si se puede piratear (jailbreak) o abusar de él.
- **No permitir el despliegue y la publicación de código abierto** de modelos con [capacidades peligrosas](/dangerous-capabilities).

Al regular los despliegues, se evita que se desplieguen modelos peligrosos.
Esto significa que la responsabilidad recae en los creadores de los modelos.
Esta es una situación más segura que el nivel 1, porque ahora se depende de un grupo mucho más pequeño de personas para que actúen de manera responsable.

Sin embargo, todavía se permiten ejecuciones de entrenamiento peligrosas, por lo que todavía pueden ocurrir accidentes en laboratorios de IA (incluyendo la filtración de modelos de IA peligrosos o la creación de IA deshonesta).

## Nivel 3: Regular las ejecuciones de entrenamiento {#level-3-regulate-training-runs}

Ejemplos:

- **Requerir prueba de seguridad** antes de otorgar permiso para entrenar un modelo determinado. Esto puede incluir prueba formal de alineación. [Este artículo detalla algunos de los problemas de seguridad actuales](https://www.lesswrong.com/posts/mnoc3cKY3gXMrTybs/a-list-of-core-ai-safety-problems-and-how-i-hope-to-solve).
- Establecer un **límite de escala para entrenar nuevos modelos** (por ejemplo, un recuento máximo de operaciones de punto flotante utilizadas). Esto también podría incluir el proceso de ajuste fino.
- **Requerir una licencia** para entrenar modelos de IA (por encima de un cierto tamaño / con ciertas capacidades).
- **Prohibir el entrenamiento en tipos de datos peligrosos**. Algunos tipos de datos de entrenamiento pueden llevar a [capacidades peligrosas](/dangerous-capabilities), como la piratería o la creación de armas biológicas. Se podría prohibir el entrenamiento en datos que contengan este tipo de conocimiento.
- **Prohibir el entrenamiento en datos con derechos de autor**. Esto no se dirige directamente a los datos inseguros, pero limita la cantidad de datos que se pueden utilizar, lo que significa que se da tiempo para averiguar cómo construir modelos de IA seguros.

Al regular las ejecuciones de entrenamiento, se evita que se creen modelos peligrosos en primer lugar.
Esto evitará accidentes en laboratorios de IA que cumplan con las regulaciones.

Sin embargo, todavía se permite la distribución de hardware y algoritmos que se pueden utilizar para entrenar modelos peligrosos, por lo que todavía se depende de los creadores de estos modelos para que actúen de manera responsable.

## Nivel 4: Regular el hardware y los algoritmos {#level-4-regulate-hardware--algorithms}

Ejemplos:

- **Limitar la distribución de hardware de entrenamiento**. El hardware especializado para entrenar modelos de IA se está convirtiendo rápidamente en el producto más importante de los fabricantes de chips. La cadena de suministro de este hardware es muy centralizada y el hardware es muy costoso. Esto significa que es [relativamente fácil regular](https://arxiv.org/abs/2303.11341) la distribución de este hardware.
- **No permitir la publicación de arquitecturas de entrenamiento novedosas**. Las nuevas arquitecturas de entrenamiento de IA pueden llevar a aumentos dramáticos en las capacidades. El modelo Transformer, por ejemplo, permitió prácticamente todo el progreso reciente en IA. Se podría limitar la publicación de tales arquitecturas para evitar saltos repentinos de capacidad.

Al regular el hardware y los algoritmos, se hace que sea no solo ilegal, sino también muy difícil entrenar modelos peligrosos.
Esto proporciona la mejor protección contra los riesgos de la IA.

## Limitaciones {#limitations}

Es importante tener en cuenta que este marco no es perfecto y no todos los tipos posibles de regulación de la IA se ajustan perfectamente a uno de los niveles mencionados.
Por ejemplo, la responsabilidad legal de los creadores de modelos se puede clasificar como un tipo de regulación de "uso" de nivel 1, ya que se aplica después del despliegue, pero también se puede clasificar como un tipo de regulación de nivel 2 o 3, ya que puede ayudar a los creadores a reconsiderar si un modelo determinado debe desplegarse o entrenarse en primer lugar.

## Conclusión {#conclusions}

En este artículo, hemos examinado nuestro marco de 4 niveles para pensar en cómo se puede regular la seguridad de la IA.
Utilizando este modelo, podemos razonar más fácilmente sobre la efectividad de la regulación de la IA en diferentes pasos de la cadena de creación de IA.
También podemos ver que los primeros dos niveles no ofrecen mucha protección contra los riesgos (existentes) de la IA.
Prevenir ejecuciones de entrenamiento peligrosas y regular el hardware y los algoritmos son formas mucho más fiables de garantizar la seguridad.
