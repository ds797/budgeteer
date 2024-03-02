<script>
	export let options = []
	export let value
	export let set = () => false
</script>

<main>
	<div class="selector">
		<div class="pad" style="flex: {(options.length - 1) * options.indexOf(value) / (options.length - 1)}" />
		<div class="select">
			<div />
		</div>
		<div class="pad" style="flex: {(options.length - 1) * ((options.length - 1 - options.indexOf(value)) / (options.length - 1))}" />
	</div>
	<div class="options">
		{ #each options as option, index }
			{ #if index !== 0 }
				<div class="bar" /> 
			{ /if }
			<button class="none option" class:chosen={value === option} on:click={() => set(option)}>
				<p>{option}</p>
			</button>
		{ /each }
	</div>
</main>

<style>
	* {
		transition: all 0.3s cubic-bezier(0, 0.5, 0.5, 1);
	}

	main {
		height: 1.75rem;
		position: relative;
		flex-flow: row;
		align-items: stretch;
		background: var(--text-bg);
		border-radius: 0.5rem;
	}

	button.option {
		padding: 0;
		flex: 1;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
	}

	button.option.chosen {
		color: var(--bg-1);
	}

	p {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.options {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
	}

	.selector {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		pointer-events: none;
	}

	.bar {
		width: 0.125rem;
		margin: 0.125rem 0;
		background: var(--text-weak);
		border-radius: 0.5rem;
		opacity: 50%;
	}

	.select {
		flex: 1;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
	}

	.select > div {
		flex: 1;
		margin: 0.125rem 0.125rem;
		background: var(--accent-0);
		border-radius: 0.375rem;
		opacity: 85%;
		box-shadow: var(--shadow-stronger);
	}
</style>