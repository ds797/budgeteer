<script>
	import { slide } from '$lib/utils/transition'

	export let on = false
	export let set
	export let background = 'none'
</script>

<button style="background: {background};" on:click={() => set(!on)}>
	{ #if on }
		<div class="hidden" transition:slide={{ axis: 'width' }} />
	{ /if }
	<div />
</button>

<style>
	button {
		width: 2rem;
		height: 1rem;
		box-sizing: content-box;
		padding: 0;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		border: 0.125rem solid var(--accent-0);
		border-radius: 1rem;
	}
	.hidden {
		visibility: hidden;
	}

	div {
		width: 1rem;
		height: 1rem;
		background: var(--accent-0);
		border-radius: 1rem;
	}
</style>