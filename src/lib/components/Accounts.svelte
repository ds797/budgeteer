<script>
	import { links } from '$lib/stores/user'
	import { route } from '$lib/stores/ui'
	import Account from '$lib/components/Account.svelte'
</script>

<main>
	{ #each $links.links.filter(l => l.institution) as link }
		{ #each link.accounts as account }
			<Account {link} {account} />
		{ /each }
	{ :else }
		<div />
		<h3>You haven't linked any banks!</h3>
		<div />
		<button class="fill" on:click={() => $route.current = $route.selectAccounts}>Link Institution</button>
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