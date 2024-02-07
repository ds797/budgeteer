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
</script>

<main>
	<svg viewBox="0 0 300 1020" preserveAspectRatio="none">
		<path class="bg" d="M0, 10 L300, 10"/>
		<path class="fg" d="M0, 510 {path($values)}" />
		<path class="bg" d="M0, 510 L300, 510"/>
		<path class="bg" d="M0, 1010 L300, 1010"/>
	</svg>
</main>

<style>
	main {
		height: 10rem;
		box-sizing: border-box;
		justify-content: stretch;
		align-items: stretch;
		background: var(--bg-0);
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

	.graph {
		flex: 1;
		display: flex;
		justify-content: space-around;
	}

	/* svg {
		flex: 0.5;
	} */

	.labels {
		display: flex;
		justify-content: stretch;
	}

	.labels > p {
		flex: 1;
		font-size: 0.5rem;
		display: flex;
		justify-content: center;
		color: var(--text-weak);
	}
</style>