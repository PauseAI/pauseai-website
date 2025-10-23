---
title: Cómo las evaluaciones y referencias de seguridad de IA pueden ayudar en la gobernanza de la IA
description: ¿Qué son las evaluaciones de seguridad de IA y cómo pueden contribuir a prevenir riesgos catastróficos?
---

## ¿Qué son las evaluaciones de seguridad de IA? {#what-are-ai-safety-evaluations}

Las "evaluaciones" son pruebas que miden el comportamiento de los modelos de IA y cuán poderosos se están volviendo.
En seguridad de IA, las evaluaciones suelen diseñarse para medir [capacidades peligrosas](/dangerous-capabilities), como capacidades de ciberseguridad, autorreplicación e investigación de IA autónoma.

Es importante destacar que las evaluaciones pueden determinar si una IA es demasiado peligrosa para implementar.
Hay ciertas _líneas rojas_ que ningún modelo de IA debería cruzar, por ejemplo, cuando puede...

- **autorreplicarse**. (Por ejemplo, [RepliBench](https://arxiv.org/abs/2504.18565)). Una IA autorreplicante podría escapar de un laboratorio y propagarse a otras máquinas.
- **crear modelos de IA más poderosos**. Por ejemplo, [RE-bench](https://metr.org/AI_R_D_Evaluation_Report.pdf). Una IA que se mejora a sí misma podría volverse rápidamente más poderosa que los humanos.

## Evitar la implementación no es suficiente {#preventing-deployment-is-not-enough}

Las cosas pueden salir mal _incluso antes de la implementación_.
La autorreplicación y la auto-mejora pueden ocurrir en un laboratorio de IA, antes de que el modelo esté disponible públicamente.

Por eso **necesitamos un [Botón de Pausa](/building-the-pause-button)**.
Necesitamos detener globalmente el desarrollo de modelos de IA cada vez más poderosos, antes de que estas capacidades peligrosas maduren por completo.
Este Botón de Pausa debería activarse cuando las evaluaciones muestran que estamos entrando en la zona de peligro.

## ¿Qué están haciendo las empresas de IA? {#what-ai-companies-are-doing}

La mayoría de las empresas líderes en IA realizan evaluaciones de seguridad en sus modelos antes de implementarlos e incluyen los resultados en las llamadas "Fichas de Sistema".
La mayoría de ellas (excepto Meta y Apple) han firmado el [Código de Práctica de IA de la UE](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai), que menciona "evaluaciones de modelos de última generación" (Medida 3.2).

Esto también significa que algunas de estas empresas no realizan _ninguna_ evaluación de seguridad, y las que se realizan no son _obligatorias_ ni _estandarizadas_.
En otras palabras, **urgentemente necesitamos regulaciones que exijan evaluaciones de seguridad estandarizadas**.

## ¿Qué están haciendo los países? {#what-countries-are-doing}

Varios gobiernos están invirtiendo seriamente en Evaluaciones/Referencias de IA para medir capacidades peligrosas:

- El AISI del Reino Unido ha creado el [marco Inspect](https://github.com/UKGovernmentBEIS/inspect_ai), ha escrito [Replibench](https://arxiv.org/abs/2504.18565) y ahora está invirtiendo [15 millones de libras esterlinas en subvenciones para evaluaciones e investigación de alineación](https://alignmentproject.aisi.gov.uk/)
- La Comisión Europea está lanzando una [licitación de 10 millones de euros](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/tender-details/76f9edf2-d9e2-4db2-931e-a72c5ab356d2-CN) y una [gran subvención con el programa Horizonte](https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/HORIZON-CL4-2025-04-DIGITAL-EMERGING-04). También han lanzado el [Código de Práctica de IA de Propósito General](https://digital-strategy.ec.europa.eu/en/policies/contents-code-gpai), que incluye un requisito para realizar "evaluaciones de modelos de última generación" (Medida 3.2).
- El [Plan de Acción de IA de EE. UU.](https://www.whitehouse.gov/articles/2025/07/white-house-unveils-americas-ai-action-plan/) menciona evaluaciones y controles de hardware
- China (Concordia AI + Laboratorio de IA de Shanghái) acaba de [publicar un informe con muchas evaluaciones](https://substack.com/home/post/p-169741512)
- Otros gobiernos también están trabajando en evaluaciones

_El hecho de que tantos países estén trabajando en evaluaciones crea una oportunidad muy importante para nosotros_.
Si estos países e institutos **utilizaran las mismas referencias** y tuvieran algunas **líneas rojas** comunes, sería un paso importante hacia un tratado global.
Además, debemos comunicar claramente a los políticos que cuando se cruza una línea roja, es hora de [detener el desarrollo adicional](/proposal).
