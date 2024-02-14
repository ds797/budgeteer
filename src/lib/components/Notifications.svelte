<script>
	import { onMount } from 'svelte'
	import { notifications } from '$lib/stores/ui'
	import { crossfade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import AlertCircle from '$lib/svg/AlertCircle.svelte'
	import CloseCircle from '$lib/svg/CloseCircle.svelte'
	import CheckmarkCircle from '$lib/svg/CheckmarkCircle.svelte'
  import { cubicOut } from 'svelte/easing';

	let visible = []

	export const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),
		fallback: (node, params) => {
			const style = getComputedStyle(node)
			const transform = style.transform === 'none' ? '' : style.transform

			return {
				duration: 400,
				easing: cubicOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			}
		}
	})

	// Pretty animations on load
	let mounted = false
	onMount(() => {
		visible = $notifications
		mounted = true
	})

	const updateVisible = async () => {
		if (!mounted) return

		visible = $notifications
	}

	$: updateVisible($notifications)
</script>

<main>
	{ #each visible as notification (notification) }
		<button class="notification" on:click={() => notifications.remove(notification)} in:receive={{ key: notification }} out:send={{ key: notification }} animate:flip>
			<div class="title">
				<div class="icon">
					{ #if notification.type === 'success' }
						<CheckmarkCircle size={'1rem'} fill={'var(--noti-success)'} />
					{ :else if notification.type === 'warning' }
						<AlertCircle size={'1rem'} fill={'var(--noti-warning)'} />
					{ :else if notification.type === 'error' }
						<CloseCircle size={'1rem'} fill={'var(--noti-error)'} />
					{ :else }
						<AlertCircle size={'1rem'} fill={'var(--noti-info)'} />
					{ /if }
				</div>
				<h3>{notification.type ?? 'success'}</h3>
			</div>
			<p>{notification.message}</p>
		</button>
	{ /each }
</main>

<style>
	main {
		width: 15rem;
		position: fixed;
		bottom: 0;
		left: 0;
		flex-flow: column-reverse;
		justify-content: flex-end;
		align-items: stretch;
		z-index: 1000;
		pointer-events: none;
	}

	.title {
		display: flex;
	}

	.icon {
		margin: 0.25rem;
		width: 1rem;
		height: 1rem;
	}

	button {
		all: unset;
		pointer-events: auto;
		cursor: pointer;
	}

	.notification {
		/* height: 4rem; */
		margin: 0.5rem;
		padding: 0.5rem;
		display: flex;
		flex-flow: column;
		background: var(--frosted);
		backdrop-filter: var(--blur);
		box-shadow: var(--shadow);
		border-radius: 0.5rem;
	}

	h3::first-letter {
		text-transform: capitalize;
	}

	p {
		font-size: 1rem;
		line-height: 1.25rem;
		text-overflow: ellipsis;
	}
</style>