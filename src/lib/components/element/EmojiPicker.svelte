<script>
	import { createEventDispatcher, onMount } from 'svelte'
	onMount(async () => await import('emoji-picker-element'))

	const dispatch = createEventDispatcher()
</script>

<emoji-picker on:click|stopPropagation on:emoji-click={e => dispatch('emoji', { emoji: e.detail.unicode })}></emoji-picker>