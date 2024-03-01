<script>
	import Bank from '$lib/components/svg/Bank.svelte'

	export let link, account
</script>

<main>
	<div class="logo">
		{ #if link.logo.split(',')[1] !== 'null' }
			<img src={link.logo} alt="" />
		{ :else }
			<Bank size={'1.5rem'} />
		{ /if }
	</div>
	<h3>{account.name}</h3>
	<div class="bar" />
	<h3 class="balance">{account.balances.available}</h3>
</main>

<style>
	main {
		flex-flow: row;
		gap: 0.5rem;
	}

	.logo {
		width: 1.5rem;
		height: 1.5rem;
	}

	.logo img {
		max-width: 100%;
		max-height: 100%;
		margin: auto;
	}

	.bar {
		flex: 1;
		height: 0.125rem;
		background: var(--text-bg);
	}

	.balance {
		font-weight: normal;
		color: var(--text-weak);
		text-align: right;
	}
</style>