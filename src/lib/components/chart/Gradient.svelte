<script>
	export let name
</script>

<defs>
	<linearGradient id={name} x1='0' y1='0' x2='0' y2='1' gradientUnits='userSpaceOnUse'>
		<stop offset='0.2' stop-color='var(--text-bad)' stop-opacity='1' />
		<stop offset='0.45' stop-color='var(--text-okay)' stop-opacity='1' />
		<stop offset='0.55' stop-color='var(--text-good)' stop-opacity='1' />
	</linearGradient>
</defs>