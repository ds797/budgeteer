<script>
	import { slide } from '$lib/utils/transition'
	import { toDate } from '$lib/utils/date'
	import Context from '$lib/components/element/Context.svelte'
	import Arrow from '$lib/components/svg/Arrow.svelte'
	import Close from '$lib/components/svg/Close.svelte'

	export let transaction, index
	export let open
	export let close

	let node

	const format = d => {
		d = toDate(d)

		return `${d.getMonth() + 1}/${d.getDate()}`
	}

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

	const i = icon(transaction.type, transaction.amount)
</script>

<main>
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
		open[index] = !open[index]
	}} bind:this={node} transition:slide>
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
		<p class="date">{format(transaction.date)}</p>
		<div class="bar" />
		<p>{Math.abs(transaction.amount).toFixed(2)}</p>
	</button>
	<Context bind:menu bind:open={open[index]} on:close={e => !node.contains(e.detail) && close()} />
</main>

<style>
	main {
		flex-flow: column;
		align-items: stretch;
	}

	button {
		display: flex;
	}

	.bar {
		flex: 1;
		height: 0.125rem;
		background: var(--text-bg);
		border-radius: 0.5rem;
	}

	.transaction {
		padding: 0.25rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
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

	.date {
		color: var(--text-weak);
		font-weight: 500;
	}
</style>