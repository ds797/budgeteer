<script>
	import './styles.css'
	import { onMount } from 'svelte'
	import { fade, scale } from 'svelte/transition'
	import { quadOut } from 'svelte/easing'
	import { v4 as uuidv4 } from 'uuid'
	import { page } from '$app/stores'
	import { invalidate, invalidateAll } from '$app/navigation'
	import { goto } from '$lib/utils/navigation'
	import { browser } from '$app/environment'
	import { initialize, update } from '$lib/utils/routes'
	import { generate } from '$lib/utils/generate'
	import { links } from '$lib/stores/user'
	import { route, queue, notifications, loading } from '$lib/stores/ui'
	import Links from '$lib/classes/Links'
	import Menu from '$lib/components/element/Menu.svelte'
	import Modal from '$lib/components/element/Modal.svelte'
	import Notifications from '$lib/components/Notifications.svelte'
	import Assistant from '$lib/components/Assistant.svelte'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	export let data

	$: ({ supabase, session, plaid, storage, pathname, demo, paid, paying } = data)

	const quit = () => {
		if ($route.current?.quit) $route.current.quit()
		$route.state = { choose: {} }
		$route.current = undefined
	}

	const active = () => {
		storage.set('active', new Date().getTime())
	}

	const MINUTE = 60 * 1000
	const FREQUENCY = 5 * MINUTE

	const refreshLinks = async () => {
		// Within cooldown range OR been 3 * FREQUENCY since last active
		if ((storage.get('cooldown') && new Date().getTime() - storage.get('cooldown') < FREQUENCY)
			|| (storage.get('active') && 3 * FREQUENCY < new Date().getTime() - storage.get('active')))
			return

		const ls = await plaid.getLinks()
		if (!ls.length) return

		// ls.push($links.links.find(l => !l.institution))
		$links.set.links(ls)
		$links = $links
	}

	const init = async () => {
		// Step 1: get budgets
		$links = new Links(storage.get('links'), m => {
			console.error(m)
			notifications.add({ type: 'error', message: m })
		}, supabase.invoke)

		let { budgets, selected } = await supabase.getBudgets()

		if (budgets) {
			// Step 2: budgets exist, so user must be set up -
			// ...get links from DB
			const data = await supabase.getLinks()

			$links.set.links(data)
			
			// Step 3: When possible, get links from Plaid and
			// ...update DB now that the user most likely has
			// ...some links already
			queue.enq(supabase.updateLinks)
		} else {
			budgets = [$links.default()]
			selected = budgets[0]
			await supabase.setBudgets({ budgets, selected })
		}
		
		$links.budgets = budgets
		$links.selected = selected

		storage.set('links', $links)

		supabase.setBudgets({
			budgets: $links.budgets,
			selected: $links.selected,
			groups: $links.groups
		})

		setTimeout(() => {
			setInterval(() => {
				queue.enq(refreshLinks)
			}, FREQUENCY)
		}, FREQUENCY)
	}

	const stored = () => {
		if (storage.get('links')) $links = new Links(storage.get('links'), m => notifications.add({ type: 'error', message: m }), supabase.invoke)
	}

	const tab = uuidv4()

	const check = () => {
		let tabs = storage.get('tabs') ?? []
		const now = new Date().getTime()
		tabs = tabs.filter(t => now - t.time < MINUTE)
		const index = tabs.findIndex(t => t.name === tab)
		if (index === -1) tabs.push({ name: tab, time: now })
		else tabs[index].time = now
		if (tabs.length === 1 && !tabs[0].leader) {
			tabs[0].leader = true
			queue.enq(init)
		} else stored()
		storage.set('tabs', tabs)
	}

	onMount(async () => {
		const { data: state } = supabase.auth.onAuthStateChange(async (_, _session) => {
			// State changed
			const change = _session?.user?.id !== session?.user?.id

			if (_session?.expires_at !== session?.expires_at) {
				data.paying = await paid()
				invalidate('supabase:auth')
				invalidateAll()
			}
			if (_session) queue.enq(async () => update.account($route, paying, data))

			if ($page.url.pathname === '/' && change) {
				$route.current = undefined
				goto('/app')
			}
		})

		if (!demo && paying) {
			check()
			setTimeout(check, MINUTE)
			// If any value is present, don't initialize
			const redirect = $page.url.searchParams.get('redirect')
			if (redirect) queue.enq(cont)
			else queue.enq(init)
		} else {
			$links = generate($links, data)
			$route.current = undefined
		}

		return () => state.subscription.unsubscribe()
	})

	$: {
		const message = $page.url.searchParams.get('error')
		if (message) {
			notifications.add({ type: 'error', message })
			if (browser) goto('.', { replaceState: true })
		}
	}

	initialize($route, $links, data)

	$: $route, update.all($route, $links, data)

	$: $page, $loading = false
</script>

<svelte:window on:keydown={active} on:mousemove={active} />

{ #if $loading }
	<div class="loading" transition:fade={{ duration: 200, easing: quadOut }} />
{ /if }

<main>
	<Notifications />
	<!-- svelte-ignore empty-block -->
	{ #if $route.current?.loading }
	{ :else if $route.current?.assistant }
		<Modal alpha={0} on:close={() => $route.current = undefined}>
			<Assistant {session} />
		</Modal>
	{ :else if $route.current }
		<Modal closable={false} on:close={quit}>
			<Menu bind:menu={$route.current} on:close={quit} />
		</Modal>
	{ /if }
	<div class="top">
		<Header {data} />
	</div>
	<div class="fill">
		{ #key pathname }
			<div class="content" in:scale={{ duration: 800, delay: 100 }} out:scale={{ duration: 800 }}>
				<slot {data} />
			</div>
		{ /key }
	</div>
	<div class="bottom">
		<Footer {session} />
	</div>
</main>

<style>
	main {
		height: 100%;
		justify-content: stretch;
		align-items: stretch;
	}

	.loading {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		opacity: 30%;
		z-index: 1001;
		cursor: wait;
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.bottom {
		position: sticky;
		bottom: 0;
	}

	.fill {
		flex: 1;
		position: relative;
	}

	.content {
		flex: 1;
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
		overflow-y: auto;
	}
</style>