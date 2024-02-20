<script>
	import { send, receive } from '$lib/utils/transition'
	import { flip } from 'svelte/animate'
	export let list = []
	export let change = () => false

	const up = i => {
		const temp = list[i - 1]
		list[i - 1] = list[i]
		list[i] = temp
		change()
	}

	const down = i => {
		const temp = list[i + 1]
		list[i + 1] = list[i]
		list[i] = temp
		change()
	}
</script>

<main>
	{ #each list as item, index (item) }
		<div in:receive={{ key: item }} out:send={{ key: item }} animate:flip>
			<div class="order">
				<button disabled={index === 0 || null} class="none up" on:click={() => up(index)}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
					</svg>
				</button>
				<button disabled={index === list.length - 1 || null} class="none down" on:click={() => down(index)}>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
					</svg>
				</button>
			</div>
			<!-- <svg on:touchmove={log} on:mousedown={start} on:touchstart={start} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
				<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
			</svg> -->
			<slot {item} />
		</div>
	{ /each }
</main>

<style>
	main {
		align-items: stretch;
	}

	div {
		display: flex;
		justify-content: stretch;	
	}

	.order {
		margin-top: 0.25rem;
		display: flex;
		flex-flow: column;
	}

	.order > button {
		padding: 0;
		border: 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.order > button.up:hover {
		transform: translateY(-0.0625rem);
	}

	.order > button.down:hover {
		transform: translateY(0.0625rem);
	}

	.order > button > svg {
		stroke: var(--text-weak);
	}

	.order > button:disabled {
		pointer-events: none;
	}

	.order > button:disabled > svg {
		stroke: var(--text-bg);
	}

	svg {
		/* padding-top: 0.25rem; */
		height: 1rem;
		stroke-width: 0.25rem;
		/* cursor: pointer; */
		/* pointer-events: none; */
	}
</style>