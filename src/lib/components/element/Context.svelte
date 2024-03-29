<script>
	import { createEventDispatcher, onMount } from 'svelte'
	import { cubicOut, backOut } from 'svelte/easing'
	import { outside } from '$lib/utils/use'
	import { slide } from '$lib/utils/transition'
	import { scroll } from '$lib/utils/use'
	import Checkbox from '$lib/components/element/Checkbox.svelte'
	import Date from '$lib/components/element/Date.svelte'

	export let menu = {}
	export let open = false
	export let wide = 0
	export let tall = 0

	let show = -1

	let dispatch = createEventDispatcher()

	let node, context

	$: parent = (node && node.parentNode) ?? {}

	const calc = () => {
		let x = 0
		let y = 0
		if (width < (node?.getBoundingClientRect().x ?? 0) + (context ?? {}).offsetWidth / 2)
			x = -1
		else if ((node?.getBoundingClientRect().x ?? 0) + (context ?? {}).offsetWidth / 2 < 0)
			x = 1
		if (height < (node?.getBoundingClientRect().y ?? 0) + (context ?? {}).offsetHeight)
			y = -1
		return `translateX(calc(${x * 50 - 50}% + ${x * wide}px)) translateY(calc(${y * 100}% + ${y * tall}px))`
	}

	$: transform = calc(width, height, parent)

	const scale = (node, { delay = 0, duration = 350, easing = backOut, start = 0.3, opacity = 0 } = {}) => {
		const style = getComputedStyle(node)
		const target_opacity = +style.opacity
		const sd = 1 - start
		const od = target_opacity * (1 - opacity)
		return {
			delay,
			duration,
			easing,
			css: (_t, u) => `
				transform: ${transform} scale(${1 - sd * u});
				opacity: ${target_opacity - od * u};
				// filter: blur(${u * 0.25}rem);
			`
		}
	}

	const tween = (node, { delay = 0, duration = 2000, easing = cubicOut, start = 0.3, opacity = 0 } = {}) => {
		node.style.maxWidth = '0px'
		console.log(node.getBoundingClientRect().width, node.parentNode.getBoundingClientRect().width)
		const initial = node.parentNode.getBoundingClientRect().width
		node.style.maxWidth = ''
		const final = parseFloat(getComputedStyle(node.parentNode).width)
		const style = getComputedStyle(node)
		const height = parseFloat(style.height)
		const target_opacity = +style.opacity
		const sd = 1 - start
		const od = target_opacity * (1 - opacity)
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
				width: ${t * (final - initial) + initial}px;
				height: ${t * height}px;
				// transform: ${transform} scale(${1 - sd * u});
			`,
			// Cleanup function
			tick: t => (node.style.maxWidth = '')
		}
	}

	let height, width

	const key = e => {
		if (e.key !== 'Escape') return

		e.stopPropagation()
		dispatch('close')
	}

	const change = e => {
		position = e.detail
		if (open) dispatch('close')
	}

	let position = { x: 0, y: 0 }
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} on:keydown={key} on:scroll={scroll} />

<div class="wrap" bind:this={node} use:scroll on:change={change}>
	{ #key open }
		<main bind:this={context} style="
			opacity: {open ? 100 : 0}%;
			pointer-events: {open ? 'all' : 'none'};
			top: {node?.getBoundingClientRect().y ?? 0 - position.y}px;
			left: {node?.innerWidth + position.x}px;
			transform: {transform};"
		use:outside on:outside={e => {
			if (!open) return
			show = -1
			dispatch('close', e.detail.target)
		}} transition:scale>
			<div class="name">
				<p class="bold" style="{menu.width ? `min-width: ${menu.width};` : ''}">{menu.name}</p>
			</div>
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
						{ :else if child.type === 'value-reverse' }
							<div class="left value" style="{child.color && `color: ${child.color};`}">
								<p>{child.value}</p>
							</div>
							<div class="right">
								<p>{child.name}</p>
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
										<div style="opacity: 0;" transition:tween>
											<Date max={child.max} value={child.value} set={v => {
												child.set(v)
												show = -1
											}} style={{
												day: 'padding: 0.125rem 0.25rem; font-weight: normal; border: none;'
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
	{ /key }
</div>

<style>
	* {
		transition: color 0.1s ease-out;
	}

	.wrap {
		justify-self: center;
		align-self: center;
		max-width: 0;
		max-height: 0;
		position: relative;
	}

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
		transition: top 0s, left 0s;
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

	.name {
		padding: 0.125rem 0.375rem;
	}

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
		white-space: nowrap;
	}

	.child .left {
		padding: 0.0625rem 0 0 0.5rem;
		justify-content: flex-start;
	}
	.child .right {
		padding: 0.0625rem 0.5rem 0 0;
		justify-content: flex-end;
	}

	.value { font-weight: bold }

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