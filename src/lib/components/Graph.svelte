<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links, date } from '$lib/stores/user'
	import { toDate } from '$lib/utils/convert'
	import { min, max } from '$lib/utils/math'
	import { month } from '$lib/utils/compare'

	let values = tweened(Array(31).fill(0), {
		duration: 600,
		easing: cubicOut
	})

	$: array = Array(31).fill(undefined).map((_, i) => $links.get.sum(t => month(t.date, $date) && toDate(t.date).getDate() === i + 1))

	$: $values = array.map((_, i) => array.slice(0, i).reduce((p, c) => p + c, 0))

	const path = () => {
		let string = ''
		let low = Math.abs(min($values))
		let high = Math.abs(max($values))
		if (low > high) high = low
		let offset = 510
		let multiplier = offset - 10

		$values.forEach((v, i) => {
			let x = i * 10
			let y = -v / (high + 0.1) * multiplier
			string += `S${x - 7} ${y + offset}, ${x}, ${y + offset} `
		})
		return string
	}

	let width = 1
	let position = 0

	const move = e => position = Math.floor(e.x / (width / 31))
	const leave = () => position = 30

	const value = tweened($values[position] ?? 0, {
		duration: 200,
		easing: cubicOut
	})

	$: $value = $values[position] ?? $value
</script>

<main bind:clientWidth={width}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<svg viewBox="0 0 300 1020" preserveAspectRatio="none" on:mousemove={move} on:mouseleave={leave} on:mousedown={move}>
		<path class="bg" d="M0, 10 L300, 10"/>
		<path class="fg" d="M0, 510 {path($values)}" />
		<path class="bg" d="M0, 510 L300, 510"/>
		<path class="bg" d="M0, 1010 L300, 1010"/>
	</svg>
	<div class="tooltip">
		<h3 style="color: {($values[position] ?? $value) < 0 ? 'var(--text-bad)' : 'var(--text-good)'};">{$value.toFixed(2)}</h3>
	</div>
</main>

<style>
	main {
		height: 10rem;
		box-sizing: border-box;
		justify-content: stretch;
		align-items: stretch;
		background: var(--bg-0);
	}

	.tooltip {
		padding: 0.25rem;
		display: flex;
		justify-content: center;
	}

	svg {
		transition: all 0.4s ease-out;
	}

	path {
		fill: none;
		stroke-width: 2px;
		stroke-linecap: round;
		stroke-dashoffset: -50%;
		vector-effect: non-scaling-stroke;
	}

	.bg {
		stroke: var(--text-bg);
	}

	.fg {
		stroke: var(--text-weak);
	}
</style>