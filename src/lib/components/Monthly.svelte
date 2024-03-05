<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links } from '$lib/stores/user'
	import { toDate, count } from '$lib/utils/date'
	import { clamp, min, max } from '$lib/utils/math'
	import { month as compareMonth } from '$lib/utils/compare'
	import Transaction from '$lib/components/budget/Transaction.svelte'

	// TODO: ignore hidden elements

	export let height = 2
	export let type = { spend: false }
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

	$: current = {
		positive: Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => !t.properties.hide && 0 < t.amount && i >= toDate(t.date).getDate() - 1 && compareMonth(t.date, date) && toDate(t.date).getTime() < date.getTime())),
		negative: Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => !t.properties.hide && t.amount < 0 && i >= toDate(t.date).getDate() - 1 && compareMonth(t.date, date) && toDate(t.date).getTime() < date.getTime())),
		total: Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => !t.properties.hide && i >= toDate(t.date).getDate() - 1 && compareMonth(t.date, date) && toDate(t.date).getTime() < date.getTime()))
	}
	$: average = {
		positive: Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => !t.properties.hide && 0 < t.amount && i >= toDate(t.date).getDate() - 1 && compareMonths(t.date, date) && toDate(t.date).getTime() < date.getTime()) / 3),
		negative: Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => !t.properties.hide && t.amount < 0 && i >= toDate(t.date).getDate() - 1 && compareMonths(t.date, date) && toDate(t.date).getTime() < date.getTime()) / 3),
		total: Array(count(date)).fill(undefined).map((_, i) => $links.get.sum(t => !t.properties.hide && i >= toDate(t.date).getDate() - 1 && compareMonths(t.date, date) && toDate(t.date).getTime() < date.getTime()) / 3)
	}
	$: current.type = type.both ? current.total : type.spend ? current.negative : current.positive
	$: average.type = type.both ? average.total : type.spend ? average.negative : average.positive
	$: top = type.both
		? max([max([...current.positive, ...average.positive]), Math.abs(min([...current.negative, ...average.negative]))])
		: type.spend ? Math.abs(min([...current.negative, ...average.negative])) : max([...current.positive, ...average.positive])

	const y = v => {
		const multiplier = -(type.both ? 450 : 900) / (top + 0.1) // Avoid divide by 0
		return v * multiplier + (type.both ? 500 : 950)
	}

	const path = (values) => {
		let string = ''
		const num = count(date) - 1
		let offset = num / 1000

		for (let i = 0; i < 31; i++) {
			const prev = clamp(i - 1, { min: 0, max: values.length - 1 })
			const clamped = clamp(i, { max: values.length - 1 })
			const p = prev / offset + 5
			const x = clamped / offset + 5
			const v = y(values[clamped])
			const offsetp = (i === 0 || values.length <= i) ? 0 : 25
			const offsetx = (i === 0 || values.length <= i) ? 0 : -25
			string += `C${p + offsetp},${y(values[prev])},${x + offsetx},${v},${x},${v}`
		}

		return string
	}

	const sort = () => {
		const ts = $links.which.transactions(t => compareMonth(t.date, date))
		if (!ts.length) return []

		return ts.filter(t => type.spend ? t.amount < 0 : type.save ? 0 < t.amount : true).toSorted((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
	}

	$: sorted = sort($links).slice(0, 5)

	$: $difference = Math.abs(current.type[date.getDate() - 1]) - Math.abs(average.type[date.getDate() - 1])
	$: $value = current.type[date.getDate() - 1]
</script>

<main>
	<div class="label">
		<div class="left">
			<p>{new Date().getMonth() === date.getMonth() ? 'Current' : `${date.toLocaleString('default', { month: 'long' })}\'s`} {type.spend ? 'spend' : type.both ? 'budget' : 'saving'}</p>
			<h2>{type.both ? $value.toFixed(2) : Math.abs($value).toFixed(2)}</h2>
		</div>
		<div class="right">
			<p><span class="value" style="color: {(type.spend ? 0 < $difference : $difference < 0) ? 'var(--text-bad)' : 'var(--text-good)'};">{Math.abs($difference).toFixed(2)}</span> {$difference < 0 ? 'below' : 'above'} average</p>
		</div>
	</div>
	<div class="wrapper">
		<svg class="graph" viewBox="0 0 1010 1000" preserveAspectRatio="none">
			{ #if type.both }
				<path class="average" style="fill: var(--text-good);" d="M5, 500 {path(average.total.map(v => clamp(v, { min: 0 })))}L1005, 500" />
				<path class="average" style="fill: var(--text-bad);" d="M5, 500 {path(average.total.map(v => clamp(v, { max: 0 })))}L1005, 500" />
				<path class="position" d="M{(date.getDate() - 1) / (count(date) - 1) * 1000 + 5}, {y(current.type[date.getDate() - 1])} L{(date.getDate() - 1) / (count(date) - 1) * 1000 + 5}, 500" />
				<path class="bg" d="M5, 500 L1005, 500" />
				<path class="current" d="M5, {y(current.type[0])} {path(current.type.filter((_, i) => i <= date.getDate() - 1))}" />
			{ :else }
				<path class="average" style="fill: {type.spend ? 'var(--text-bad)' : 'var(--text-good)'};" d="M5, 950 {path(average.type.map(v => Math.abs(v)))}L1005, 950" />
				<path class="position" d="M{(date.getDate() - 1) / (count(date) - 1) * 1000 + 5}, {y(Math.abs(current.type[date.getDate() - 1]))} L{(date.getDate() - 1) / (count(date) - 1) * 1000 + 5}, 950" />
				<path class="bg" d="M5, 950 L1005, 950" />
				<path class="current" d="M5, {y(Math.abs(current.type[0]))} {path(current.type.filter((_, i) => i <= date.getDate() - 1).map(v => Math.abs(v)))}" />
			{ /if }
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
		stroke-linejoin: round;
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