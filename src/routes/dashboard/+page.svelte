<script>
	import Spend from '$lib/components/Spend.svelte'
	import Save from '$lib/components/Save.svelte'
	import Accounts from '$lib/components/Accounts.svelte'
</script>

<main>
	<div class="left">
		<div class="card">
			<Spend />
		</div>
	</div>
	<div class="right">
		<div class="card">
			<Save height={1} />
		</div>
		<div class="card">
			<Accounts />
		</div>
	</div>
</main>

<style>
	main {
		margin: 0.5rem;
		flex-flow: row;
		justify-content: stretch;
		align-items: stretch;
	}

	@media (max-aspect-ratio: 1/1) {
		main {
			flex-flow: column;
		}
	}

	.left, .right {
		flex: 1;
		display: flex;
		flex-flow: column;
	}

	.card {
		flex: 1;
		margin: 0.5rem;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		background: var(--frosted);
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: var(--shadow);
	}
</style>