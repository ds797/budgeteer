<script>
	import { cubicOut } from 'svelte/easing'
	import { tweened } from 'svelte/motion'
	import { clamp } from '$lib/utils/math'

	export let max = 1, value = 0
	export let vertical = false
	export let gradient = ['black']

	const current = tweened(value, {
		easing: cubicOut,
		duration: 500
	})

	const maximum = tweened(value, {
		easing: cubicOut,
		duration: 500
	})

	$: $maximum = max
	$: $current = clamp(value, { min: 0, max })
</script>

<main class:vertical={vertical} style="{vertical ? 'width' : 'height'}: {0 < max ? '0.5rem' : '0.125rem'};">
	{ #if 0 < max }
		<div style='{vertical ? 'bottom' : 'left'}: 0; {vertical ? 'width' : 'height'}: 100%; {vertical ? 'height' : 'width'}: {$current / $maximum * 100}%; background: {gradient[Math.floor(clamp($current / $maximum, { max: 1 - Number.EPSILON }) * gradient.length)]};' />
	{ /if }
</main>

<style>
	main {
		flex: 1;
		position: relative;
		min-width: 3rem;
		width: 100%;
		height: 0.5rem;
		flex-flow: row;
		align-items: stretch;
		background: var(--text-bg);
		border-radius: 1rem;
	}

	div {
		position: absolute;
		border-radius: 1rem;
	}

	.vertical {
		min-width: unset;
		min-height: 3rem;
		height: 100%;
		width: 0.5rem;
	}
</style>