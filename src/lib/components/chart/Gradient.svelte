<script>
	export let name
</script>

<defs>
	<linearGradient id={name} x1='0' y1='0' x2='0' y2='1'>
		<stop offset='0' stop-color='var(--text-bad)' stop-opacity='1' />
		<stop offset='0.5' stop-color='var(--text-okay)' stop-opacity='1' />
		<stop offset='1' stop-color='var(--text-good)' stop-opacity='1' />
	</linearGradient>
</defs>