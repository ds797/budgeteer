<script>
	import { notifications } from '$lib/stores/ui'
	import { slide } from '$lib/utils/transition'
	import { fly, fade, crossfade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
	import AlertCircle from '$lib/svg/AlertCircle.svelte'
	import CloseCircle from '$lib/svg/CloseCircle.svelte'
	import CheckmarkCircle from '$lib/svg/CheckmarkCircle.svelte'

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback: node => {
			const style = getComputedStyle(node);
			const transform = style.transform === 'none' ? '' : style.transform

			return {
				duration: 600,
				easing: cubicOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t};
				`
			};
		}
	})

	const remove = n => {
		const index = $notifications.indexOf(n)

		if (index === -1) return

		notifications.remove(index)
	}

	const timer = async n => {
		await new Promise(r => setTimeout(r, 7500));

		remove(n)
	}
</script>

<main>
	{ #each $notifications as notification (notification) }
		<button class="notification" on:click={() => remove(notification)} on:introstart={async () => timer(notification)} in:fly={{ y: 50 }} out:fly={{ y: 25 }} animate:flip>
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
		justify-content: flex-end;
		align-items: stretch;
		z-index: 1000;
		pointer-events: none;
	}

	main > * {
		pointer-events: auto;
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