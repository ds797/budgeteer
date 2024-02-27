<script>
	import Monthly from '$lib/components/Monthly.svelte'
	import Accounts from '$lib/components/Accounts.svelte'

	export let data
</script>

<main>
	<div class="left">
		<div class="card">
			<Monthly spend={true} />
		</div>
	</div>
	<div class="right">
		<div class="card">
			<Monthly spend={false} height={1} />
		</div>
		<div class="card">
			<Accounts {data} />
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
		justify-content: flex-start;
		align-items: center;
		background: var(--frosted);
		border-radius: 1rem;
		overflow: hidden;
		box-shadow: var(--shadow);
	}
</style>