<script>
	import { goto } from '$app/navigation'
</script>

<main>
	<button id="budget" tabindex=-1 on:click={() => goto('/budget')}>
		<p>Budget</p>
	</button>
	<button id="invest" tabindex=-1 on:click={() => goto('/invest')}>
		<p>Invest</p>
	</button>
</main>

<style>
	main {
		width: auto;
		padding: 0.5rem;
		position: fixed;
		left: 50%;
		transform: translateX(-50%);
		bottom: 1rem;
		display: flex;
		justify-content: space-evenly;
		gap: 1rem;
		background: var(--accent-0);
		border-radius: 1rem;
		box-shadow: 0.125rem 0.125rem 1rem #00000050;
	}

	button {
		width: 4rem;
		height: 3rem;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		background: none;
	}

	p {
		color: white;
	}
</style>