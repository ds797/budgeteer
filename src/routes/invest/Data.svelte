<script>
	import { toDate } from '$lib/utils/date'
	import Slide from '$lib/components/element/Slide.svelte'
	import Transaction from './Transaction.svelte'

	export let data
	export let holding
	export let security
	export let transactions

	let open = Array(transactions.length).fill(undefined).map(() => false)

	const close = () => open = open.map(() => false)

	const invoke = async ticker => {
		const { data: { results } } = await data.supabase.invoke('stocks', { type: { history: { ticker } } })

		return results.map(r => r.c)
	}

	$: close(transactions)

	let interval = { date: new Date(new Date().setMonth(new Date().getMonth() - 1)), value: 'Month' }
</script>

<main>
	<h2>{security.name}</h2>
	<!-- { #if security.ticker_symbol }
		<div class="graph" transition:scale>
			{ #await 1 }
				<p>Loading...</p>
			{ :then _ }
				<LineGraph data={values} />
			{ :catch error }
				<p>Error: {error}</p>
			{ /await }
		</div>
	{ /if } -->
	<div class="info">
		<h3>Total</h3>
		<div class="bar" />
		<h3>{(holding.quantity * security.close_price).toFixed(2)}</h3>
	</div>
	<div class="bar" />
	<Slide options={['Week', 'Month', 'Year']} value={interval.value} set={v => {
		const d = new Date()
		if (v === 'Week') d.setDate(d.getDate() - 7)
		else if (v === 'Month') d.setMonth(d.getMonth() - 1)
		else d.setYear(d.getFullYear() - 1)
		interval = { date: d, value: v }
	}} />
	<div class="transactions">
		{ #each transactions.filter(t => toDate(t.date).getTime() > interval.date.getTime()) as transaction, index }
			<Transaction {transaction} {index} {close} bind:open />
		{ /each }
	</div>
</main>

<style>
	main {
		flex: 1;
		align-items: stretch;
		gap: 0.5rem;
	}

	h2 {
		text-align: left;
	}

	.graph {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
	}

	.bar {
		flex: 1;
		height: 0.125rem;
		background: var(--text-bg);
		border-radius: 0.5rem;
	}

	main > .bar {
		flex: unset;
		margin: 0 0.5rem;
	}

	.info {
		padding: 0.25rem 0.75rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.transactions {
		flex: 1;
		padding: 0 0.25rem;
		display: flex;
		flex-flow: column;
		align-items: stretch;
	}
</style>