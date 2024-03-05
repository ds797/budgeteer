<script>
	export let max = 1, value = 0
</script>

<main>
	<div style='flex: 0 0 {value / max * 100}%; background: {value / max < 1/3 ? 'var(--text-bad)' : value / max < 2/3 ? 'var(--text-okay)' : 'var(--text-good)'};' />
</main>

<style>
	main {
		min-width: 3rem;
		width: 100%;
		height: 0.375rem;
		flex-flow: row;
		justify-content: flex-start;
		align-items: stretch;
		background: var(--text-bg);
		border-radius: 0.5rem;
	}

	div {
		border-radius: 1rem;
	}
</style>