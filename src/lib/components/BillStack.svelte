<script>
	import { onMount } from 'svelte'
	import { fly } from 'svelte/transition'
	import Bill from '$lib/components/svg/Bill.svelte'

	let bills = Array(50).fill(undefined).map(() => {
		return {}
	})

	onMount(() => {
		setInterval(() => {
			bills.pop()
			bills = [{}, ...bills]
		}, 1000)
	})
</script>

<main>
	{ #each bills as _, i (bills[bills.length - 1 - i]) }
		<div style="bottom: {(i - 5) * 10}px;" in:fly={{ y: -200, duration: 1000 }}>
			<Bill size={'5rem'} />
		</div>
	{ /each }
</main>

<style>
	main {
		padding: 2rem;
		display: flex;
		flex-flow: column;
		align-items: flex-end;
	}

	div {
		position: absolute;
		transition: all 1s linear;
	}
</style>