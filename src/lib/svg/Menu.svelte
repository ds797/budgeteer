<script>
	export let size = '2rem', fill = 'none', stroke = 'white', color = 'inherit';
	export let open = false;
</script>

<main style='width: {size}; height: {size}; fill: {fill}; stroke: {stroke}; color: {color};'>
	<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
		<path style="transform: {open ? 'translateY(0)' : 'translateY(-0.5rem)'};" stroke-linecap='round' stroke-linejoin='round' stroke-width='1.75' d='M3 12h18'></path>
		<path class="middle" style="transform: {open ? 'rotate(90deg)' : 'rotate(0)'};" stroke-linecap='round' stroke-linejoin='round' stroke-width='1.75' d='M3 12h18'></path>
		<path style="transform: {open ? 'translateY(0)' : 'translateY(0.5rem)'};" stroke-linecap='round' stroke-linejoin='round' stroke-width='1.75' d='M3 12h18'></path>
	</svg>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.middle {
		transform-origin: center;
	}
</style>