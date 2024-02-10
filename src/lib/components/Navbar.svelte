<script>
	import { route, serving, queue, notifications } from '$lib/stores/ui'
	import { post } from '$lib/utils/requests'
	import Loading from '$lib/components/Loading.svelte'
	import Account from '$lib/svg/Account.svelte'
	import Close from '$lib/svg/Close.svelte'

	export let data
	export let demo = false

	$route.account = {
		name: 'Account',
		children: [{
			name: 'Subscription',
			children: [{
				name: 'Unsubscribe',
				dangerous: true,
				children: [{
					name: 'Unsubscribe',
					description: 'Are you sure you want to unsubscribe?',
					type: 'action',
					dangerous: true,
					click: () => {
						queue.enq(async () => {
							const { data: notification } = await data.supabase.invoke('payStop')
							notifications.add(notification)
							window.location.href = '/'
						})
						$route.current = undefined
					}
				}]
			}]
		}, {
			name: 'Exit',
			type: 'action',
			dangerous: true,
			click: async () => {
				try {
					const { error } = await data.supabase.auth.signOut()
					if (error) console.log(error)
					window.location.href = '/'
					invalidateAll()
				} catch {
					notifications.add({
						type: 'error',
						message: 'Couldn\'t sign out'
					})
				}
				return 1
			}
		}]
	}

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

		return 1;
	}

	$route.start = {
		name: 'Budgeteer',
		key: async e => {
			if (e.key !== 'Enter') return

			return await enter(email)
		},
		children: [{
			name: 'Email',
			type: 'input',
			value: email,
			set: v => email = v
		}, {
			name: 'Send link',
			type: 'action',
			fill: true,
			click: async () => {
				await enter(email)
				return 0
			}
		}]
	}
</script>

<main>
	{ #if data.session || demo }
		<!-- Logged in -->
		<div class="left">
			<div style="opacity: {$serving ? 1 : 0}">
				<Loading size={'1.5rem'} border={'0.25rem'} />
			</div>
		</div>
		<div class="mid">
			<button class="fill" on:click={() => $route.current = $route.pickBudget}>Budgets</button>
				<button class="fill add" on:click={() => {
				if (demo) {
					notifications.add({ type: 'error', message: 'Join Budgeteer to add custom transactions!' })
					return
				}
				$route.state.transaction = { properties: {} }
				$route.state.transaction.new = structuredClone($route.state.transaction)
				$route.state.pickCategory = $route.state.transaction.new.properties
				$route.state.pickAccount = $route.state.transaction.new
				$route.current = $route.transaction
			}}>+</button>
			<button class="fill" on:click={() => $route.current = $route.selectAccounts}>Links</button>
		</div>
		<div class="right">
			{ #if demo }
				<button class="none account" on:click={() => window.location.href = '/'}>
					<Close stroke={'var(--accent-0)'} />
				</button>
			{ :else }
				<button class="none account" on:click={() => {
					$route.current = $route.account
				}}>
					<Account />
				</button>
			{ /if }
		</div>
		<!-- <button class:disabled={loading} on:click={info}>Info</button>
		<button class:disabled={loading} on:click={transactions}>Transactions</button>
		<button class:disabled={loading} on:click={accounts}>Accounts</button>
		<button on:click={() => goto('/account', { replaceState: true })}>Account</button> -->
	{ :else }
		<!-- Logged out -->
		<button on:click={() => window.location.href = '/demo'}>Demo</button>
		<button class='fill' on:click={() => $route.current = $route.start}>Start</button>
	{ /if }
</main>

<style>
	main {
		height: 4rem;
		flex-flow: row;
		align-items: stretch;
		background: var(--bg-0);
	}

	button {
		width: 6rem;
		height: 3rem;
		margin: 0.5rem;
	}

	.add {
		width: 3rem;
	}

	.left, .mid, .right {
		padding: 0.5rem;
		flex: 1;
		display: flex;
		align-items: center;
	}

	.left {
		justify-content: flex-start;
	}

	.mid {
		justify-content: center;
	}

	.right {
		justify-content: flex-end;
	}

	.account {
		width: unset;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>