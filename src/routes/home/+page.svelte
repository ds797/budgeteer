<script>
	import { date } from '$lib/stores/user'
	import Monthly from '$lib/components/Monthly.svelte'
	import Accounts from '$lib/components/Accounts.svelte'
	import Glance from '$lib/components/Glance.svelte'

	export let data
</script>

<svelte:head>
	<title>Dashboard</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<main>
	<Glance month={$date} />
	<div class="container">
		<div class="left">
			<div class="card">
				<Monthly type={{ spend: true }} month={$date} />
			</div>
		</div>
		<div class="right">
			<div class="card">
				<Monthly type={{ save: true }} month={$date} height={1} />
			</div>
			<div class="card">
				<Accounts {data} />
			</div>
		</div>
	</div>
</main>

<style>
	main {
		margin: 0.5rem;
		justify-content: stretch;
		align-items: stretch;
	}

	.container {
		flex: 1;
		display: flex;
	}

	@media (max-aspect-ratio: 1/1) {
		.container {
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