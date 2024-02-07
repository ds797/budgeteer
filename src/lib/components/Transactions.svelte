<script>
	import { links } from '$lib/stores/user'
	import Transaction from '$lib/components/Transaction.svelte'
</script>

<main>
	{ #each $links.which.transactions(() => true) as transaction }
		<!-- <p>{transaction.merchant_name ?? transaction.name}</p> -->
		<Transaction {transaction} />
	{ :else }
		<p>No transactions</p>
	{ /each }
</main>