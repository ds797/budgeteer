<script>
	import { scale } from 'svelte/transition'
	import { slide } from '$lib/utils/transition'

	export let condition = false
	export let delay = 0

	const intro = () => {
		const d = delay
		delay = 0
		return d
	}
</script>

<main in:scale={{ delay: intro() }} out:scale>
	{ #key condition }
		<div transition:slide|global={{ axis: 'both' }}>
			{ #if condition }
				<slot name='true' />
			{ :else }
				<slot name='false' />
			{ /if }
		</div>
	{ /key }
</main>

<style>
	main {
		flex-flow: row;
	}

	div {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>