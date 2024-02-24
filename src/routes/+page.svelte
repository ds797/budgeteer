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
		font-size: max(1.5rem, 3vw);
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
		bottom: calc(-25rem + 25vw);
		right: 4.5rem;
	}

	@media (max-aspect-ratio: 1/1) {
		.info {
			margin: 2rem;
		}
		.stack {
			bottom: calc(-30rem + 25vw);
		}
	}
</style>