<script>
	import { tweened } from 'svelte/motion'
	import { cubicOut } from 'svelte/easing'
	import { links, date } from '$lib/stores/user'
	import { month } from '$lib/utils/compare'
	import Arrow from '$lib/svg/Arrow.svelte'
	import Context from '$lib/components/element/Context.svelte'

	export let mobile = false
	export let graph = false

	let open = false

	let flow

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

	$: menu = {
		name: 'Flow',
		children: [{
			name: 'Inflow',
			type: 'value',
			value: $inflow.toFixed(2),
			color: 'var(--text-good)'
		}, {
			name: 'Outflow',
			type: 'value',
			value: $outflow.toFixed(2),
			color: 'var(--text-bad)'
		}, {
			name: 'Graph',
			type: 'toggle',
			value: graph,
			set: () => {
				graph = !graph
				open = false
			}
		}]
	}
</script>

<main>
	<div>
		<Context bind:menu bind:open on:close={e => !flow.contains(e.detail) && (open = !open)} />
		<div>
			<button bind:this={flow} class="none" on:click={() => open = !open}>
				{ #if !mobile }
					<h3 class="left">{$inflow.toFixed(2)}</h3>
				{ /if }
				<div class="down">
					<Arrow stroke={'var(--text-good)'} size={'1.5rem'} />
				</div>
				<div class="bar" />
				<div class="up">
					<Arrow stroke={'var(--text-bad)'} size={'1.5rem'} />
				</div>
				{ #if !mobile }
					<h3 class="right">{$outflow.toFixed(2)}</h3>
				{ /if }
			</button>
		</div>
	</div>
</main>

<style>
	main {
		flex-flow: column;
		align-items: stretch;
		background: var(--bg-0);
	}

	div {
		display: flex;
		justify-content: center;
		align-items: stretch;
	}

	button {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: stretch;
	}

	.bar {
		width: 0.125rem;
		margin: 0.125rem 0;
		background: var(--accent-0);
		border-radius: 0.125rem;
	}

	.up {
		transform: rotate(-90deg);
	}

	.down {
		transform: rotate(90deg);
	}

	h3 {
		min-width: 5rem;
		padding: 0 0.25rem;
	}

	h3.left { text-align: right }
	h3.right { text-align: left }
</style>