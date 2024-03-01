<script>
	export let direction;
	export let size = '2rem', fill = 'none', stroke = 'white', color = 'inherit';
</script>

{ #if direction === 'left' }
	<main style='width: {size}; height: {size}; fill: {fill}; stroke: {stroke}; color: {color};'>
		<svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 19l-7-7 7-7'></path></svg>
	</main>
{ :else if direction === 'right' }
	<main style='width: {size}; height: {size}; fill: {fill}; stroke: {stroke}; color: {color};'>
		<svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'></path></svg>
	</main>
{ :else if direction === 'down' }
	<main style='width: {size}; height: {size}; fill: {fill}; stroke: {stroke}; color: {color};'>
		<svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'></path></svg>
	</main>
{ :else }
	<main style='width: {size}; height: {size}; fill: {fill}; stroke: {stroke}; color: {color};'>
		<svg class='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M5 15l7-7 7 7'></path></svg>
	</main>
{ /if }

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>