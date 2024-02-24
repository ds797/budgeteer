<script>
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { route, notifications } from '$lib/stores/ui'
	import Flow from '$lib/components/Flow.svelte'
	import Logo from '$lib/svg/Logo.svelte'
	import Account from '$lib/svg/Account.svelte'

	export let data

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
	{ #if $page.url.pathname === '/app' || $page.url.pathname === '/demo' }
		<!-- Logged in -->
		<Flow />
	{ :else if $page.url.pathname === '/' }
		<!-- Logged out -->
		<div class="left">
			<button class="none" on:click={() => goto('/')}>
				<Logo />
			</button>
		</div>
		<div class="middle">
			<div class="home">
				<button on:click={() => goto('/demo')}>Demo</button>
				<button class='fill' on:click={() => {
					if (!data.session) $route.current = $route.start
					else goto('/app')
				}}>Start</button>
				<button on:click={() => goto('/pricing')}>Pricing</button>
			</div>
		</div>
		<div class="right">

		</div>
	{ :else }
		{ #if browser }
			<div class="left">
				<button class="none" on:click={() => goto('/')}>
					<Logo />
				</button>
			</div>
			<div class="middle">
				<h1>{document.title || $page.url.pathname.substring(1)}</h1>
			</div>
			<div class="right">
				<button class="none" on:click={() => $route.current = $route.account}>
					<Account />
				</button>
			</div>
		{ /if }
	{ /if }
</main>

<style>
	main {
		min-height: 4rem;
		flex-flow: row;
		justify-content: center;
		align-items: stretch;
		background: var(--bg-0);
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
</style>