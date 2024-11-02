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
	<div class="actions">
		<a href="/join">Join</a>
		<a href="/donate">Donate</a>
	</div>
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
		font-size: clamp(1.6rem, 4vw, 3rem);
		text-align: center;
	}

	@media (max-width: 768px) {
		h2 {
			transform: translate(-50%, -50%);
			width: 17rem;
			max-width: 100%;
			padding: 1.5rem;
		}
	}

	.hero {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		height: 100vh;
		overflow: hidden;
		position: relative;
		max-width: 100vw;
		margin-left: calc(-50vw + 50%);
		margin-right: calc(-50vw + 50%);
		margin-top: calc(var(--nav-height) * -1);
		margin-bottom: 5rem;
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

	.actions {
		position: absolute;
		bottom: 10%;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 1rem;
		z-index: 1;
	}

	.actions a {
		background-color: white;
		font-family: var(--font-heading);
		text-decoration: none;
		font-size: 1.2rem;
		color: black;
		padding: 1rem 2rem;
		text-transform: uppercase;
		transition: scale 0.1s;
		cursor: pointer;
	}

	.actions a:hover {
		scale: 1.05;
	}

	.actions a:active {
		scale: 0.95;
	}

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
