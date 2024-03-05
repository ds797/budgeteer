<script>
	import { min, max, clamp } from '$lib/utils/math'

	export let values = []
	export let high = undefined
	export let pad = undefined
	export let blanks = false
	export let center = 0
	export let multiplier = 1
	export let style = ''

	let path = ''
	$: maximum = high ?? (max([Math.abs(max(values)), Math.abs(min(values))]) || 1)
	$: path = Array.from({ ...values, length: clamp(pad ?? values.length, { min: 2 }) })
		.map((v, i) => `L${clamp(i, { max: clamp(values.length - 1, { min: 1 }) }) / clamp(max([values.length, blanks ? pad : 0]) - 1, { min: 1 }) * 0.95 + 0.025},${1 - (v ?? values[values.length - 1] ?? 0) * multiplier / maximum * 0.95 * min([center, 1 - center]) - 0.025 - center}`).join()
</script>

<path d='M0.025,{1 - (values[0] ?? 0) * multiplier / maximum * 0.95 * min([center, 1 - center]) - 0.025 - center}{path}' {style} />

<style>
	path {
		stroke-width: 0.15rem;
		stroke-linejoin: round;
		stroke-linecap: round;
		fill: none;
		stroke: black;
		vector-effect: non-scaling-stroke;
	}
</style>