<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links } from '$lib/stores/user'
	import { toDate } from '$lib/utils/date'
	import { max } from '$lib/utils/math'
	import { month } from '$lib/utils/compare'
	import Transaction from '$lib/components/budget/Transaction.svelte'

	// TODO: ignore hidden elements

	export let height = 2;
	export let spend = false;

	let date = new Date()
	let difference = tweened(0, {
		duration: 600,
		easing: cubicOut
	})
	let value = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const months = (d1, d2) => {
		const one = new Date(d2)
		one.setMonth(d2.getMonth() - 1)
		const two = new Date(d2)
		two.setMonth(d2.getMonth() - 2)
		const three = new Date(d2)
		three.setMonth(d2.getMonth() - 3)

		return month(d1, one) || month(d1, two) || month(d1, three)
	}

	// const predicate = i => {

	let currentValues = Array(31).fill(0)
	let averageValues = Array(31).fill(0)

	$: currentValues = Array(31).fill(undefined).map((_, i) => $links.get.sum(t => (spend ? t.amount < 0 : 0 < t.amount) && i === toDate(t.date).getDate() - 1 && month(t.date, date) && toDate(t.date).getTime() < date.getTime()))
	$: averageValues = Array(31).fill(undefined).map((_, i) => $links.get.sum(t => (spend ? t.amount < 0 : 0 < t.amount) && i === toDate(t.date).getDate() - 1 && months(t.date, date) && toDate(t.date).getTime() < date.getTime()) / 3)

	$: current = currentValues.map((_, i) => spend
		? currentValues.slice(0, i + 1).reduce((p, c) => p - c, 0)
		: currentValues.slice(0, i + 1).reduce((p, c) => p + c, 0))
	$: average = averageValues.map((_, i) => spend
		? averageValues.slice(0, i + 1).reduce((p, c) => p - c, 0)
		: averageValues.slice(0, i + 1).reduce((p, c) => p + c, 0))
	$: top = max([average[average.length - 1], current[current.length - 1]])

	const y = v => {
		const multiplier = -1000 / (top + 0.1) // Avoid divide by 0
		return v * multiplier
	}

	const path = (values, predicate = () => true) => {
		let string = ''

		values.forEach((v, i) => {
			let x = i * 10
			if (predicate(i)) string += `S${x - 7} ${1010 + y(v)}, ${x}, ${1010 + y(v)} `
		})

		return string
	}

	const sort = () => {
		const ts = $links.which.transactions(t => month(t.date, date))
		if (!ts.length) return []

		return ts.filter(t => spend ? t.amount < 0 : 0 < t.amount).toSorted((a, b) => spend ? a.amount - b.amount : b.amount - a.amount)
	}

	$: sorted = sort($links).slice(0, 5)

	$: $difference = current[date.getDate() - 1] - average[date.getDate() - 1]
	$: $value = current[date.getDate() - 1]
</script>

<main>
	<div class="label">
		<div class="left">
			<p>Current {spend ? 'spend' : 'saving'}</p>
			<h2>{$value.toFixed(2)}</h2>
		</div>
		<div class="right">
			<p><span class="value" style="color: {(spend ? 0 < $difference : $difference < 0) ? 'var(--text-bad)' : 'var(--text-good)'};">{Math.abs($difference).toFixed(2)}</span> {0 < $difference ? 'above' : 'below'} average</p>
		</div>
	</div>
	<div class="wrapper">
		<svg class="graph" viewBox="0 0 300 1020" preserveAspectRatio="none">
			<path class="average" style="fill: {spend ? 'var(--text-bad)' : 'var(--text-good)'};" d="M0, 1010 {path(average)}L300, 1010" />
			<path class="position" d="M{(date.getDate() - 1) * 10}, {1010 + y(current[date.getDate() - 1])} L{(date.getDate() - 1) * 10}, 1010" />
			<path class="current" d="M0, {1010 + y(current[0])} {path(current, i => i <= date.getDate() - 1)}" />
			<path class="bg" d="M0, 1010 L300, 1010"/>
		</svg>
	</div>
	<div class="gap" />
	{ #if height == 2 }
		<h3>Top {spend ? 'Expenses' : 'Earnings'}</h3>
		<div class="transactions">
			{ #each sorted as transaction (transaction.id) }
				<div class="transaction">
					<Transaction {transaction} />
				</div>
			{ /each }
		</div>
	{ /if }
</main>

<style>
	main {
		flex: 1;
		padding: 1rem;
		box-sizing: border-box;
		justify-content: stretch;
		align-items: stretch;
		gap: 0.5rem;
	}

	.label {
		display: flex;
		color: var(--text-weak);
	}

	.label p {
		line-height: 1.25;
	}

	.label .left {
		flex: 3;
	}

	.label .left h2 {
		color: var(--text);
		font-weight: bold;
	}

	.label .right {
		flex: 2;
		display: flex;
		text-align: right;
	}

	.label .right p {
		flex: 1;
	}

	.label .right .value {
		font-weight: bold;
	}

	.wrapper {
		flex: 1;
		min-height: 3rem;
		max-height: 8rem;
		position: relative;
	}

	.graph {
		position: absolute;
		height: 100%;
		width: 100%;
		transition: all 0.4s ease-out;
	}

	.graph path {
		fill: none;
		stroke-width: 2px;
		stroke-linecap: round;
		stroke-dashoffset: -50%;
		vector-effect: non-scaling-stroke;
	}

	.bg {
		stroke: var(--accent-0-light);
	}

	.average {
		filter: saturate(75%);
		opacity: 35%;
	}

	.current {
		stroke: var(--accent-0);
	}

	.position {
		stroke: var(--accent-0-light);
		stroke-dasharray: 5 5;
	}

	.gap {
		height: 0.5rem;
	}

	.transactions {
		flex: 1;
		display: flex;
		flex-flow: column;
		overflow-y: auto;
	}
</style>