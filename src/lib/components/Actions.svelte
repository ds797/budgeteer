<script>
	import { tick } from 'svelte'
	import { quintOut } from 'svelte/easing'
	import { route, notifications } from '$lib/stores/ui'
	import Sparkle from '$lib/svg/Sparkle.svelte'
	import Budget from '$lib/svg/Budget.svelte'
	import Link from '$lib/svg/Link.svelte'
	import Menu from '$lib/svg/Menu.svelte'

	export let demo = false

	let state = true

	const split = value => {
		const split = typeof value === 'string' && value.match(/^\s*(-?[\d.]+)([^\s]*)\s*$/)
		return split ? [parseFloat(split[1]), split[2] || 'px'] : [value, 'px']
	}

	const pop = (node, { delay = 0, duration = 400, easing = quintOut, x = 0, y = 20, opacity = 0, start = 0.8 } = {}) => {
		const style = getComputedStyle(node)
		const target_opacity = +style.opacity
		const transform = style.transform === 'none' ? '' : style.transform
		const sd = 1 - start
		const od = target_opacity * (1 - opacity)
		const [x_value, x_unit] = split(x)
		const [y_value, y_unit] = split(y)
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
				transform: ${transform} translate(${(1 - t) * x_value}${x_unit}, ${(1 - t) * y_value}${y_unit}) scale(${1 - sd * u});
				opacity: ${target_opacity - od * u}`
		}
	}
</script>

<main>
	{ #if state }
		<div class="ai" transition:pop={{ y: 45 }}>
			<button class="none" on:click={async () => {
				if (state) {
					$route.current = { assistant: true }
					await tick()
					window.getSelection().removeAllRanges()
					state = false
				} else state = !state
			}}>
				<Sparkle size={'1.5rem'} color={'var(--bg-1)'} />
			</button>
		</div>
		<div class="budgets" transition:pop={{ y: 30 }}>
			<button class="none" on:click={async () => {
				if (state) {
					$route.current = $route.choose.budget
					await tick()
					window.getSelection().removeAllRanges()
					state = false
				} else state = !state
			}}>
				<Budget size={'1.5rem'} color={'var(--bg-1)'} />
			</button>
		</div>
		<div class="links" transition:pop={{ y: 15 }}>
			<button class="none" on:click={async () => {
				if (state) {
					$route.current = $route.links
					await tick()
					window.getSelection().removeAllRanges()
					state = false
				} else state = !state
			}}>
				<Link size={'1.5rem'} color={'var(--bg-1)'} />
			</button>
		</div>
	{ /if }
	<div class="menu">
		<button class="none" on:click={async () => {
			if (state) {
				if (demo) {
					notifications.add({ type: 'error', message: 'Join Budgeteer to add custom transactions!' })
					return
				} else {
					$route.state.transaction = { properties: {} }
					$route.state.transaction.new = structuredClone($route.state.transaction)
					$route.state.choose.category = $route.state.transaction.new.properties
					$route.state.choose.account = $route.state.transaction.new
					$route.current = $route.transaction
					$route.current = $route.transaction

					await tick()
					window.getSelection().removeAllRanges()
				}
			}

			state = !state
		}}>
			<Menu size={'1.5rem'} color={'var(--bg-1)'} open={state} />
		</button>
	</div>
</main>

<style>
	* {
		transition: all 0.3s cubic-bezier(0, 0.5, 0.5, 1);
	}

	main {
		gap: 0.5rem;
		flex-flow: column;
	}

	div {
		min-width: 2.5rem;
		height: 2.5rem;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
		background: var(--accent-0);
		border-radius: 0.5rem;
		box-shadow: var(--shadow-strong);
	}

	.menu {
		box-shadow: var(--shadow-stronger);
	}

	button {
		flex: 1;
		margin: 0;
		padding: 0;
		transform: none;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button:hover {
		transform: translateY(-0.06125rem);
	}
</style>