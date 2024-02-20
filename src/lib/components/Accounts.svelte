<script>
	import { links } from '$lib/stores/user'
	import Account from '$lib/components/Account.svelte'
</script>

<main>
	{ #each $links.links as link }
		{ #if link.institution }
			{ #each link.accounts as account }
				<Account {link} {account} />
			{ /each }
		{ /if }
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
</style>