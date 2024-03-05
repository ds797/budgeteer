<main>
	<svg viewBox='0 0 1 1' preserveAspectRatio='none'>
		<slot />
	</svg>
</main>

<style>
	main {
		flex: 1;
		position: relative;
	}

	svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>