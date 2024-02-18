<script>
	import BillStack from '$lib/components/BillStack.svelte'
</script>

<div class="info" style="">
	<h1 class="hero">Budgeteer</h1>
	<p class="big">Intuitive budgeting that allows you to harness the power of artificial intelligence.</p>
</div>
<div class="stack">
	<BillStack />
</div>

<style>
	.hero {
		font-size: 12vw;
		display: flex;
		justify-content: flex-start;
	}

	.big {
		font-size: 2rem;
	}

	.info {
		margin: 2rem;
		margin-right: 9rem;
		display: flex;
		flex-flow: column;
		gap: 2rem;
	}

	.stack {
		position: fixed;
		bottom: 0;
		right: 4.5rem;
	}

	@media (max-aspect-ratio: 1/1) {
		.info {
			margin: 2rem;
		}
		.stack {
			bottom: -45vh;
		}
	}
</style>