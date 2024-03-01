<script>
	import { tick } from 'svelte'
	import { quintOut } from 'svelte/easing'
	import { scale } from 'svelte/transition'
	import { links, date } from '$lib/stores/user'
	import { route, notifications } from '$lib/stores/ui'
	import { outside } from '$lib/utils/use'
	import Crossfade from '$lib/components/element/Crossfade.svelte'
	import Month from '$lib/components/element/Month.svelte'
	import Calendar from '$lib/components/svg/Calendar.svelte'
	import Sparkle from '$lib/components/svg/Sparkle.svelte'
	import Budget from '$lib/components/svg/Budget.svelte'
	import Link from '$lib/components/svg/Link.svelte'
	import Menu from '$lib/components/svg/Menu.svelte'

	export let data

	let state = false

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

	const enter = i => {
		return {
			y: i * 15,
			delay: i * 2
		}
	}

	const exit = i => {
		return {
			y: i * 15,
			delay: (count - i - 1) * 25
		}
	}

	let count = 5
	let month = false

	$: if (state === false) month = false
</script>

<main use:outside on:child={() => state = false} on:outside={() => state = false}>
	{ #if state }
		<div class="month" in:pop={enter(4)} out:pop={exit(4)}>
			<button class="none" class:month={month} on:click={async () => {
				if (state) {
					month = true
				}
			}}>
				<Crossfade condition={month} delay={enter(4).delay}>
					<svelte:fragment slot='true'>
						<Month date={$date} max={new Date()} set={v => {
							$date.setMonth($date.getMonth() + v)
							$date = $date
							$links = $links
						}} color={'var(--bg-1)'} bg={'var(--bg-1)'} />
					</svelte:fragment>
					<svelte:fragment slot='false'>
						<Calendar size={'1.5rem'} color={'var(--bg-1)'} />
					</svelte:fragment>
				</Crossfade>
			</button>
		</div>
		<div class="ai" in:pop={enter(3)} out:pop={exit(3)}>
			<button class="none" on:click={async () => {
				if (!data.paying) {
					notifications.add({ type: 'error', message: 'Join Budgeteer to get personalized budgeting assistance!' })
					state = !state
					return
				}

				if (state) {
					$route.current = { assistant: true }
					await tick()
					window.getSelection().removeAllRanges()
				}
				state = !state
			}} transition:scale={{ duration: 300, delay: enter(3).delay }}>
				<Sparkle size={'1.5rem'} color={'var(--bg-1)'} />
			</button>
		</div>
		<div class="budgets" in:pop={enter(2)} out:pop={exit(2)}>
			<button class="none" on:click={async () => {
				if (!data.paying) {
					notifications.add({ type: 'error', message: 'Join Budgeteer to add more budgets!' })
					state = !state
					return
				}

				if (state) {
					$route.current = $route.choose.budget
					await tick()
					window.getSelection().removeAllRanges()
				}
				state = !state
			}} transition:scale={{ duration: 300, delay: enter(2).delay }}>
				<Budget size={'1.5rem'} color={'var(--bg-1)'} />
			</button>
		</div>
		<div class="links" in:pop={enter(1)} out:pop={exit(1)}>
			<button class="none" on:click={async () => {
				if (!data.paying) {
					notifications.add({ type: 'error', message: 'Join Budgeteer to add custom links!' })
					state = !state
					return
				}

				if (state) {
					$route.current = $route.links
					await tick()
					window.getSelection().removeAllRanges()
				}
				state = !state
			}} transition:scale={{ duration: 300, delay: enter(1).delay }}>
				<Link size={'1.5rem'} color={'var(--bg-1)'} />
			</button>
		</div>
	{ /if }
	<div class="menu">
		<button class="none" on:click={async () => {
			if (state) {
				if (!data.paying) {
					notifications.add({ type: 'error', message: 'Join Budgeteer to add custom transactions!' })
					state = !state
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
		align-items: flex-end;
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

	button.month:hover {
		transform: none;
	}
</style>