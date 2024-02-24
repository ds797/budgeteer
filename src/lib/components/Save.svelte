<script>
	import { links, date } from '$lib/stores/user'
	import { toDate } from '$lib/utils/convert'
	import { max } from '$lib/utils/math'
	import { month } from '$lib/utils/compare'
	import Transaction from '$lib/components/Transaction.svelte'

	export let height = 2;

	const months = (d1, d2) => {
		const one = new Date(d2)
		one.setMonth(d2.getMonth() - 1)
		const two = new Date(d2)
		two.setMonth(d2.getMonth() - 2)
		const three = new Date(d2)
		three.setMonth(d2.getMonth() - 3)

		return month(d1, one) || month(d1, two) || month(d1, three)
	}

	let currentValues = Array(31).fill(0)
	let averageValues = Array(31).fill(0)

	$: currentValues = Array(31).fill(undefined).map((_, i) => $links.get.sum(t => 0 < t.amount && month(t.date, $date) && toDate(t.date).getTime() < new Date().getTime() && toDate(t.date).getDate() === i + 1))
	$: averageValues = Array(31).fill(undefined).map((_, i) => $links.get.sum(t => 0 < t.amount && months(t.date, $date) && toDate(t.date).getTime() < new Date().getTime() && toDate(t.date).getDate() === i + 1) / 3)

	$: current = currentValues.map((_, i) => currentValues.slice(0, i).reduce((p, c) => p + c, 0))
	$: average = averageValues.map((_, i) => averageValues.slice(0, i).reduce((p, c) => p + c, 0))
	$: top = max([average[average.length - 1], current[current.length - 1]])

	const y = v => {
		const multiplier = -1000 / top
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

	$: difference = current[new Date().getDate() - 1] - average[new Date().getDate() - 1]

	const sort = () => {
		const ts = $links.which.transactions(t => month(t.date, $date))
		if (!ts.length) return []

		return ts.filter(t => 0 < t.amount).toSorted((a, b) => {
			// console.log(a, b)
			return a.amount - b.amount
		})
	}

	$: sorted = sort($links)
</script>

<main>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class="label">
		<div class="left">
			<p>Current saving</p>
			<h2>{(current[current.length - 1]).toFixed(2)}</h2>
		</div>
		<div class="right">
			<p><span class="value" style="color: {difference < 0 ? 'var(--text-bad)' : 'var(--text-good)'};">{Math.abs(difference).toFixed(2)}</span> {0 < difference ? 'above' : 'below'} average</p>
		</div>
	</div>
	<div class="wrapper">
		<svg class="graph" viewBox="0 0 300 1020" preserveAspectRatio="none">
			<path class="average" style="fill: var(--text-good);" d="M0, 1010 {path(average)}L300, 1010" />
			<path class="position" d="M{(new Date().getDate() - 1) * 10}, {1010 + y(current[new Date().getDate() - 1])} L{(new Date().getDate() - 1) * 10}, 1010" />
			<path class="bg" d="M0, 1010 L300, 1010"/>
			<path class="current" d="M0, 1010 {path(current, i => i <= new Date().getDate() - 1)}" />
		</svg>
	</div>
	{ #if height == 2 }
		<div class="gap" />
		<h3>Top Earnings</h3>
		<div class="transactions">
			{ #each sorted as transaction (transaction.id) }
				<div class="wrapper">
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
		display: flex;
		flex-flow: column;
	}
</style>