<script>
	import { route } from '$lib/stores/ui'
	import Loading from '$lib/components/Loading.svelte'
	import Budgets from '$lib/components/Budgets.svelte'

	export let data
</script>

<svelte:head>
	<title>Budgeteer</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<main>
	{ #if $route.current?.loading || !data.session }
		<Loading />
	{ :else }
		<Budgets {data} />
	{ /if }
</main>

<style>
	main {
		padding: 0 5vw;
		box-sizing: border-box;
		flex: 1;
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}
</style>