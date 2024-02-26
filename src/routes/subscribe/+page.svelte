<script>
	import { goto } from '$lib/utils/navigation'

	let card

	const move = e => {
		let x = e.x / window.innerWidth - 0.5
		let y = e.y / window.innerHeight - 0.5
		card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
	}
</script>

<svelte:window on:mousemove={move} />

<main>
	<div class="container">
		<div class="card" bind:this={card}>
			<div class="header">
				<h2>Budgeteer</h2>
				<div class="price">
					<h3>$9.99</h3>
					<p>/</p>
					<p>month</p>
				</div>
			</div>
			<div class="info">
				<p>Simple, streamlined budgeting that allows you to act on your decisions as easily as if you controlled Budgeteer with your mind.</p>
				<div class="buy">
					<p class="tos">By continuing, you agree to our <a href="/tos" target="_blank">terms</a>.</p>
					<button class="fill" on:click={() => goto('/subscribe/start')}>Purchase</button>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		padding: 1rem;
		flex: 1;
		box-sizing: border-box;
		align-items: stretch;
	}

	.container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		perspective: 40rem;
	}

	.card {
		width: 15rem;
		height: 20rem;
		padding: 1rem;
		display: flex;
		flex-flow: column;
		justify-content: flex-start;
		gap: 0.5rem;
		background: var(--frosted);
		border-radius: 0.75rem;
		box-shadow: var(--shadow);
		transform-style: preserve-3d;
	}

	.header {
		display: flex;
		flex-flow: column;
	}

	.price {
		display: flex;
		gap: 0.25rem;
	}

	.price > p {
		color: var(--text-weak);
	}

	.info {
		flex: 1;
		display: flex;
		flex-flow: column;
		justify-content: space-between;
	}

	.buy {
		display: flex;
		flex-flow: column;
		justify-content: space-between;
		gap: 0.25rem;
	}

	.buy > p {
		color: var(--text-weak);
	}

	.buy > .tos {
		font-size: 0.875rem;
	}

	.buy > button {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>