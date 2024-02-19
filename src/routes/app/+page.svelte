<script>
	import { onMount } from 'svelte'
	import { page } from '$app/stores'
	import { links } from '$lib/stores/user'
	import { queue, route, notifications } from '$lib/stores/ui'
	import Links from '$lib/classes/Links'
	import Loading from '$lib/components/Loading.svelte'
	import Budgets from '$lib/components/Budgets.svelte'

	export let data

	$: ({ supabase, plaid, storage } = data)

	const FREQUENCY = 5 * 60 * 1000

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

	const cont = () => {
		if (storage.get('links')) $links = storage.get('links')
		setTimeout(() => {
			setInterval(() => {
				if (storage.get('links')) $links = storage.get('links')
			}, FREQUENCY)
		}, 30 * 1000)
	}

	onMount(() => {
		// If any value is present, don't initialize
		const redirect = $page.url.searchParams.get('redirect')
		// TODO: if user closes master tab, won't update (localstorage 'tabs' array update every min if tab is open, then if no response remove from array? if only one then that is master)
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