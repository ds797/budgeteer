<script>
	import { createEventDispatcher } from 'svelte';
	import { cubicOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { slide } from 'svelte/transition';

	export let alpha = 1
	export let closable = true

	let overlay;
	let dispatch = createEventDispatcher();

	const click = e => e.target === overlay && dispatch('close')
</script>

<svelte:window on:keydown={e => closable && e.key === 'Escape' && dispatch('close')} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<main transition:fade={{ duration: 300, easing: cubicOut }} on:click={click} bind:this={overlay}>
	{ #if alpha }
		<div class='focus'>
			<slot />
		</div>
	{ :else }
		<slot />
	{ /if }
</main>
<div class='tip' transition:slide={{ duration: 300, fade: true }}>
	<slot name='tip' />
</div>

<style>
	main {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: hsla(var(--neutral-low-h), var(--neutral-low-s), var(--neutral-low-l), 60%);
		backdrop-filter: var(--blur);
		z-index: 999;
	}

	.focus {
		display: flex;
		align-items: center;	
		padding: 1rem;
		background: var(--frosted);
		border-radius: 0.5rem;
		box-shadow: var(--shadow);
		overflow: hidden;
	}

	.tip {
		height: 8rem;
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		opacity: 75%;
	}
</style>