---
title: Riesgos de ciberseguridad de los modelos de IA de vanguardia
description: Cómo la IA podría ser utilizada para hackear todos los dispositivos.
---

Prácticamente todas nuestras actividades diarias dependen de alguna manera de las computadoras.
Pagamos nuestras compras, planeamos nuestros días, nos comunicamos con nuestros seres queridos e incluso conducimos nuestros coches con computadoras.
Y prácticamente todas estas computadoras están interconectadas.
Esto nos hace vulnerables a los ciberataques.

Las armas cibernéticas altamente potentes, el malware y los botnets (como [Stuxnet](https://www.youtube.com/watch?v=nd1x0csO3hU), [Mirai](<https://es.wikipedia.org/wiki/Mirai_(malware)>) y [EMOTET](https://es.wikipedia.org/wiki/Emotet)) siempre han sido difíciles de crear.
El [arma cibernética Pegasus](<https://es.wikipedia.org/wiki/Pegasus_(spyware)>), por ejemplo, costó cientos de millones de dólares desarrollar.
Encontrar las llamadas vulnerabilidades de día cero (vulnerabilidades que aún no han sido descubiertas) requiere mucha habilidad y mucho tiempo - solo los hackers altamente especializados pueden hacerlo.
Sin embargo, cuando la IA se vuelva lo suficientemente avanzada, esto ya no será el caso.
En lugar de tener que contratar a un equipo de expertos en seguridad/hackers altamente capacitados para encontrar vulnerabilidades de día cero, cualquiera podría simplemente utilizar una IA mucho más barata.

## Los modelos de IA pueden encontrar y explotar vulnerabilidades de forma autónoma {#ai-models-can-autonomously-find-and-exploit-vulnerabilities}

Los últimos sistemas de IA ya pueden analizar y escribir software.
Pueden [detectar vulnerabilidades](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) en el software y [podrían ser utilizados para explotarlas](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).
GPT-4 ya puede [hackear sitios web de forma autónoma](https://arxiv.org/html/2402.06664v1), realizando tareas tan complejas como la extracción de esquemas de bases de datos ciegas y las inyecciones de SQL sin retroalimentación humana, lo que se descubrió 18 meses después de que GPT-4 terminara su entrenamiento.
GPT-4 ya [supera al 88%](https://arxiv.org/pdf/2402.11814.pdf) de los hackers humanos en una competencia de CTF.
También puede [explotar de forma autónoma el 87% de las vulnerabilidades probadas](https://arxiv.org/abs/2404.08144), lo que es un gran paso adelante con respecto a GPT-3.5 o los modelos de código abierto, que obtuvieron un 0%.
Los equipos de varios LLM [funcionan aún mejor](https://arxiv.org/abs/2406.01637) - pudiendo explotar vulnerabilidades de día cero del mundo real.
A medida que crecen las capacidades de la IA, también lo harán las vulnerabilidades que pueden detectar y los exploits que pueden crear.
Aún no son tan buenos en esto como los mejores humanos, así que por ahora el peligro es limitado.
Sin embargo, las capacidades están aumentando rápidamente y pueden saltar de repente.

Es importante destacar que la IA también permite tipos de ataques completamente nuevos.
Por ejemplo, la IA puede ser utilizada para [escuchar la contraseña que escribiste en una llamada en línea](https://beebom.com/ai-crack-password-listening-keyboard-sounds/)
o utilizar [Wi-Fi para ver a las personas a través de las paredes](https://www.marktechpost.com/2023/02/15/cmu-researchers-create-an-ai-model-that-can-detect-the-pose-of-multiple-humans-in-a-room-using-only-the-signals-from-wifi/).
La IA también puede ser utilizada para crear [malware que se modifica a sí mismo](https://www.hyas.com/blog/blackmamba-using-ai-to-generate-polymorphic-malware), lo que hace que sea mucho más difícil de detectar.

Probablemente llegará un momento en que una IA sea mejor para hackear que los mejores hackers humanos.
Esto puede salir mal de muchas maneras.

- **Infraestructura**: Las armas cibernéticas pueden ser utilizadas para obtener acceso o desactivar infraestructuras críticas, como [oleoductos](https://es.wikipedia.org/wiki/Ataque_de_ransomware_a_Colonial_Pipeline) o [redes eléctricas](https://obr.uk/box/cyber-attacks-during-the-russian-invasion-of-ukraine/).
- **Finanzas**: Las armas cibernéticas pueden ser utilizadas para [robar dinero de los bancos](https://es.wikipedia.org/wiki/Ataque_de_hackeo_de_bancos_SWIFT_2015-2016) o para [manipular el mercado de valores](https://es.wikipedia.org/wiki/Flash_crash_de_2010).
- **Militar**: Equipos como armas y sensores dependen cada vez más de la conectividad inalámbrica y el software complejo.

## Ciberataques a gran escala {#large-scale-cyberattacks}

Es posible que una IA tan poderosa sea utilizada para crear un virus que utilice un gran número de exploits de día cero.
Una IA lo suficientemente capaz podría analizar y encontrar vulnerabilidades en el código fuente de todos los sistemas operativos y otros software.
Un virus como este podría infectar cualquier computadora, independientemente del sistema operativo, a través de múltiples canales como Wi-Fi, Bluetooth, UTP, etc.
Esto podría dar control total sobre estas máquinas y permitir al controlador robar datos, utilizar el hardware para sus propios cálculos, cifrar el contenido para pedir un rescate o [desactivar la máquina por completo](https://es.wikipedia.org/wiki/Troyano_de_hardware).

Un virus como este podría ser creado como una herramienta por criminales para robar dinero, o como un arma cibernética muy destructiva por una nación o una organización terrorista.
Sin embargo, a medida que la IA se vuelve más agente, también podría ser creada y desplegada de forma autónoma por [IA desalineada](/xrisk).

Si el objetivo de un ciberataque era desactivar dispositivos e infraestructuras, el daño podría ser masivo.
Nuestra sociedad depende cada vez más de las computadoras y la Internet.
Pagos, transporte, comunicación, planificación, cadenas de suministro, redes eléctricas...
Si nuestros dispositivos ya no funcionan correctamente, muchas partes de nuestra sociedad también dejan de funcionar.

Más del [93% de los expertos en ciberseguridad](https://www.weforum.org/publications/global-cybersecurity-outlook-2023/) creen que "un evento cibernético catastrófico y de gran alcance es probable en los próximos dos años".

## Mitigación de los riesgos de ciberseguridad de la IA {#mitigating-ai-cybersecurity-risks}

La historia anterior solo puede suceder si:

1. **La capacidad de encontrar exploits de día cero** emerge. Los modelos actuales ya pueden descubrir algunas vulnerabilidades, pero esto probablemente mejorará con los modelos más nuevos.
2. **El modelo cae en manos de actores maliciosos**. Esto puede suceder si los pesos del modelo se filtran, si el modelo es de código abierto o si es desarrollado por un actor malicioso.
3. **Las vulnerabilidades de seguridad no se parchean** antes de que se despliegue un arma cibernética como esta. Desafortunadamente, los defensores están en desventaja si el modelo se distribuye ampliamente por dos razones:
   1. Parchear + lanzar + desplegar lleva mucho más tiempo que atacar. La ventana de vulnerabilidad es mayor que el tiempo que lleva crear el ataque.
   2. Los atacantes solo necesitan encontrar una vulnerabilidad, mientras que los defensores necesitan encontrar todas ellas.

Hay varias medidas que podemos implementar para abordar esto:

- **No permitir el entrenamiento de modelos que puedan encontrar exploits de día cero**. Esta es la forma más efectiva de prevenir que esto suceda. Es el camino más seguro y es lo que estamos [proponiendo](/proposal).
- **Solo permitir que los modelos se desplieguen o sean de código abierto después de una prueba exhaustiva**. Si tienen habilidades peligrosas, no los liberen.
- **Imponer regulaciones estrictas de ciberseguridad para evitar que los pesos del modelo se filtren**. Si permite que existan modelos peligrosos, asegúrese de que no caigan en manos equivocadas.
- **Requerir que las empresas de IA utilicen la IA para solucionar vulnerabilidades**. Si se entrena un modelo que puede encontrar vulnerabilidades de seguridad nuevas, utilícelo para contactar a los mantenedores del software para parchear estas vulnerabilidades. Dé al proceso de parcheo suficiente tiempo antes de que se libere el modelo. Asegúrese de que los pesos no se filtren y proteja el modelo como si fuera el código de lanzamiento de un ataque nuclear. Si se hace correctamente, la IA puede mejorar dramáticamente la ciberseguridad en todas partes.
