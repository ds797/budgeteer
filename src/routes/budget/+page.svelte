<script>
	import { links } from '$lib/stores/user'
	import { route, queue } from '$lib/stores/ui'
	import { slide } from '$lib/utils/transition'
	import List from '$lib/components/element/List.svelte'
	import Category from './Category.svelte'
	import Actions from './Actions.svelte'

	export let data
</script>

<svelte:head>
	<title>Budget</title>
	<meta name="description" content="Next-gen financing for all." />
</svelte:head>

<main>
	<!-- TODO: don't need to queue this? -->
	<List list={$links.get.groups()} change={() => data.paying && queue.enq(data.supabase.budgets.update)} let:item={group} key={'name'}>
		<div transition:slide>
			<button class="none" on:click={() => {
				$route.state.group = group
				$route.current = $route.group
			}}>{group.name}</button>
			<List list={group.categories} change={() => data.paying && queue.enq(data.supabase.budgets.update)} let:item={category} key={'name'}>
				<Category {group} {category} />
			</List>
		</div>
	</List>
</main>

<div class="actions">
	<Actions {data} />
</div>

<style>
	main {
		flex: 1;
		padding: 0 5vw;
		box-sizing: border-box;
		justify-content: flex-start;
		overflow-y: auto;
	}
	div {
		flex: 1;
		display: flex;
		flex-flow: column;
		align-items: flex-start;
	}

	button {
		justify-self: flex-start;
		font-size: 1.5rem;
	}

	.actions {
		position: absolute;
		right: 1.5rem;
		bottom: 1rem;
	}
</style>