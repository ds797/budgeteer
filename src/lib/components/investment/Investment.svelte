<script>
	import { createEventDispatcher } from 'svelte'
	import { slide } from '$lib/utils/transition'

	export let holding
	export let security
	export let transactions
	export let selected = false

	const dispatch = createEventDispatcher()
</script>

<main>
	<button transition:slide class='none' class:selected on:click={() => dispatch('click', { holding, security, transactions })}>
		<p class="name">{security.name ?? 'Unknown Security'}</p>
		<div class="bar" />
		<p>{(holding.quantity * security.close_price).toFixed(2)}</p>
	</button>
</main>

<style>
	main {
		flex-flow: row;
	}

	button {
		flex: 1;
		margin: 0 1vw 0 2vw;
		align-self: flex-start;
		display: flex;
		justify-content: stretch;
		align-items: center;
		border: 0;
		gap: 0.5rem;
	}

	button:not(.selected):not(:hover) {
		transform: translateY(0.125rem);
		opacity: 0.4;
	}

	p {
		align-self: flex-start;
	}

	.name {
		max-width: 40vw;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.bar {
		height: 0.125rem;
		flex: 1;
		background: var(--text-bg);
		border-radius: 0.25rem;
	}
</style>