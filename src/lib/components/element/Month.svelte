<script>
	import Chevron from '$lib/components/svg/Chevron.svelte'
	import { slide } from '$lib/utils/transition'

	export let date = new Date()
	export let max = undefined
	export let set = v => {
		date.setMonth(date.getMonth() + v)
		date = date
	}
	export let color = 'black', bg = 'darkgray'

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
		<Chevron size={'1.5rem'} direction={'left'} {color} />
	</button>
		<h3 class="month" style="color: {color};">{date.toLocaleString('default', { month: 'short' })}</h3>
		<div class="column" style="flex-flow: {backward ? 'column-reverse' : 'column'};">
		{ #if next }
			<h3 class="year" style="color: {bg};" on:introend={() => next = undefined} in:slide>{next.getFullYear()}</h3>
		{ :else }
			<h3 class="year" style="color: {bg};" out:slide>{date.getFullYear()}</h3>
		{ /if }
	</div>
	<button class="none next" class:disabled={max && max.getFullYear() <= date.getFullYear() && max.getMonth() <= date.getMonth()} on:click={() => {
		let d = new Date(date)
		d.setMonth(date.getMonth() + 1)
		if (d.getFullYear() !== date.getFullYear()) {
			backward = 0
			next = d
		}
		set(1)
	}}>
		<Chevron size={'1.5rem'} direction={'right'} color={(max && max.getFullYear() <= date.getFullYear() && max.getMonth() <= date.getMonth()) ? 'var(--text-bg)' : color} />
	</button>
</main>

<style>
	main {
		flex: 0;
		flex-direction: row;
	}

	h3::first-letter {
		text-transform: capitalize;
	}

	button.disabled {
		background: none;
	}

	.column {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.month {
		min-width: 2.75rem;
	}

	.year {
		color: var(--text-weak);
	}
</style>