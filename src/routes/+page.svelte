<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import Mark from '$lib/components/Mark.svelte'
	import PostMeta from '$lib/components/PostMeta.svelte'
	import LeftCorner from '$lib/components/hero/LeftCorner.svelte'
	import RightCorner from '$lib/components/hero/RightCorner.svelte'
	import Accordion from '$lib/components/Accordion.svelte'
	import TabList from '$lib/components/TabList.svelte'

	const title = 'We need to Pause AI'
	const description = 'We are risking human extinction. We need to pause AI development, right now.'
	let active: string
</script>

<PostMeta {title} {description} />
<section class="hero">
	<section class="hero-content">
		<h1>Ne laissons pas les entreprises IA jouer avec <Mark>notre futur</Mark></h1>
		<p>
			Nous sommes une communauté de bénévoles à but non lucratif qui se concentre sur l'atténuation
			des risques liés à l'IA et qui exhorte les gouvernements à faire une pause dans le
			développement de l'IA surhumaine. Par le biais de l'éducation publique, de la défense des
			droits et de manifestations pacifiques, nous visons à sensibiliser le public. Nous ne sommes
			pas affiliés à des entreprises.
		</p>
		<Button href="/action">Agir</Button>
	</section>
	<enhanced:img
		src="$lib/assets/hero_bg.jpg"
		alt="PauseAI protesters"
		class="hero-bg"
		sizes="min(1920px, 100vw)"
		fetchpriority="high"
		loading="eager"
	/>
	<LeftCorner />
	<RightCorner />
</section>

<section class="lead">
	<h2>L'intelligence artificielle est un danger pour l'humanité</h2>
	<p>
		L'IA est une technologie puissante qui transforme de plus en plus notre monde. Elle est porteuse
		d'un potentiel extraordinaire, mais aussi de risques graves, notamment de catastrophes
		existentielles. Nous voulons marquer une pause dans le développement de systèmes d'IA plus
		puissants que GPT-4, jusqu'à ce que nous sachions comment les construire en toute sécurité et
		les garder sous contrôle démocratique.
	</p>
</section>

<section class="risks">
	<h2 id="risks_title">Les risques</h2>
	<TabList
		tabs={[
			'Risque existentiel',
			"Usurpation d'identité",
			'Instabilité économique',
			'Préjugés et discrimination',
			'Menace pour la démocratie'
		]}
		id="risks_tabs"
		let:tab
		bind:active
		tabs_title_id="risks_title"
	>
		{tab}
		<svelte:fragment slot="panel" let:tab>
			{#if tab === 'Risque existentiel'}
				<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dapibus felis a metus
					venenatis auctor ut vel orci. Praesent pulvinar nisl sed lorem aliquam volutpat. Ut vel
					varius augue, sit amet semper tortor. Praesent dignissim ornare consequat. Praesent
					aliquam, magna vel sollicitudin placerat, augue dolor euismod libero, sit amet
					sollicitudin nisi eros non ipsum. Sed eu suscipit dui. Donec tincidunt nisi pharetra,
					mattis augue ut, convallis nisi. Cras ipsum magna, volutpat sed libero sed, ornare
					molestie velit. Aenean lorem dui, euismod ac sollicitudin in, luctus quis lacus. Duis
					dapibus dapibus lorem, in porta ipsum efficitur et. Donec elementum nisi nunc, quis luctus
					ante varius dictum. Mauris ut nisl sapien. Aliquam erat volutpat. Nullam at congue ligula.
					Cras porta, metus ut hendrerit dictum, arcu metus eleifend arcu, non tristique nunc mauris
					vitae enim.
				</p>
				<p>
					Sed dolor libero, dictum in commodo ut, suscipit vel lectus. Nam in justo cursus, euismod
					arcu ut, molestie leo. Class aptent taciti sociosqu ad litora torquent per conubia nostra,
					per inceptos himenaeos. Nunc iaculis augue orci, vitae pharetra nunc faucibus volutpat.
					Proin ac cursus metus. Curabitur aliquet nulla at ipsum vulputate, sed faucibus felis
					pellentesque. Praesent at venenatis turpis, vel congue urna. Suspendisse elementum
					vestibulum elit. In sapien dolor, venenatis eget felis quis, blandit vestibulum turpis.
					Morbi vel viverra orci, non vulputate orci. Sed convallis ultrices placerat. Class aptent
					taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc
					ullamcorper in tortor sit amet blandit. Morbi tincidunt quis magna tincidunt volutpat.
					Fusce sit amet massa vitae augue laoreet rutrum ac non justo. Mauris pulvinar dictum lorem
					eget mattis.
				</p>
				<Button href="/risks">En apprendre davatange</Button>
			{:else if tab === "Usurpation d'identité"}
				<p>
					Nulla pretium ligula justo, non tincidunt arcu molestie sit amet. Vivamus finibus felis
					tempor hendrerit ultricies. Etiam feugiat ullamcorper felis, quis interdum ligula
					imperdiet non. Aliquam faucibus viverra lacus, quis bibendum neque rhoncus vel. Morbi
					malesuada eros laoreet porttitor facilisis. Suspendisse venenatis faucibus placerat. Donec
					ultrices viverra nisl, nec ullamcorper nunc tincidunt vel. Sed interdum tellus vel
					eleifend imperdiet. Vestibulum ac odio risus. Interdum et malesuada fames ac ante ipsum
					primis in faucibus. Vestibulum facilisis ex a justo pretium dictum. Donec in ornare justo.
				</p>
				<p>
					Pellentesque elit enim, molestie non nisl eu, cursus consequat ante. Suspendisse eget eros
					id tellus pellentesque convallis blandit ac velit. Morbi egestas ut ex id condimentum.
					Quisque quis dictum quam, quis luctus velit. Phasellus nec faucibus mauris. Maecenas
					tincidunt ligula in arcu feugiat interdum. Fusce condimentum rhoncus rutrum. Quisque
					tincidunt mauris in nisl hendrerit ornare. Integer pellentesque nisl sit amet lorem
					euismod, sit amet pretium ligula semper.
				</p>
				<Button href="/risks">En apprendre davatange</Button>
			{:else if tab === 'Instabilité économique'}
				<p>
					Etiam eu commodo justo. Curabitur tortor nunc, pulvinar at bibendum ut, efficitur interdum
					libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac
					turpis egestas. Curabitur at pulvinar risus. Phasellus dignissim arcu risus, non cursus
					leo posuere vel. Integer luctus dapibus justo eget accumsan. Etiam vehicula, tellus nec
					condimentum commodo, nisi nunc lobortis ligula, eget fermentum tortor erat sed ligula.
					Cras sollicitudin, urna eget finibus vulputate, dolor purus auctor lectus, nec tempor elit
					mi ut mi. Nulla eu enim lacus. Donec a porta dui, sed bibendum mauris. Duis dictum, risus
					at egestas finibus, velit urna pretium purus, a efficitur tortor nibh ac odio. Donec
					tincidunt ut nibh ut consequat. In ullamcorper nisi malesuada metus pellentesque, eleifend
					consequat purus convallis. Phasellus ut orci enim. Curabitur et lorem quis erat malesuada
					interdum. Sed massa lacus, pellentesque scelerisque aliquam ut, maximus eget mauris.
				</p>
				<p>
					Proin vel odio orci. Mauris convallis, dolor at varius posuere, dui sem volutpat augue, at
					placerat felis sapien eget ex. Vivamus et nisi congue nibh viverra luctus ut vel mauris.
					Aenean semper, est non dictum luctus, erat nulla interdum magna, at viverra nisi neque at
					massa. Nam vel lectus in ligula pellentesque fringilla. Pellentesque a eros sem. Donec
					gravida, neque a lobortis placerat, nunc urna elementum ligula, quis mattis velit est
					tristique enim. Mauris at nulla eget diam cursus blandit. Fusce vestibulum eget quam non
					laoreet.
				</p>
				<Button href="/risks">En apprendre davatange</Button>
			{:else if tab === 'Préjugés et discrimination'}
				<p>
					Donec sed felis sem. Donec porttitor nisl vitae nunc bibendum bibendum. In enim ex,
					accumsan ut maximus quis, luctus et sapien. Proin volutpat mollis massa. Aenean libero
					tellus, luctus vel ipsum in, ultricies suscipit nibh. Integer ac facilisis arcu. Sed
					rhoncus suscipit mi id gravida. Nullam ut semper nulla, quis tristique turpis. Sed sit
					amet neque sed tellus hendrerit varius eleifend non tortor.
				</p>
				<p>
					Aenean commodo at tellus a ultrices. Nullam nulla lectus, efficitur at leo at, hendrerit
					sagittis libero. Quisque nec diam vitae nibh auctor ullamcorper ac non sapien. Nunc a
					dolor hendrerit, tristique elit vel, aliquet urna. Nunc a nisi congue, efficitur libero
					vitae, elementum neque. Proin quis ligula at odio rhoncus tristique consectetur viverra
					magna. Ut sed eros cursus, tincidunt mauris non, aliquet massa. Sed venenatis non felis
					eget pretium. Cras cursus aliquam dolor non malesuada.
				</p>
				<Button href="/risks">En apprendre davatange</Button>
			{:else if tab === 'Menace pour la démocratie'}
				<p>
					Aenean mattis purus iaculis scelerisque pharetra. Sed consectetur vitae ligula in
					volutpat. Morbi scelerisque lacus ex. Donec eget lorem in dolor iaculis rutrum id et erat.
					Maecenas rutrum suscipit sapien. Praesent mauris eros, ornare in justo non, tincidunt
					maximus eros. Vestibulum ipsum lectus, rhoncus in libero id, semper blandit risus.
				</p>
				<p>
					Aenean accumsan, purus sed aliquet vulputate, quam erat tempus ipsum, et aliquam diam
					turpis non arcu. Nulla varius justo quis fermentum condimentum. Nullam bibendum porttitor
					odio eget fermentum. In efficitur vestibulum semper. Vivamus laoreet sit amet magna ac
					scelerisque. Ut laoreet sem leo, vitae sagittis sem vulputate et. Phasellus vulputate nisl
					nec molestie vehicula. Nullam pulvinar tempor tortor quis pulvinar.
				</p>
				<Button href="/risks">En apprendre davatange</Button>
			{/if}
		</svelte:fragment>
	</TabList>
</section>

<section class="faq">
	<h2>F.A.Q.</h2>
	<Accordion id="accordion1">
		<svelte:fragment slot="head">Êtes-vous contre la technologie ?</svelte:fragment>
		<svelte:fragment slot="details">
			<p>
				In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we
				might be almost there. Superintelligence could be one innovation away, so we should tread
				carefully. In 2020, experts thought we had more than 35 years until AGI. Recent
				breakthroughs show we might be almost there. Superintelligence could be one innovation away,
				so we should tread carefully.
			</p>
		</svelte:fragment>
	</Accordion>
	<Accordion id="accordion2">
		<svelte:fragment slot="head">
			Pensez-vous vraiment que le développement de l’IA peut être mise en pause ?
		</svelte:fragment>
		<svelte:fragment slot="details">
			<p>
				In 2020, experts thought we had more than 35 years until AGI. Recent breakthroughs show we
				might be almost there. Superintelligence could be one innovation away, so we should tread
				carefully. In 2020, experts thought we had more than 35 years until AGI. Recent
				breakthroughs show we might be almost there. Superintelligence could be one innovation away,
				so we should tread carefully.
			</p>
		</svelte:fragment>
	</Accordion>
</section>

<style>
	.hero + section {
		margin-top: 100vh;
	}
	.hero {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		align-items: center;
		display: flex;
	}
	.hero-content {
		color: #fff;
		text-align: left;
		width: 60rem;
		padding: 6rem;
		z-index: 1;
	}
	.hero-content p {
		width: 45rem;
		margin: 2rem 0;
	}
	.hero-bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.hero::after {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: 
		/* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#000000+0,000000+27,1b1b1b+49,1e1e1e+49,1d1d1d+49,232323+50,212121+51,242424+51,262626+53,282828+53,292929+56,2b2b2b+56,292929+62,272727+62,252525+66,1c1c1c+71,1c1c1c+77,1a1a1a+78,181818+82,161616+84,141414+84,151515+85,101010+86,0f0f0f+87,090909+88,030303+90,0d0d0d+91,010101+91,010101+100&0.76+0,0.76+27,0.56+49,0.55+60,0.59+71,0.48+90,0.48+100 */
			linear-gradient(
			to right,
			rgba(0, 0, 0, 0.76) 0%,
			rgba(0, 0, 0, 0.76) 27%,
			rgba(29, 29, 29, 0.56) 49%,
			rgba(35, 35, 35, 0.56) 50%,
			rgba(36, 36, 36, 0.56) 51%,
			rgba(40, 40, 40, 0.56) 53%,
			rgba(43, 43, 43, 0.56) 56%,
			rgba(40, 40, 40, 0.55) 60%,
			rgba(39, 39, 39, 0.56) 62%,
			rgba(37, 37, 37, 0.57) 66%,
			rgba(28, 28, 28, 0.59) 71%,
			rgba(28, 28, 28, 0.56) 77%,
			rgba(26, 26, 26, 0.55) 78%,
			rgba(24, 24, 24, 0.53) 82%,
			rgba(20, 20, 20, 0.52) 84%,
			rgba(21, 21, 21, 0.51) 85%,
			rgba(16, 16, 16, 0.5) 86%,
			rgba(15, 15, 15, 0.5) 87%,
			rgba(9, 9, 9, 0.49) 88%,
			rgba(3, 3, 3, 0.48) 90%,
			rgba(1, 1, 1, 0.48) 91%,
			rgba(1, 1, 1, 0.48) 100%
		);
	}
	.lead {
		align-self: center;
		width: 60rem;
	}
	.lead h2 {
		margin-left: 4rem;
	}
	section + section {
		margin-top: 16rem;
	}
</style>
