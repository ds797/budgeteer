<script>
	import Transaction from '$lib/components/investment/Transaction.svelte'

	export let holding
	export let security
	export let transactions

	let open = Array(transactions.length).fill(undefined).map(() => false)

	const close = () => open = open.map(() => false)

	$: close(transactions)
</script>

<main>
	<h2>{security.name}</h2>
	<div class="info">
		<h3>Total</h3>
		<div class="bar" />
		<h3>{(holding.quantity * security.close_price).toFixed(2)}</h3>
	</div>
	<div class="bar" />
	<div class="transactions">
		{ #each transactions as transaction, index }
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