<script>
	import { links } from '$lib/stores/user'
	import { route, queue } from '$lib/stores/ui'
	import { slide } from '$lib/utils/transition'
	import List from '$lib/components/List.svelte'
	import Category from '$lib/components/Category.svelte'

	export let data
	export let demo = false
</script>

<main>
	<!-- TODO: don't need to queue this? -->
	<List list={$links.get.groups()} change={() => {
		if (demo) return

		queue.enq(data.supabase.updateLinks)
			}} let:item={group}>
		<div transition:slide>
			<button class="none" on:click={() => {
				$route.state.group = group
				$route.current = $route.group
			}}>{group.name}</button>
			{ #each group.categories as category }
				<Category {group} {category} />
			{ /each }
		</div>
	</List>
</main>

<style>
	main {
		flex: 1;
		justify-content: flex-start;
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
</style>