<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut, quintOut } from 'svelte/easing'
	import { links } from '$lib/stores/user'
	import { month as currentMonth } from '$lib/utils/compare'
	import { toDate, count } from '$lib/utils/date'
	import { max } from '$lib/utils/math'
	import Arrow from '$lib/components/svg/Arrow.svelte'
	import Context from '$lib/components/element/Context.svelte'
	import Graph from '$lib/components/chart/Graph.svelte'
	import Gradient from '$lib/components/chart/Gradient.svelte'
	import Line from '$lib/components/chart/Line.svelte'
	import Grid from '$lib/components/chart/Grid.svelte'

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

	const current = tweened(0, {
		duration: 600,
		easing: cubicOut
	})
	const previous = tweened(0, {
		duration: 600,
		easing: cubicOut
	})
	const percent = tweened(0, {
		duration: 600,
		easing: cubicOut
	})
	const smooth = tweened(0, {
		duration: 200,
		easing: quintOut
	})
	let hover = 0

	let spending = {}

	$: spending.current = $links.get.sum(t => t.amount < 0 && currentMonth(t.date, date))
	$: spending.previous = $links.get.sum(t => t.amount < 0 && currentMonth(t.date, new Date(new Date(date).setMonth(date.getMonth() - 1))))
	$: $current = Math.abs(spending.current)
	$: $previous = Math.abs(spending.previous)

	$: difference = spending.previous ? Math.abs(spending.current) - Math.abs(spending.previous) : 0
	$: $percent = Math.abs((spending.previous ? Math.abs(spending.current) - Math.abs(spending.previous) : 0) / (spending.previous || Infinity) * 100)

	let node
	let open = false

	$: menu = {
		name: 'Spending',
		children: [{
			name: 'This month',
			type: 'value',
			value: $current.toFixed(2),
			color: 0 < difference ? 'var(--text-bad)' : difference < 0 ? 'var(--text-good)' : ''
		}, {
			name: 'Last month',
			type: 'value',
			value: $previous.toFixed(2)
		}]
	}

	// TODO: Add "budget" so that Glance compares to spending goal
	// TODO: Glance doesn't show for first month of data?
	let budget = 1000
	let info = {
		open: false,
		detail: {
			width: '8.5rem',
			children: [{
				name: 'below avg',
				type: 'value-reverse',
				value: Math.abs($smooth).toFixed(2),
				color: 'var(--text-bad)'
			}, {
				name: 'Average',
				type: 'value',
				value: (budget / count(date)).toFixed(2)
			}]
		}
	}
	$: info.detail.children[0].value = Math.abs($smooth).toFixed(2)
	$: info.detail.children[0].name = `${0 < $smooth ? 'above' : 'below'} avg`
	$: info.detail.children[0].color = 0 < hover ? 'var(--text-bad)' : hover < 0 ? 'var(--text-good)' : ''
	$: info.detail.children[1].value = (budget / count(date)).toFixed(2)

	$: $smooth = hover

	const click = ({ detail: { x, target } }, click = false) => {
		if (open) return

		if (info.click && !click) return

		if (date.getDate() - 1 < x) {
			if (!info.click) {
				info.which = undefined
				info.open = false
			}
			return
		}
		if (click && info.click && info.which === x) {
			info.which = undefined
			info.click = false
			info.open = false
			return
		}

		info.detail.name = `${date.toLocaleString('default', { month: 'long' })} ${x + 1}`
		hover = detail[x]
		info.target = target
		info.which = x
		if (click) info.click = true
		info.open = true
	}
	const leave = click => {
		if (!info.click || click) {
			info.target = undefined
			info.click = false
			info.which = undefined
			info.open = false
		}
	}

	$: detail = Array.from({ length: date.getDate() }).map((_, i) => -(budget / count(date) + $links.get.sum(t => !t.properties.hide && t.amount < 0 && i === toDate(t.date).getDate() - 1 && currentMonth(t.date, date) && toDate(t.date).getTime() < date.getTime())))
</script>

<main>
	<div class="spending">
		<div class="overview">
			<button class="none nohover" on:click={() => open = !open} bind:this={node}>
				<h2>{$current.toFixed(2)}</h2>
				<div class="percent" style="background: {0 < difference ? 'var(--bad-light)' : difference < 0 ? 'var(--good-light)' : 'var(--text-bg)'};">
					<p style="color: {0 < difference ? 'var(--bad)' : difference < 0 ? 'var(--text-good)' : 'var(--text-weak)'};">{Math.abs($percent).toFixed(2)}%</p>
					<div style="transform: rotate({0 < difference ? '-45deg' : difference < 0 ? '45deg' : '0deg'}){difference === 0 ? ' scale(0.9)' : ''};">
						<Arrow size={'1.75rem'} stroke={0 < difference ? 'var(--bad)' : difference < 0 ? 'var(--good)' : 'var(--text-weak)'} />
					</div>
				</div>
			</button>
			<Context bind:menu bind:open on:close={e => (e && !node.contains(e.detail)) && (open = false)} />
		</div>
	</div>
	<div class="graph">
		<Graph>
			<Gradient name={'test'} />
			<Line values={[0]} center={0.5} style={'stroke: var(--text-bg); stroke-dasharray: 5 7;'} />
			<Line values={detail} pad={31} blanks={date.getMonth() === new Date().getMonth() ? true : false} center={0.5} multiplier={0.5} style={'stroke: url(#test);'} />
			<Grid chunks={{ x: count(date) }} style={'stroke: var(--text-bg); stroke-dasharray: 5 7;'} on:enter={click} on:leave={() => leave()} on:click={e => click(e, true)} />
		</Graph>
		<Context bind:menu={info.detail} bind:open={info.open} on:close={e => (e && info.target && info.target !== e.detail) && leave(true)} />
	</div>
</main>

<style>
	main {
		align-items: stretch;
	}

	p {
		font-size: 1.125rem;
		font-weight: 500;
	}

	.spending {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.overview {
		width: 12.5rem;
		display: flex;
		flex-flow: column;
		align-items: center;
	}

	.spending button {
		flex: 1;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.spending button:hover h2 {
		text-shadow: var(--shadow);
	}

	.percent {
		padding-left: 0.375rem;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
		border-radius: 0.25rem;
	}

	.percent p {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.percent div {
		transition: transform 0.4s cubic-bezier(0, 0.5, 0.25, 1.25);
	}

	.graph {
		height: 5rem;
		display: flex;
		flex-flow: column;
		justify-content: stretch;
		gap: 0.25rem;
	}
</style>