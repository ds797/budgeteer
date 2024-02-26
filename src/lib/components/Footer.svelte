<script>
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { serving } from '$lib/stores/ui'
	import Loading from '$lib/components/Loading.svelte'
	import Dashboard from '$lib/svg/Dashboard.svelte'
	import Budget from '$lib/svg/Budget.svelte'
</script>

<main>
	<div class="left">
		<div class="loading" style="opacity: {$serving ? 1 : 0};">
			<Loading size={'1.25rem'} border={'0.25rem'} />
		</div>
	</div>
	<div class="middle">
		{ #if $page.url.pathname !== '/' }
			<button class="none page" class:selected={$page.url.pathname === '/dashboard'} on:click={() => goto('/dashboard')}>
				<Dashboard size={'1.5rem'} />
				<p>Dashboard</p>
			</button>
			<button class="none page" class:selected={$page.url.pathname === '/app'} on:click={() => goto('/app')}>
				<Budget size={'1.5rem'} />
				<p>Budget</p>
			</button>
		{ /if }
	</div>
	<div class="right">
	</div>
</main>

<style>
	main {
		flex-flow: row;
		justify-content: center;
		align-items: stretch;
	}

	.left, .middle, .right {
		flex: 1;
		padding: 0 0.5rem;
		display: flex;
		align-items: center;
	}

	.left { justify-content: flex-start; }

	.middle {
		flex: 2;
		justify-content: center;
	}

	.right { justify-content: flex-end; }

	.loading {
		padding: 0.25rem;
		border: 0.125rem solid transparent;
	}

	.page {
		margin: 0.25rem;
		width: 4rem;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
	}

	.page:hover {
		transform: none;
	}

	.page:hover * {
		transform: translateY(-0.125rem);
	}

	.page p {
		font-size: 0.75rem;
		font-weight: normal;
	}

	.selected {
		background: var(--accent-0-light);
	}
</style>