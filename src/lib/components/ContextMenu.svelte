<script>
	export let show = false, top = 0, right, bottom, left = 0
</script>

{ #if show }
	<main style='{top ? `top: ${top}px;` : ''}{right ? `right: ${right}px;` : ''}{bottom ? `bottom: ${bottom}px;` : ''}{left ? `left: ${left}px;` : ''}'>
		TEST
	</main>
{ /if }

<style>
	main {
		all: unset;
		position: fixed;
		display: flex;
		flex-flow: column;
	}
</style>