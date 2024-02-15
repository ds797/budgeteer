<script>
	export let size = '4rem', border = '0.5rem', color = 'var(--accent-0)'
</script>

<div style="
	width: {size};
	height: {size};
	border: {border} solid;
	border-color: {color} #0000;
" />

<style>
	div {
		border-radius: 50%;
		animation: spinner-0tkp9a 1s infinite;
	}

	@keyframes spinner-0tkp9a {
		to {
				transform: rotate(.5turn);
		}
	}
</style>