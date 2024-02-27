<script>
	import { createEventDispatcher } from 'svelte'
	import { backOut } from 'svelte/easing'
	import { outside } from '$lib/utils/use'
	import { slide } from '$lib/utils/transition'
	import Checkbox from '$lib/components/element/Checkbox.svelte'
	import Date from '$lib/components/element/Date.svelte'

	export let menu = {}
	export let open = false
	export let offset = 1

	let show = -1

	let dispatch = createEventDispatcher()

	const scale = (node, { delay = 0, duration = 350, easing = backOut, start = 0.3, opacity = 0 } = {}) => {
		const style = getComputedStyle(node)
		const target_opacity = +style.opacity
		const transform = style.transform === 'none' ? '' : style.transform
		const sd = 1 - start
		const od = target_opacity * (1 - opacity)
		return {
			delay,
			duration,
			easing,
			css: (_t, u) => `
				transform: ${transform} scale(${1 - sd * u});
				opacity: ${target_opacity - od * u};
				filter: blur(${u * 0.25}rem);
			`
		}
	}

	let height, width
	let tip = { x: null, y: null }
	let anchor = { x: 0, y: 0 }

	let node

	const calc = () => {
		const parent = node?.parentNode
		if (!parent) return

		const r = parent.getBoundingClientRect()
		const x = r.x + r.width / 2
		const y = r.y + r.height / 2

		anchor = {
			y: Math.floor(x / (width / 3)) - 1
		}
		switch (Math.floor(x / (width / 4))) {
			case 0:
				anchor.x = -1
				break
			case 1:
			case 2:
				anchor.x = 0
				break
			case 3:
				anchor.x = 1
		}
		switch (Math.floor(y / (height / 4))) {
			case 0:
				anchor.y = -1
				break
			case 1:
			case 2:
				anchor.y = 0
				break
			case 3:
				anchor.y = 1
		}
		if (anchor.x === 0 && anchor.y === 0) anchor.y = -1 // Middle

		switch (anchor.x) {
			case -1:
				tip.x = r.x
				break
			case 0:
				tip.x = x
				break
			case 1:
				tip.x = r.x + r.width
				break
		}
		switch (anchor.y) {
			case -1:
				tip.y = r.y + r.height
				break
			case 0:
				tip.y = y
				break
			case 1:
				tip.y = r.y
				break
		}
	}

	$: calc(width, height)
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<div class="invisible" bind:this={node} />
{ #if open }
	<main style="
		top: {tip.y === null ? '50%' : `calc(${tip.y}px - ${anchor.y * offset}rem)`};
		left: {tip.x === null ? '50%' : `calc(${tip.x}px + ${anchor.x * offset}rem)`};
		transform-origin: {anchor.y === 1 ? 'bottom' : anchor.y === 0 ? 'center' : 'top'} {anchor.x === 1 ? 'right' : anchor.x === 0 ? 'center' : 'left'};
		transform: translate({(anchor.x - 1) * 50}%, {(anchor.y + 1) * 50}%);" use:outside on:outside={e => {
		show = -1
		dispatch('close', e.detail.target)
	}} transition:scale>
		{ #each (menu?.children ?? []) as child, index }
			{ #if show === -1 || show === index }
				{ #if show === -1 && index !== 0 }
					<div class="bar" transition:slide />
				{ /if }
				<div class="child" transition:slide>
					{ #if child.type === 'action' }
						<button on:click={child.click}>{child.name}</button>
					{ :else if child.type === 'value' }
						<div class="left">
							<p>{child.name}</p>
						</div>
						<div class="right value" style="{child.color && `color: ${child.color};`}">
							<p>{child.value}</p>
						</div>
					{ :else if child.type === 'toggle' }
						<div class="left">
							<p>{child.name}</p>
						</div>
						<div class="right">
							<Checkbox size={'1rem'} fg='var(--accent-0)' bg='var(--bg-1)' value={child.value} set={child.set} />
						</div>
					{ :else if child.type === 'date' }
						<div class="more">
							<button on:click={() => show === index ? show = -1 : show = index}>
								<div class="left">
									<p>{child.name}</p>	
								</div>
								<div class="right value">
									<p>{child.value ? child.value.toLocaleDateString(undefined, {
										day: '2-digit',
										month: '2-digit',
										year: '2-digit'
									}) : ''}</p>
								</div>
							</button>
							{ #if show === index }
								<div class="bar" />
								<div class="center">
									<div transition:slide={{ axis: 'both', duration: 5000 }}>
										<Date max={child.max} value={child.value} set={v => {
											child.set(v)
											show = -1
										}} style={{
											day: 'padding: 0.125rem 0.25rem; font-weight: normal; border: 0.1rem solid var(--accent-0);'
										}} />
									</div>
								</div>
							{ /if }
						</div>
					{ :else }
						<p>{child.name}</p>
					{ /if }
				</div>
			{ /if }
		{ /each }
	</main>
{ /if }

<style>
	main {
		position: fixed;
		width: auto;
		padding: 0.125rem 0;
		background: var(--accent-0-light);
		border-radius: 0.5rem;
		align-items: stretch;
		box-shadow: var(--shadow);
		backdrop-filter: blur(0.75rem);
		z-index: 1002;
	}

	button {
		flex: 1;
		margin: 0;
		padding: 0;
		border: none;
		display: flex;
		align-items: stretch;
		gap: 1rem;
		font-weight: normal;
	}

	button:hover, button:focus {
		transform: none;
		box-shadow: none;
	}

	.invisible { display: none }

	.bar {
		flex: 1;
		min-height: 0.0625rem;
		max-height: 0.0625rem;
		background: var(--accent-0-light);
	}

	.child {
		display: flex;
		gap: 1rem;
	}

	.child .left, .child .right {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.child .left {
		padding: 0.0625rem 0.5rem;
		justify-content: flex-start;
	}
	.child .right {
		padding: 0.0625rem 0.5rem;
		justify-content: flex-end;
	}

	.right.value { font-weight: bold }

	.child .more {
		flex: 1;
		display: flex;
		flex-flow: column;
		align-items: stretch;
	}

	.more button {
		flex: 0;
	}

	.center {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>