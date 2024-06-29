<script lang="ts">
	import Button from '$lib/components/Button.svelte'
	import TabList from '$lib/components/TabList.svelte'
	import UnderlinedTitle from '../UnderlinedTitle.svelte'

	const label_id = 'risks-title'
</script>

<section class="risks" aria-labelledby={label_id}>
	<UnderlinedTitle id={label_id}>Les risques</UnderlinedTitle>
	<TabList
		tabs={[
			'Risque existentiel',
			"Usurpation d'identité",
			'Instabilité économique',
			'Préjugés et discrimination',
			'Menace pour la démocratie'
		]}
		id="risks-tabs"
		let:tab
		{label_id}
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
