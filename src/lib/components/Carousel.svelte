<script>
	import { onMount } from "svelte";
	import { slide } from "$lib/utils/transition";

	let options = ['categorize', 'budget', 'invest', 'save']
	let colors = [5, 100, 200, 300]

	let showing = 0;

	onMount(() => {
		setInterval(() => {
			showing++;
			showing %= options.length;
		}, 2000);
	})
</script>

<div>
	{ #each options as option, i }
		{ #if showing === i }
			<span style='color: hsl({colors[i]} 60% 55%);' transition:slide>{option}.</span>
		{ /if }
	{ /each }
	<span class='width'>{options[0]}.</span>
</div>

<style>
	div {
		display: flex;
		flex-flow: column;
		align-items: flex-start;
	}

	.width {
		max-height: 0;
		opacity: 0;
	}
</style>