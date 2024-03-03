<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links } from '$lib/stores/user'
	import { toDate, count } from '$lib/utils/date'
	import { clamp, max } from '$lib/utils/math'
	import { month as compareMonth } from '$lib/utils/compare'
	import Transaction from '$lib/components/budget/Transaction.svelte'

	// TODO: ignore hidden elements

	export let height = 2;
	export let type = { spend: false };
	export let month = new Date()

	let date = new Date()

	const updateDate = () => {
		if (month.getMonth() === new Date().getMonth()) date = new Date()
		else {
			const d = new Date()
			d.setMonth(month.getMonth() + 1)
			d.setDate(0)
			d.setHours(23, 59, 59, 999)
			date = d
		}
	}

	$: updateDate(month)

	let difference = tweened(0, {
		duration: 600,
		easing: cubicOut
	})
	let value = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const compareMonths = (d1, d2) => {
		const one = new Date(d2)
		one.setMonth(d2.getMonth() - 1)
		const two = new Date(d2)
		two.setMonth(d2.getMonth() - 2)
		const three = new Date(d2)
		three.setMonth(d2.getMonth() - 3)

		return compareMonth(d1, one) || compareMonth(d1, two) || compareMonth(d1, three)
	}

	// const predicate = i => {

	let currentValues = Array(31).fill(0)
	let averageValues = Array(31).fill(0)

	$: currentValues = Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => (type.spend ? t.amount < 0 : type.save ? 0 < t.amount : true) && i === toDate(t.date).getDate() - 1 && compareMonth(t.date, date) && toDate(t.date).getTime() < date.getTime()))
	$: averageValues = Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => (type.spend ? t.amount < 0 : type.save ? 0 < t.amount : true) && i === toDate(t.date).getDate() - 1 && compareMonths(t.date, date) && toDate(t.date).getTime() < date.getTime()) / 3)

	$: current = currentValues.map((_, i) => type.spend
		? currentValues.slice(0, i + 1).reduce((p, c) => p - c, 0)
		: currentValues.slice(0, i + 1).reduce((p, c) => p + c, 0))
	$: average = averageValues.map((_, i) => type.spend
		? averageValues.slice(0, i + 1).reduce((p, c) => p - c, 0)
		: averageValues.slice(0, i + 1).reduce((p, c) => p + c, 0))
	$: top = max([...average, ...current])

	const y = v => {
		const multiplier = -900 / (top + 0.1) // Avoid divide by 0
		return v * multiplier
	}

	const path = (values) => {
		let string = ''
		const num = count(date) - 1
		let offset = num / 1000

		for (let i = 0; i < 31; i++) {
			const prev = clamp(i - 1, { min: 0, max: values.length - 1 })
			const clamped = clamp(i, { max: values.length - 1 })
			const p = prev / offset
			const x = clamped / offset + 5
			const v = 950 + y(values[clamped])
			const offsetp = (i === 0 || values.length <= i) ? 5 : 30
			const offsetx = (i === 0 || values.length <= i) ? 5 : -20
			string += `C${p + offsetp},${950 + y(values[prev])},${x + offsetx},${v},${x},${v}`
		}

		return string
	}

	const sort = () => {
		const ts = $links.which.transactions(t => compareMonth(t.date, date))
		if (!ts.length) return []

		return ts.filter(t => type.spend ? t.amount < 0 : type.save ? 0 < t.amount : true).toSorted((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
	}

	$: sorted = sort($links).slice(0, 5)

	$: $difference = current[date.getDate() - 1] - average[date.getDate() - 1]
	$: $value = current[date.getDate() - 1]
</script>

<main>
	<div class="label">
		<div class="left">
			<p>{new Date().getMonth() === date.getMonth() ? 'Current' : `${date.toLocaleString('default', { month: 'long' })}\'s`} {type.spend ? 'spend' : type.both ? 'budget' : 'saving'}</p>
			<h2>{$value.toFixed(2)}</h2>
		</div>
		<div class="right">
			<p><span class="value" style="color: {(type.spend ? 0 < $difference : $difference < 0) ? 'var(--text-bad)' : 'var(--text-good)'};">{Math.abs($difference).toFixed(2)}</span> {0 < $difference ? 'above' : 'below'} average</p>
		</div>
	</div>
	<div class="wrapper">
		<svg class="graph" viewBox="0 0 1010 1000" preserveAspectRatio="none">
			<path class="average" style="fill: {type.spend ? 'var(--text-bad)' : 'var(--text-good)'};" d="M5, 950 {path(average)}L1005, 950" />
			<path class="position" d="M{(date.getDate() - 1) / (count(date) - 1) * 1000 + 5}, {950 + y(current[date.getDate() - 1])} L{(date.getDate() - 1) / (count(date) - 1) * 1000 + 5}, 950" />
			<path class="current" d="M5, {950 + y(current[0])} {path(current.filter((_, i) => i <= date.getDate() - 1))}" />
			<path class="bg" d="M5, 950 L1005, 950"/>
		</svg>
	</div>
	<div class="gap" />
	{ #if height == 2 }
		<h3>Top {type.spend ? 'Expenses' : type.both ? 'Transactions' : 'Earnings'}</h3>
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