<script>
	import { notifications } from '$lib/stores/ui'
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { fly, fade, crossfade } from 'svelte/transition';
	import { stack } from '../js/stores';
	import Notification from './Notification.svelte';

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback: node => {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform;

			return {
				duration: 600,
				easing: cubicOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			};
		}
	});

	const timer = async index => {
		await new Promise(r => setTimeout(r, 7500));

		$notifications.splice(index, 1);
		$notifications = $notifications
	}
</script>

<main>
	{ #each $notifications as notification (notification) }
		<button class="notification" on:introstart={timer(notification)} in:fly={{ y: 50 }} out:fade animate:flip>
			<Notification {notification} />
		</button>
	{ /each }
	{ #if !expand }
		<!-- svelte-ignore missing-declaration -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class="expand" on:click={() => expand = !expand} transition:fly|local={{ x: -50 }}>
			<h3>{$stack.length}</h3>
		</div>
	{ /if }
</main>

{ #if expand }
	<div class="notifications" on:click|stopPropagation={() => expand = !expand} transition:fade={{ duration: 300, easing: cubicOut }}>
		<button class="clear" class:disabled={!$stack.length} on:click={() => $stack = []} transition:fly={{ x: -50 }}>Clear</button>
		<div class="wrapper">
			{ #each [...$stack].reverse() as notification, i (notification) }
				<div on:click|stopPropagation={() => splack(notification)} in:fly={{ x: -50, delay: (i + 1) * 50 }} out:fly={{ x: -50 }}>
					<Notification {notification} />
				</div>
			{ /each }
		</div>
	</div>
{ /if }

<style>
	main {
		z-index: 1000;
		position: fixed;
		left: 1rem;
		bottom: 1rem;
		display: flex;
		flex-flow: column;
		gap: 1rem;
	}

	.expand {
		width: 2rem;
		height: 2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--neutral-high);
		border-radius: 50%;
		cursor: pointer;
	}

	.notifications {
		z-index: 1000;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		flex-flow: column;
		align-items: flex-start;
		gap: 1rem;
		background: hsla(var(--neutral-low-h), var(--neutral-low-s), var(--neutral-low-l), 60%);
		backdrop-filter: blur(0.125rem);
	}

	.clear {
		margin: 2rem 0 1rem 2rem;
		width: 4rem;
	}

	.wrapper {
		padding: 0 2rem;
		flex: 1;
		display: flex;
		flex-flow: column;
		align-items: flex-start;
		gap: 1rem;
		overflow: auto;
	}
</style>