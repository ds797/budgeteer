<script>
	import { slide } from '$lib/utils/transition'
	import { money, title } from '$lib/utils/string'
	import { toDate } from '$lib/utils/date'
	import { route } from '$lib/stores/ui'

	export let transaction

	const format = d => {
		d = toDate(d)

		return `${d.getMonth() + 1}/${d.getDate()}`
	}
</script>

<main>
	<button transition:slide class='none {transaction.properties.hide ? 'hidden' : (transaction.amount < 0 ? 'bad' : 'good')}' on:click={() => {
		$route.state.transaction = transaction
		$route.state.transaction.new = structuredClone(transaction)
		$route.state.choose.category = $route.state.transaction.new.properties
		$route.state.choose.account = $route.state.transaction.new
		$route.current = $route.transaction
	}}>
		<p class="name">{transaction.amount < 0 ? '-' : '+'} {title(transaction.merchant_name ?? transaction.name ?? 'Untitled Transaction')}</p>
		<p class="date">{format(transaction.date)}</p>
		<div class="bar" />
		<p>{money(Math.abs(transaction.amount))}</p>
	</button>
</main>

<style>
	main {
		flex-flow: row;
	}
	button {
		flex: 1;
		margin: 0 1vw 0 2vw;
		align-self: flex-start;
		display: flex;
		justify-content: stretch;
		align-items: center;
		border: 0;
		gap: 0.5rem;
	}

	p {
		align-self: flex-start;
	}

	.name {
		max-width: 40vw;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.date {
		color: var(--text-weak);
		font-weight: 500;
	}

	.bar {
		height: 0.125rem;
		flex: 1;
		background: var(--text-bg);
		border-radius: 0.25rem;
	}

	.hidden {
		color: darkgray;
	}
</style>