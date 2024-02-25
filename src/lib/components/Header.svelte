<script>
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { links, date } from '$lib/stores/user'
	import { route, notifications } from '$lib/stores/ui'
	import { slide } from '$lib/utils/transition'
	import Month from '$lib/components/Month.svelte'
	import Flow from '$lib/components/Flow.svelte'
	import Graph from '$lib/components/Graph.svelte'
	import Logo from '$lib/svg/Logo.svelte'
	import Account from '$lib/svg/Account.svelte'
	import Close from '$lib/svg/Close.svelte'

	export let data

	let show = false

	let email = ''
	const enter = async email => { // TODO: valid email?
		const { error } = await data.supabase.auth.signInWithOtp({ email })
		if (error) notifications.add({
			type: 'error',
			message: error
		})
		else notifications.add({
			type: 'success',
			message: 'Check your email to enter Budgeteer!'
		})

		return 1
	}

	$route.start = {
		name: 'Budgeteer',
		children: [{
			name: 'Email',
			type: 'input',
			value: email,
			set: v => email = v
		}, {
			name: 'Send link',
			type: 'action',
			submit: true,
			fill: true,
			click: async () => {
				await enter(email)
				return 0
			}
		}]
	}
</script>

<main>
	<div class="banner">
		{ #if $page.url.pathname === '/app' || $page.url.pathname === '/demo' && !data.session }
			<div class="error" transition:slide>
				<p>You're testing Budgeteer!</p>
			</div>
		{ /if }
	</div>
	<div class="header">
		<div class="left">
			{ #if $page.url.pathname === '/app' }
				<Month date={$date} set={v => {
					$date.setMonth($date.getMonth() + v)
					$date = $date
					$links = $links
				}} />
			{ :else }
				<button class="none" on:click={() => goto('/')}>
					<Logo />
				</button>
			{ /if }
		</div>
		<div class="middle">
			<div class="home">
				{ #if $page.url.pathname === '/' }
					<button on:click={() => goto('/app')}>Demo</button>
					<button class='fill' on:click={() => {
						if (!data.session) $route.current = $route.start
						else goto('/app')
					}}>Start</button>
					<button on:click={() => goto('/pricing')}>Pricing</button>
				{ :else if $page.url.pathname === '/app' }
					<Flow bind:show />
					{ #if show }
						<div class="graph">
							<Graph />
						</div>
					{ /if }
				{ :else }
					{ #if browser }
						<h1 class="backup">{document.title || $page.url.pathname.substring(1)}</h1>
					{ /if }
				{ /if }
			</div>
		</div>
		<div class="right">
			{ #if $page.url.pathname === '/app' && data.demo }
				<button class="none" on:click={() => goto('/')}>
					<Close stroke={'var(--accent-0)'} />
				</button>
			{ :else if data.session }
				<button class="none" on:click={() => $route.current = $route.account}>
					<Account />
				</button>
			{ /if }
		</div>
	</div>
	<div class="extra">

	</div>
</main>

<style>
	main {
		min-height: 4rem;
		justify-content: stretch;
		align-items: stretch;
		background: var(--bg-0);
	}

	.banner {
		flex: 1;
	}

	.header {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: stretch;
	}

	.error {
		background: var(--text-bad);
		color: var(--bg-1);
		text-align: center;
	}

	.home {
		align-self: stretch;
		flex: 1;
		max-width: 20rem;
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 0.5rem;
	}

	.home button {
		flex: 1;
	}

	.left, .middle, .right {
		flex: 1;
		padding: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.left {
		justify-content: flex-start;
	}

	.middle {
		flex: 2;
	}

	.right {
		justify-content: flex-end;
	}

	.graph {
		display: flex;
		justify-content: stretch;
		align-items: stretch;
	}

	.backup {
		text-transform: capitalize;
	}
</style>