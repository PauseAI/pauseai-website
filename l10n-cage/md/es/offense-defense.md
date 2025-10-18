---
title: Equilibrio entre ataque y defensa en la seguridad de la IA
description: Cómo analizar el equilibrio entre ataque y defensa en la seguridad de la IA
---

El equilibrio entre ataque y defensa se refiere a las fortalezas y debilidades relativas de las estrategias ofensivas y defensivas, generalmente en el contexto de conflictos militares o competiciones deportivas.

Dado que la IA es una tecnología de doble uso, podemos ver que estos equilibrios entre ataque y defensa juegan un papel en varios problemas de seguridad de la IA:

- Generación de medios falsos, detección de medios falsos
- Ataques de ciberseguridad, defensas de ciberseguridad
- Toma de control por IA, defensa de la IA contra la toma de control

¿Cómo se desarrollará el equilibrio entre ataque y defensa en la seguridad de la IA?

## Medios falsos {#fake-media}

Los modelos de lenguaje grandes modernos pueden crear texto en todo tipo de estilos, y otros modelos pueden crear imágenes, audio e incluso videos.
Muchos modelos crean falsificaciones poco convincentes, pero la calidad está mejorando rápidamente.

Los modelos de texto, audio e imagen de última generación ya son lo suficientemente buenos como para engañar a la mayoría de los humanos.
En 2022, la primera imagen generada por IA ganó un concurso de arte.
Un par de meses después, un concurso de fotografía fue ganado utilizando una imagen generada por IA.

También contamos con IA que puede detectar deepfakes.
Esto da lugar a un juego del gato y el ratón entre los falsificadores y los detectores.

En el caso del texto, el ataque parece estar ganando.
OpenAI [descontinuó](https://news.ycombinator.com/item?id=36862850) su clasificador de IA debido a la baja precisión.

Afortunadamente, medidas como [marcado de agua](https://arxiv.org/abs/2303.07205) y firmas digitales pueden ser utilizadas para detectar falsificaciones.
Requerir firmas para todos los medios que consumimos podría ser una solución adecuada.

## Ataques de ciberseguridad frente a defensas {#cybersecurity-attacks-vs-defenses}

Los modelos de lenguaje grandes modernos pueden ser utilizados para encontrar vulnerabilidades en el software.
Cuando se descubre una vulnerabilidad, se puede solucionar (defensa) o explotar (ataque).
Y afortunadamente, la mayoría de las personas están del lado de la defensa.

Sin embargo, hay algunas ventajas que los atacantes tienen sobre los defensores:

- **Los atacantes solo necesitan encontrar una vulnerabilidad, mientras que los defensores necesitan encontrar todas ellas.** Los defensores no sabrán qué vulnerabilidad encontrarán los atacantes, por lo que necesitan defenderse contra todas ellas.
- **Implementar parches lleva más tiempo que atacar.** La "Ventana de Vulnerabilidad" es el tiempo que transcurre desde que se descubre una explotación hasta que se parchea. Los defensores necesitan corregir el error, recompilar la aplicación o publicar las bibliotecas actualizadas, y luego todos los usuarios necesitan actualizar su software. Esto puede llevar meses, y mientras tanto, la vulnerabilidad puede ser explotada.

## Riesgos biológicos y defensa biológica {#biohazards-and-biodefense}

La IA puede ser utilizada para diseñar nuevos agentes biológicos o ayudar en el proceso de creación de una pandemia.
Un grupo de estudiantes pudo utilizar un chatbot para [producir todos los pasos necesarios para crear una nueva pandemia](https://arxiv.org/abs/2306.03809).
Sin embargo, también podría ser utilizada para crear nuevas vacunas, medicamentos o defensas contra agentes biológicos.

- **Los virus se propagan más rápido que las vacunas**. Un virus es literalmente una máquina autorreplicante. Una vacunación, por otro lado, requiere mucho esfuerzo para producir y distribuir.

## Tecnología desconocida y riesgos {#unknown-technology-and-risks}

Una IA mucho más inteligente que los humanos podría ser capaz de utilizar su comprensión superior de la realidad para crear nuevas tecnologías.
Quizás algunos nanobots autorreplicantes que puedan convertir toda la materia en copias de sí mismos, o pequeñas máquinas que puedan influir en los cerebros de los humanos.
Predecir qué tipo de tecnología será exactamente es imposible (tendríamos que ser al menos tan inteligentes como la IA), pero todavía podemos razonar sobre el equilibrio entre ataque y defensa.
La conclusión no es tan difícil: no tenemos idea de qué se avecina, y no tenemos idea de cómo defendernos contra ello.
Estamos en desventaja.

## Conclusión {#conclusion}

Muchos riesgos de la IA tienen un equilibrio entre ataque y defensa.
Para los medios falsos, podríamos utilizar firmas digitales para detectar falsificaciones, desplazando el equilibrio hacia la defensa.
Para la ciberseguridad, los riesgos biológicos y la tecnología desconocida, el ataque parece tener la ventaja.

La importante implicación política de esto es: [no construyamos esta tecnología en primer lugar](/proposal).
