<script>
	import { createEventDispatcher } from 'svelte'
	import { fade } from 'svelte/transition'
	import { clamp } from '$lib/utils/math'

	export let chunks = {}
	export let style = ''

	const dispatch = createEventDispatcher()

	$: cx = clamp(chunks.x ?? 1, { min: 1 })
	$: cy = clamp(chunks.y ?? 1, { min: 1 })

	let hover = false
</script>

<g on:mouseleave={e => {
	hover = false
	dispatch('leave', { target: e.target })
}}>
{ #each Array.from({ length: cx }) ?? [] as _, i }
	{ @const px = i / cx * 0.95 + 0.025 + (i - cx / 2) / (cx / 2) * (1 / cx * 0.95) / 2 } 
	{ @const x = (i + 1) / cx * 0.95 + 0.025 + (i + 1 - cx / 2) / (cx / 2) * (1 / cx * 0.95) / 2 }
	{ #each Array.from({ length: cy }) ?? [] as _, j }
		{ @const py = j / cy }
		{ @const y = (j + 1) / cy }
		<path d='M{px},{py}L{x},{py}L{x},{y}L{px},{y}' on:click={e => dispatch('click', { x: i, y: j, target: e.target })} on:mouseenter={e => {
			hover = { min: px, max: x }
			dispatch('enter', { x: i, y: j, target: e.target })
		}} />
	{ /each }
{ /each }
</g>
{ #if hover }
	<path transition:fade={{ duration: 200 }} class="pointer" d="M{(hover.max - hover.min) / 2 + hover.min},0.025L{(hover.max - hover.min) / 2 + hover.min},0.975" {style} />
{ /if }

<style>
	path {
		stroke: none;
		fill: transparent;
	}

	.pointer {
		stroke-width: 0.15rem;
		stroke-linejoin: round;
		stroke-linecap: round;
		fill: none;
		stroke: transparent;
		vector-effect: non-scaling-stroke;
		pointer-events: none;
	}
</style>