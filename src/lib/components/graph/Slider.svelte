<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { clamp } from '$lib/utils/math'

	export let current, min, max

	const value = tweened(current, {
		duration: 600,
		easing: cubicOut
	})

	$: $value = current
</script>

<main>
	<div class="bar">
		<div class="value" style="margin-bottom: calc({clamp($value, { min, max }) / (max - min) * 100 + 50}% - 0.125rem + 0.03125rem); background: {current < 0 ? 'var(--text-bad)' : current > 0 ? 'var(--text-good)' : 'white'};" />
	</div>
</main>

<style>
	main {
		flex: 1;
		flex-flow: row;
		align-items: stretch;
		justify-content: center;
	}

	.bar {
		width: 0.125rem;
		display: flex;
		flex-flow: column;
		justify-content: center;
		background: var(--text-bg);
		border-radius: 0.125rem;
		writing-mode: vertical-lr;
	}

	.value {
		min-width: 0.25rem;
		height: 0.25rem;
		margin-top: auto;
		border: 0.0625rem solid white;
		border-radius: 50%;
		box-shadow: var(--shadow-strong);
		transition: var(--transition), margin-bottom 0s;
	}
</style>