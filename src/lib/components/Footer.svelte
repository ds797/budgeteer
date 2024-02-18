<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { route, serving, notifications } from '$lib/stores/ui'
	import Loading from '$lib/components/Loading.svelte'
	import Plus from '$lib/svg/Plus.svelte'
	import Account from '$lib/svg/Account.svelte'
	import Close from '$lib/svg/Close.svelte'

	export let data
	export let demo = false

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
		<div class="container">
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
				}}>
					<Plus size={'1rem'} />
				</button>
				<button class="fill secondary" on:click={() => $route.current = $route.selectAccounts}>Links</button>
			</div>
			<div class="right">
				{ #if demo }
					<button class="none account" on:click={() => goto('/')}>
						<Close stroke={'var(--accent-0)'} />
					</button>
				{ :else }
					<button class="none icon" on:click={() => $route.current = $route.account}>
						<Account />
					</button>
				{ /if }
			</div>
		</div>
	{ /if }
</main>

<style>
	main {
		flex-flow: row;
		justify-content: center;
		align-items: stretch;
		background: var(--bg-0);
	}

	.container {
		flex: 1;
		height: 4rem;
		display: flex;
		justify-content: center;
		align-items: stretch;
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

	.mid button {
		max-width: 6rem;
		height: 3rem;
		margin: 0.5rem;
	}

	.right {
		justify-content: flex-end;
	}

	.secondary {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.primary {
		width: 3rem;
		display: flex;
		justify-content: center;
		align-items: center;
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