<script>
	import { onMount, createEventDispatcher, onDestroy } from 'svelte'

	let node
	let picker

	const dispatch = createEventDispatcher()

	const click = ({ detail: { unicode: emoji } }) => {
		dispatch('emoji', emoji)
	}

	onMount(async () => {
		const { default: Picker } = await import('emoji-picker-element/picker')
		picker = new Picker()
		picker.style.cssText = `
			width: 400px;
			height: 20rem;
			--background: var(--frosted);
			--border-color: none;
		`;
		picker.classList.add('light')
		node.append(picker)
		picker.addEventListener('emoji-click', click, 1)
	})

	onDestroy(() => picker.removeEventListener('emoji-click', click, 1))
</script>

<main>
	<div class="picker" bind:this={node} />
</main>

<style>
	main {
		width: calc(400px * 1);
		transform: scale(1);
		height: calc(20rem * 1);
		display: flex;
		justify-content: center;
		align-content: center;
		border-radius: 0.75rem;
	}

	@media (max-width: 450px) {
		main {
			width: calc(400px * 0.8);
			transform: scale(0.8);
			height: calc(20rem * 0.8);
		}
	}

	@media (max-width: 350px) {
		main {
			width: calc(400px * 0.7);
			transform: scale(0.7);
			height: calc(20rem * 0.7);
		}
	}
</style>