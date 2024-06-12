<script>
	import BillStack from '$lib/components/BillStack.svelte'
	import Carousel from '$lib/components/Carousel.svelte'
</script>

<svelte:head>
	<title>Budgeteer</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<div class="info" style="">
	<h1 class="title">
		<span class="bold">Budgeteer</span>
		<span>helps</span>
		<span>you</span>
		<Carousel />
	</h1>
	<p class="slogan">Budgeting without the bloat.</p>
</div>
<div class="stack">
	<BillStack />
</div>

<style>
	.title {
		font-size: max(2rem, 6vw);
		display: flex;
		flex-wrap: wrap;
		gap: calc(max(1.5rem, 4vw) / 5);
		text-shadow: var(--shadow-text);
	}

	.bold {
		font-weight: bold;
	}

	.slogan {
		font-size: max(1.5rem, 4vw);
		color: rgb(80, 80, 80);
	}

	.info {
		margin: 6rem;
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