<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { fade } from 'svelte/transition'
	import { clamp } from '$lib/utils/math'

	export let min, max, current, next, show = true

	const y1 = tweened(current, {
		duration: 600,
		easing: cubicOut
	})

	const y2 = tweened(next, {
		duration: 600,
		easing: cubicOut
	})

	$: $y1 = current
	$: $y2 = next
</script>

<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="opacity: {show && current !== next ? '1' : '0'};">
	<!-- { #if show && current !== next } -->
		<!-- <defs>
			<linearGradient gradientUnits="userSpaceOnUse" id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
				<stop offset="0%" style="stop-color: var(--text-bg); stop-opacity: 1;" />
				<stop offset="100%" style="stop-color: var(--text-bg); stop-opacity: 1;" />
			</linearGradient>
		</defs> -->
		<line stroke="url(#grad1)" x1="0" y1="{-clamp($y1, { min, max }) / (max - min) * 100 + 50 - 1}" x2="100" y2="{-clamp($y2, { min, max }) / (max - min) * 100 + 50 - 1}" vector-effect="non-scaling-stroke" />
	<!-- { /if } -->
</svg>

<style>
	svg {
		z-index: -1;
		transition: all 0.4s ease-out;
	}

	line {
		stroke: var(--text-bg);
		stroke-width: 2px;
		stroke-linecap: round;
		stroke-dashoffset: -50%;
	}
</style>