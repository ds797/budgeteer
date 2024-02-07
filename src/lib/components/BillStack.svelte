<script>
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import Stack from '$lib/svg/Stack.svelte'

	let bills = Array(50).fill(undefined).map(() => {
		return {}
	})

	onMount(() => {
		setInterval(() => {
			bills.shift()
			bills = [...bills, {}]
		}, 1000)
	})
</script>

<main>
	{ #each bills as b, i (b) }
			<div style="top: {(i - 5) * 10}px;" in:fly={{ y: 200, duration: 1000 }}>
				<Stack size={'5rem'} />
			</div>
	{ /each }
</main>

<style>
	main {
		/* align-self: flex-start; */
		display: block;
		overflow: hidden;
		transform: scaleY(-1);
	}

	div {
		position: absolute;
		right: 2rem;
		transition: all 1s linear;
	}
</style>