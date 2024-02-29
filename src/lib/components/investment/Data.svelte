<script>
	import { slide } from '$lib/utils/transition'
	import Context from '$lib/components/element/Context.svelte'
	import Arrow from '$lib/svg/Arrow.svelte'
	import Close from '$lib/svg/Close.svelte'

	export let holding
	export let security
	export let transactions

	let open = Array(transactions.length).fill(undefined).map(() => false)

	const icon = (type, amount) => {
		switch (type) {
			case 'buy':
				return { direction: -90, good: true }
			case 'sell':
				return { direction: 90, good: false }
			case 'cancel':
				// TODO: Not ideal for readability
				return { direction: null, good: false }
			case 'cash':
				return { direction: -90, good: true }
			case 'fee':
				return { direction: 90, good: false }
			case 'transfer':
				return { direction: amount < 0 ? -180 : 0, good: amount < 0 ? false : true }
		}
	}

	let menu = { name: 'Transaction' }

	const close = () => open = open.map(() => false)

	$: close(transactions)
	$: console.log(transactions)
</script>

<main>
	<h2>{security.name}</h2>
	<div class="transactions">
		{ #each transactions as transaction, index }
			{ @const i = icon(transaction.type, transaction.amount) }
			<div class="context">
				<button class="none transaction" on:click={() => {
					menu.children = [{
						name: 'Quantity',
						type: 'value',
						value: Math.floor(Math.abs(transaction.quantity) * 1000000) / 1000000
					}, {
						name: 'Each',
						type: 'value',
						value: transaction.price.toFixed(2)
					}]
					close()
					open[index] = true
				}} transition:slide>
					<div class="type">
						{ #if i.direction !== null }
						<div class="arrow" style="transform: rotate({i.direction}deg);">
							<Arrow stroke={i.good ? 'var(--text-good)' : 'var(--text-bad)'} size={'1.25rem'} />
						</div>
						{ :else }
							<Close stroke={'var(--text-bad)'} size={'1.25rem'} />
						{ /if }
						<p class="bold">{transaction.type}</p>
					</div>
					<div class="bar" />
					<p>{Math.abs(transaction.amount).toFixed(2)}</p>
				</button>
				<Context bind:menu bind:open={open[index]} on:close={close} />
			</div>
		{ /each }
	</div>
</main>

<style>
	main {
		flex: 1;
		align-items: stretch;
		gap: 0.25rem;
	}

	h2 {
		text-align: left;
	}

	.transactions {
		flex: 1;
		padding: 0.25rem;
		display: flex;
		flex-flow: column;
		align-items: stretch;
	}

	.context {
		display: flex;
		flex-flow: column;
		align-items: stretch;
	}

	.transaction {
		padding: 0.25rem 0;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.type {
		display: flex;
		align-items: center;
		gap: 0.125rem;
	}

	.type .arrow {
		transition: transform 0.4s cubic-bezier(0, 0, 0.16, 1.34);
	}

	.transaction .bold {
		text-transform: capitalize;
	}

	.transaction .bar {
		flex: 1;
		height: 0.125rem;
		background: var(--text-bg);
	}
</style>