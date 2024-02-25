<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links, date } from '$lib/stores/user'
	import { month } from '$lib/utils/compare'
	import Arrow from '$lib/svg/Arrow.svelte'

	export let show = false

	const inflow = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	const outflow = tweened(0, {
		duration: 600,
		easing: cubicOut
	})

	$: $inflow = $links.get.sum(t => !t.properties.hide && t.amount > 0 && month(t.date, $date))
	$: $outflow = $links.get.sum(t => !t.properties.hide && t.amount < 0 && month(t.date, $date))
</script>

<main>
	<button class="none" on:click={() => show = !show}>
		<div class="in">
			<h1>{parseFloat($inflow).toFixed(2)}</h1>
			<div class="down">
				<Arrow stroke={'var(--text-good)'} size={'1.5rem'} />
			</div>
		</div>
		<div class="bar" />
		<div class="out">
			<div class="up">
				<Arrow stroke={'var(--text-bad)'} size={'1.5rem'} />
			</div>
			<h1>{parseFloat(-$outflow).toFixed(2)}</h1>
		</div>
	</button>
</main>

<style>
	main {
		flex-flow: column;
		align-items: stretch;
		background: var(--bg-0);
	}

	.navbar {
		height: 4rem;
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
	}

	.left, .right {
		flex: 1;
	}

	.middle {
		flex: 2;
		display: flex;
	}

	button {
		display: flex;
		justify-content: stretch;
		align-items: stretch;
	}

	.middle > button {
		flex: 1;
	}

	.left {
		padding-left: 0.5rem;
		display: flex;
		justify-content: flex-start;
		align-items: center;
	}

	.right {
		padding-right: 0.5rem;
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.in, .out {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.in {
		justify-content: flex-end;
	}

	.out {
		justify-content: flex-start;
	}

	.bar {
		width: 0.125rem;
		margin: 0.5rem 0;
		background: black;
		border-radius: 0.125rem;
	}

	.up {
		transform: rotate(-90deg);
	}

	.down {
		transform: rotate(90deg);
	}
</style>