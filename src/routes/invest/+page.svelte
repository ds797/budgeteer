<script>
	import { onMount } from 'svelte'
	import { links } from '$lib/stores/user'
	import Investment from '$lib/components/investment/Investment.svelte'
	import Data from '$lib/components/investment/Data.svelte'

	export let data

	let selected = {}
	const history = []

	onMount(async () => {
		console.log('Mounting')
		// const { data: history } = await data.supabase.invoke('stocks', { type: { history: { ticker: 'TSLA' } } })
		console.log(history)
	})
</script>

<svelte:head>
	<title>Invest</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<main>
	<div class="investments">
		{ #each $links.investments as link }
			{ #each link.holdings as holding }
				{ @const security = link.securities.find(s => s.security_id === holding.security_id) }
				{ @const transactions = link.transactions }
				<Investment {holding} {security} {transactions} selected={holding.account_id === selected.holding?.account_id && holding.security_id === selected.holding?.security_id} on:click={e => selected = e.detail} />
			{ /each }
		{ /each }
	</div>
	<div class="bar" />
	<div class="data">
		{ #if selected.holding }
			<Data holding={selected.holding} security={selected.security} transactions={(selected.transactions ?? []).filter(t => t.security_id === selected.security.security_id)} />
		{ :else }
			<p>Select an investment from the list to view details!</p>
		{ /if }
	</div>
</main>

<style>
	main {
		padding: 0 5vw;
		flex-flow: row;
		align-items: stretch;
		gap: 1vw;
	}

	p {
		text-align: center;
	}

	.investments { flex: 1 }

	.bar {
		width: 0.125rem;
		background: var(--text-bg);
	}

	.data {
		flex: 1;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
	}

	.data p { color: var(--text-weak) }
</style>