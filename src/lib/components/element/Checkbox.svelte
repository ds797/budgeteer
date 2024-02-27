<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'

	export let size = '2rem', fg = 'black', bg = 'none'
	export let value = false
	export let set = v => v

	const no = {
		one: [4, 4, 20, 20],
		two: [20, 4, 4, 20]
	}
	const yes = {
		one: [4, 14, 8, 18],
		two: [20, 6, 8, 18]
	}

	let one = no.one
	let two = no.two

	$: if (value) {
		one = yes.one
		two = yes.two
	} else {
		one = no.one
		two = no.two
	}
</script>

<main style="width: {size}; height: {size}; background: {value ? fg : 'none'}; border: 0.1rem solid {fg};">
	<button class="none" on:click={() => set(!value)}>
		<svg viewBox="0 0 24 24" fill="none" stroke={value ? bg : fg}>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M{one[0]} {one[1]}L{one[2]} {one[3]}"></path>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M{two[0]} {two[1]}L{two[2]} {two[3]}"></path>
		</svg>
	</button>
</main>

<style>
	main {
		padding: 0.0625rem;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
		border-radius: 0.25rem;
	}

	button {
		margin: 0;
		padding: 0;
		border: none;
	}

	button:hover {
		transform: none;
	}
</style>