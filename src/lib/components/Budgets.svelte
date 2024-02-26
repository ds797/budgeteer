<script>
	import { links } from '$lib/stores/user'
	import { route, queue } from '$lib/stores/ui'
	import { slide } from '$lib/utils/transition'
	import List from '$lib/components/List.svelte'
	import Category from '$lib/components/Category.svelte'
	import Actions from '$lib/components/Actions.svelte'

	export let data
	export let demo = false
</script>

<main>
	<!-- TODO: don't need to queue this? -->
	<List list={$links.get.groups()} change={() => !demo && queue.enq(data.supabase.updateBudgets)} let:item={group} key={'name'}>
		<div transition:slide>
			<button class="none" on:click={() => {
				$route.state.group = group
				$route.current = $route.group
			}}>{group.name}</button>
			<List list={group.categories} change={() => !demo && queue.enq(data.supabase.updateBudgets)} let:item={category} key={'name'}>
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