<script lang="ts">
	import PostMeta from '$lib/components/PostMeta.svelte'
	import Doomers from '$lib/components/Doomers.svelte'
	import { meta } from './meta'
	import Link from '$lib/components/Link.svelte'

	let { title, description, date } = meta
</script>

<PostMeta {title} {description} {date} />

<h1>{title}</h1>
<p>
	"P(doom)" es la probabilidad de resultados catastróficos (por ejemplo, la extinción humana) como
	resultado de la IA. Esto se refiere más a menudo a la probabilidad de que la IA <Link
		href="/ai-takeover">tome el control</Link
	> de la humanidad, pero diferentes escenarios también pueden constituir "doom". Por ejemplo, una gran
	parte de la población muriendo debido a una nueva arma biológica creada por la IA, colapso social debido
	a un
	<Link href="/cybersecurity-risks">ciberataque a gran escala</Link>, o la IA causando una guerra
	nuclear. Ten en cuenta que no todos usan la misma definición cuando hablan de sus estimaciones de
	probabilidades de una catástrofe a manos de una IA. Lo más notable es que el horizonte temporal a
	menudo no se especifico, lo que hace que la comparación sea un poco difícil.
</p>
<em>Presiona el valor de p(doom) para abrir la fuente.</em>
<Doomers />

<h2>Haz algo al respecto</h2>
<p>
	Independiente de tu p(doom), seguramente estás de acuerdo en que no deberíamos permitir que las
	empresas de desarrollo de IA jueguen con nuestro futuro.
	<Link href="https://pauseai.info/inscripcion">Únete a PauseAI</Link> para evitarlo.
</p>
