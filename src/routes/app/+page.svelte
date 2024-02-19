<script>
	import { onMount } from 'svelte'
	import { v4 as uuidv4 } from 'uuid'
	import { page } from '$app/stores'
	import { links } from '$lib/stores/user'
	import { queue, route, notifications } from '$lib/stores/ui'
	import Links from '$lib/classes/Links'
	import Loading from '$lib/components/Loading.svelte'
	import Budgets from '$lib/components/Budgets.svelte'

	export let data

	$: ({ supabase, plaid, storage } = data)

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
		$links = new Links(storage.get('links'), m => notifications.add({ type: 'error', message: m }), supabase.invoke)

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
		if (storage.get('links')) $links = storage.get('links')
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

	onMount(() => {
		check()
		setTimeout(check, MINUTE)
		// If any value is present, don't initialize
		const redirect = $page.url.searchParams.get('redirect')
		if (redirect) queue.enq(cont)
		else queue.enq(init)
	})
</script>

<svelte:head>
	<title>Budgeteer</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<main>
	{ #if $route.current?.loading || !data.session }
		<Loading />
	{ :else }
		<Budgets {data} />
	{ /if }
</main>

<style>
	main {
		padding: 0 5vw;
		box-sizing: border-box;
		flex: 1;
		display: flex;
		justify-content: center;
		/* align-items: flex-start; */
	}
</style>