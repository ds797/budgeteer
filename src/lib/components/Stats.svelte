<!-- <script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { budgets } from '$lib/stores/user'
	import { money } from '$lib/utils/string'

	const inflow = tweened(0, {
		duration: 600,
		easing: cubicOut
	})
	const outflow = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const update = () => {
		let inf = 0
		let outf = 0

		for (const t of $budgets.selected.transactions().flat()) {
			if (t.budgets[$budgets.selected.name].hide) continue

			if (t.amount < 0) outf -= t.amount
			else inf += t.amount
		}

		$inflow = inf
		$outflow = outf
	}

	$: update($budgets.selected)
</script>

<main>
	<h2 class="good">+ ${money($inflow)}</h2>
	<h2 class="bad">- ${money($outflow)}</h2>
</main>

<style>
	h2 {
		margin-left: 1rem;
		align-self: flex-start;
		text-shadow: var(--shadow);
	}
</style> -->