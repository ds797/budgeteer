<script>
	import { browser } from '$app/environment'
	import { goto } from '$lib/utils/navigation'
	import { page } from '$app/stores'
	import { links, date } from '$lib/stores/user'
	import { route, notifications } from '$lib/stores/ui'
	import { slide } from '$lib/utils/transition'
	import Month from '$lib/components/element/Month.svelte'
	import Flow from '$lib/components/budget/Flow.svelte'
	import Monthly from '$lib/components/Monthly.svelte'
	import Logo from '$lib/components/svg/Logo.svelte'
	import Account from '$lib/components/svg/Account.svelte'
	import Close from '$lib/components/svg/Close.svelte'

	export let data
	export let demo = false

	let graph = false

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

	$: url = $page.url.pathname
	$: app = url === '/home' || url === '/budget' || url === '/invest' || url === '/review'
</script>

<main>
	<div class="banner">
		<!-- Check if browser defined to prevent including banner in SSR page -->
		{ #if browser && app && demo }
			<div class="error" transition:slide>
				<p>You're testing Budgeteer!<button class="none" on:click={() => goto('/subscribe')}>Subscribe</button>to get full access.</p>
			</div>
		{ /if }
	</div>
	<div class="header">
		<div class="left">
			{ #if !data.mobile && app }
				<Month date={$date} max={new Date()} set={v => {
					$date.setMonth($date.getMonth() + v)
					$date = $date
					$links = $links
				}} color={'var(--accent-0)'} bg={'var(--text-weak)'} />
			{ :else }
				<button class="none" on:click={() => goto('/')}>
					<Logo />
				</button>
			{ /if }
		</div>
		<div class="middle">
			{ #if url === '/' }
				<button on:click={() => goto('/budget')}>Demo</button>
				<button class='fill' on:click={() => {
					if (data.paying) goto('/home')
					else if (data.session) goto('/subscribe')
					else $route.current = $route.start
				}}>Start</button>
				<button on:click={() => goto('/pricing')}>Pricing</button>
			{ :else if url === '/budget' }
				<Flow mobile={data.mobile} bind:graph />
			{ :else }
				{ #if browser }
					<h1 class="backup">{document.title || url.substring(1)}</h1>
				{ /if }
			{ /if }
		</div>
		<div class="right">
			{ #if app && !data.paying }
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
		{ #if graph && url === '/budget' }
			<div class="graph" transition:slide={{ duration: 600 }}>
				<Monthly type={{ both: true }} month={$date} height={1} />
			</div>
		{ /if }
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

	.error button {
		color: var(--bg-1);
		font-weight: normal;
		border: none;
		text-decoration: underline;
		text-underline-offset: 0.125rem;
	}

	.error button:hover {
		transform: none;
		text-underline-offset: 0.0625rem;
	}

	.left, .middle, .right {
		flex: 2;
		padding: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.left {
		justify-content: flex-start;
	}

	.middle {
		flex: 3;
		align-self: stretch;
		max-width: 20rem;
		display: flex;
		justify-content: center;
		align-items: stretch;
		gap: 0.5rem;
	}

	.middle button {
		flex: 1;
	}

	.right {
		justify-content: flex-end;
	}

	.extra {
		padding: 0 5vw;
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