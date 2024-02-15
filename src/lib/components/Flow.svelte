<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links, date } from '$lib/stores/user'
	import { route } from '$lib/stores/ui'
	import { month } from '$lib/utils/compare'
	import { slide } from '$lib/utils/transition'
	import Month from '$lib/components/Month.svelte'
	import Graph from '$lib/components/Graph.svelte'
	import Arrow from '$lib/svg/Arrow.svelte'
	import Sparkle from '$lib/svg/Sparkle.svelte'

	let show = false

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
	<div class="left">
		<Month date={$date} set={v => {
			$date.setMonth($date.getMonth() + v)
			$date = $date
			$links = $links
		}} />
	</div>
	<div class="middle">
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
	</div>
	<div class="right">
		<button class="none" on:click={() => $route.current = { assistant: true }}>
			<Sparkle />
		</button>
	</div>
</main>
{ #if show }
	<div class="graph" transition:slide={{ duration: 600 }}>
		<Graph />
	</div>
{ /if }

<style>
	main {
		height: 4rem;
		flex-flow: row;
		align-items: stretch;
		gap: 0.5rem;
		background: var(--bg-0);
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

	.graph {
		display: flex;
		justify-content: stretch;
		align-items: stretch;
	}
</style>