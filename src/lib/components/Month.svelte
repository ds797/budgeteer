<script>
	import Chevron from '../svg/Chevron.svelte'
	import { slide } from '$lib/utils/transition'

	export let date = new Date()
	export let set = v => {
		date.setMonth(date.getMonth() + v)
		date = date
	}

	let next, backward
</script>

<main>
	<button class="none prev" on:click={() => {
		let d = new Date(date)
		d.setMonth(date.getMonth() - 1)
		if (d.getFullYear() !== date.getFullYear()) {
			backward = 1
			next = d
		}
		set(-1)
	}}>
		<Chevron size={'1.5rem'} direction={'left'} />
	</button>
		<h2 class="month">{date.toLocaleString('default', { month: 'short' })}</h2>
	<div class="column" style="flex-flow: {backward ? 'column-reverse' : 'column'};">
		{ #if next }
			<h2 class="year" on:introend={() => next = undefined} in:slide>{next.getFullYear()}</h2>
		{ :else }
			<h2 class="year" out:slide>{date.getFullYear()}</h2>
		{ /if }
	</div>
	<button class="none next" on:click={() => {
		let d = new Date(date)
		d.setMonth(date.getMonth() + 1)
		if (d.getFullYear() !== date.getFullYear()) {
			backward = 0
			next = d
		}
		set(1)
	}}>
		<Chevron size={'1.5rem'} direction={'right'} />
	</button>
</main>

<style>
	main {
		flex: 0;
		flex-direction: row;
	}

	h2::first-letter {
		text-transform: capitalize;
	}

	.column {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.month {
		min-width: 3.5rem;
	}

	.year {
		color: var(--text-weak);
	}
</style>