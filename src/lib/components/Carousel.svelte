<script>
	import { onMount } from "svelte";
	import { slide } from "$lib/utils/transition";

	let options = ['categorize', 'budget', 'invest', 'save']

	let showing = 0;

	const color = i => i / (options.length - 1)

	onMount(() => {
		setInterval(() => {
			showing++;
		}, 2000);
	})
</script>

<div>
	{ #each options as option, i }
		{ #if showing % options.length === i }
			<span style='color: hsl({color(i) * 255} 60% 50%);' transition:slide>{option}.</span>
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