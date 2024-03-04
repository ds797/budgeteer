<script>
	import { scale } from 'svelte/transition'
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { route } from '$lib/stores/ui'
	import { links, date } from '$lib/stores/user'
	import { clamp, num } from '$lib/utils/math'
	import { money } from '$lib/utils/string'
	import { month } from '$lib/utils/compare'
	import Progress from '$lib/components/element/Progress.svelte'
	import Chevron from '$lib/components/svg/Chevron.svelte'
	import Transaction from '$lib/components/budget/Transaction.svelte'
	import Context from '$lib/components/element/Context.svelte'

	export let group, category

	const value = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const inflow = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const outflow = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const progress = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const max = tweened(parseFloat(category.value), {
		duration: 600,
		easing: cubicOut
	})

	const click = () => {
		$route.state.category = category
		$route.state.category.group = group.name
		$route.current = $route.category
	}

	$: {
		const positive = $links.get.sum(t =>
			t.properties.group === group.name
			&& t.properties.category === category.name
			&& 0 < t.amount
			&& !t.properties.hide && month(t.date, $date)
		) + $links.get.overflow(group.name, category.name, t =>
			0 < t.amount
			&& !t.properties.hide && month(t.date, $date)
		)
		const negative = $links.get.sum(t =>
			t.properties.group === group.name
			&& t.properties.category === category.name
			&& t.amount < 0
			&& !t.properties.hide && month(t.date, $date)
		) + $links.get.overflow(group.name, category.name, t =>
			t.amount < 0
			&& !t.properties.hide && month(t.date, $date)
		)
		$inflow = positive
		$outflow = negative
		const sum = positive + negative
		if (num(category.value)) {
			const v = parseFloat(category.value)
			if (category.spend) {
				if (category.overflow?.category) $value = clamp(v + sum, { min: 0 })
				else $value = v + sum
				$progress = clamp(v + positive + clamp(positive - negative, { max: 0 }), { min: 0, max: v })
			} else {
				if (category.overflow?.category) $value = clamp(sum, { max: v })
				else $value = sum
				$progress = clamp(positive + clamp(positive + negative, { max: 0 }), { min: 0, max: v })
			}
		} else {
			$value = sum
		}
	}

	$: $max = parseFloat(category.value)

	let node

	$: menu = {
		name: category.name,
		children: [{
			name: 'Inflow',
			type: 'value',
			value: $inflow.toFixed(2),
			color: 'var(--text-good)'
		}, {
			name: 'Outflow',
			type: 'value',
			value: Math.abs($outflow).toFixed(2),
			color: 'var(--text-bad)'
		}]
	}

	let open = false
</script>

<main>
	<div class="category">
		<div class="row">
			<button class="none name" on:click={click}>{category.name}</button>
			<button class="none" class:turn={!category.hide} on:click={() => category.hide = !category.hide}>
				<Chevron size={'1.5rem'} direction={'right'} />
			</button>
		</div>
		{ #if category.value && parseFloat(category.value) !== 0 }
			<div class="progress">
				<Progress max={$max} value={$progress} />
			</div>
		{ :else }
			<div class="bar" />
		{ /if }
		<div class="container">
			<h3>$</h3>
			<div class="money">
				<button class="none {$value < 0 ? 'bad' : 'good'}" on:click={() => open = !open} bind:this={node}>{money($value)}</button>
				<Context bind:menu {open} on:close={e => (e && !node.contains(e.detail)) && (open = false)} tall={node?.offsetHeight ?? 0} />
			</div>
			<div class="icon">
				{ #if category.overflow?.category }
					{ #if category.spend }
						<svg xmlns="http://www.w3.org/2000/svg" class="underflow" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" transition:scale|global>
							<path stroke-linecap="round" stroke-linejoin="round" d="m9 9 6-6m0 0 6 6m-6-6v12a6 6 0 0 1-12 0v-3" />
						</svg>
					{ :else }
						<svg xmlns="http://www.w3.org/2000/svg" class="overflow" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" transition:scale|global>
							<path stroke-linecap="round" stroke-linejoin="round" d="m15 15-6 6m0 0-6-6m6 6V9a6 6 0 0 1 12 0v3" />
						</svg>
					{ /if }
				{ /if }
			</div>
		</div>
	</div>
	{ #if !category.hide }
		<div class="wrapper">
			{ #each $links.order(group.name, category.name, t => month(t.date, $date)) as transaction (transaction.id) }
				<Transaction {transaction} />
			{ /each }
		</div>
	{ /if }
</main>

<style>
	main {
		align-items: stretch;
	}
	.category {
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		gap: 1rem;
	}

	.row {
		width: unset;
		align-items: center;
		display: flex;
	}

	.name {
		margin-left: 0.5rem;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.money {
		min-width: 4.5rem;
		margin-right: 0.5rem;
		display: flex;
		flex-flow: column;
		align-items: stretch;
	}

	.money button {
		text-align: right;
		text-transform: capitalize;
	}

	.icon {
		width: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon > .overflow {
		transform: scaleX(-1);
	}

	.progress {
		flex: 1;
	}

	.bar {
		flex: 1;
		height: 0.125rem;
		background: var(--text-bg);
		border-radius: 0.25rem;
	}

	.turn {
		transform: rotate(90deg);
	}

	.wrapper {
		margin-right: 1rem;
	}

	.exception {
		height: 1.5rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>