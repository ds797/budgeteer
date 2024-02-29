<script>
	import Budgets from '$lib/components/Budgets.svelte'

	export let data
</script>

<svelte:head>
	<title>Budget</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<main>
	<Budgets {data} />
</main>

<style>
	main {
		flex: 1;
		box-sizing: border-box;
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}
</style>