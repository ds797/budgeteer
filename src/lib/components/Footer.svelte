<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { route, serving, notifications } from '$lib/stores/ui'
	import Loading from '$lib/components/Loading.svelte'
	import Plus from '$lib/svg/Plus.svelte'
	import Account from '$lib/svg/Account.svelte'
	import Dashboard from '$lib/svg/Dashboard.svelte'
	import Budget from '$lib/svg/Budget.svelte'
	import Home from '$lib/svg/Home.svelte'
	import Close from '$lib/svg/Close.svelte'

	export let demo = false
	export let session
</script>

<main>
	{ #if session }
		<button class="none" class:selected={$page.url.pathname === '/dashboard'} on:click={() => goto('/dashboard')}>
			<Dashboard />
			<p>Dashboard</p>
		</button>
		<button class="none" class:selected={$page.url.pathname === '/app'} on:click={() => goto('/app')}>
			<Budget />
			<p>Budget</p>
		</button>
	{ :else }
		<button class="none" on:click={() => goto('/')}>
			<Home />
		</button>
	{ /if }
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

	main > button {
		margin: 0.25rem;
		width: 4.5rem;
		border-radius: 1.5rem;
	}

	button {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
	}

	button p {
		font-size: 0.75rem;
		font-weight: normal;
	}

	main > button.selected {
		background: var(--accent-0-light);
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