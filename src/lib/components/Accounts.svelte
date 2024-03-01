<script>
	import { links } from '$lib/stores/user'
	import { route, notifications } from '$lib/stores/ui'
	import Account from '$lib/components/Account.svelte'

	export let data
</script>

<main>
	{ #each $links.links.filter(l => l.institution) as link }
		{ #each link.accounts.filter(a => a?.balances?.available) as account }
			<Account {link} {account} />
		{ /each }
	{ :else }
		<div />
		<h3>You haven't linked any banks!</h3>
		<div />
		<button class="fill" on:click={() => {
			if (!data.paying) {
				notifications.add({ type: 'error', message: 'Join Budgeteer to add custom links!' })
				return
			}

			$route.current = $route.links
		}}>Link Institution</button>
	{ /each }
</main>

<style>
	main {
		flex: 1;
		justify-content: flex-start;
		box-sizing: border-box;
		padding: 1rem;
		gap: 0.5rem;
	}

	button {
		padding: 0.5rem;
	}
</style>