<script type="ts">
	import london from './../../assets/protests/london.jpeg'
	import denHaag from './../../assets/protests/den-haag.jpeg'
	import sf from './../../assets/protests/san-francisco.jpeg'
</script>

<div class="hero">
	<div class="overlay"></div>
	<img src={london} alt="" />
	<img src={denHaag} alt="" />
	<img src={sf} alt="" />
	<h2>DON’T LET AI COMPANIES <br />GAMBLE WITH OUR FUTURE</h2>
</div>

<style>
	h2 {
		background-color: black;
		padding: 2rem;
		position: absolute;
		text-transform: uppercase;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: clamp(1rem, 4vw, 3rem);
		text-align: center;
	}
	.hero {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 1rem;
		height: 100vh;
		overflow: hidden;
		position: relative;
		max-width: 100vw;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		margin-top: calc(var(--nav-height) * -1);
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: var(--brand);
		opacity: 0.8;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
