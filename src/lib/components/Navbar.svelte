<script>
	import { goto } from '$app/navigation'
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
							const { data: notification } = await data.supabase.invoke('pay', { type: 'stop' })
							if (notification) notifications.add(notification)
							goto('/')
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
					invalidateAll()
					goto('/')
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
	{ #if data.session || demo }
		<!-- Logged in -->
		<div class="left">
			<div style="opacity: {$serving ? 1 : 0}">
				<div class="icon">
					<div class="loading">
						<Loading size={'1.25rem'} border={'0.25rem'} />
					</div>
				</div>
			</div>
		</div>
		<div class="mid">
			<button class="fill secondary" on:click={() => $route.current = $route.pickBudget}>Budgets</button>
				<button class="fill primary" on:click={() => {
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
			<button class="fill secondary" on:click={() => $route.current = $route.selectAccounts}>Links</button>
		</div>
		<div class="right">
			{ #if demo }
				<button class="none account" on:click={() => goto('/')}>
					<Close stroke={'var(--accent-0)'} />
				</button>
			{ :else }
				<button class="none icon" on:click={() => {
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
		<button on:click={() => goto('/demo')}>Demo</button>
		<button class='fill' on:click={() => $route.current = $route.start}>Start</button>
		<button on:click={() => goto('/pricing')}>Pricing</button>
	{ /if }
</main>

<style>
	main {
		height: 4rem;
		flex-flow: row;
		align-items: stretch;
		background: var(--bg-0);
	}

	.mid button {
		max-width: 6rem;
		height: 3rem;
		margin: 0.5rem;
	}

	.secondary {
		flex: 1;
	}

	.primary {
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
		flex: 2;
		justify-content: center;
	}

	.right {
		justify-content: flex-end;
	}

	.icon {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.loading {
		padding: 0.25rem;
		border: 0.125rem solid transparent;
	}
</style>