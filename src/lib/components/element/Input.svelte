<script>
	import Check from '../../svg/Check.svelte';

	export let type = 'text';
	export let value = '';
	export let name = '';
	export let placeholder = '';
	export let set = v => v;
	export let style = '';

	if (type === 'money') internal = parseFloat(internal).toFixed(2)

	$: internal = value;
	$: internal, value !== internal && set(internal);
</script>

<main>
	{ #if type === 'text' }
		<h4>{name}</h4>
		<input type='text' {placeholder} bind:value={internal} {style} />
	{ :else if type === 'textarea' }
		<h4>{name}</h4>
		<textarea type='text' {placeholder} bind:value={internal} {style} />
	{ :else if type === 'money' }
		<h4>{name}</h4>
		<input type='number' min='0.00' step='0.01' {placeholder} bind:value={internal} on:blur={() => internal = parseFloat(internal).toFixed(2)} {style} />
	{ :else if type === 'toggle' }
		<button on:click={() => internal = !internal}>
			{name}
			<div class:toggled={internal}>
				<Check size='1.5rem' />
			</div>
		</button>
	{ :else if type === 'email' }
		<h4>{name}</h4>
		<input type='email' {placeholder} bind:value={internal} {style} />
	{ :else if type === 'password' }
		<h4>{name}</h4>
		<input type='password' {placeholder} bind:value={internal} {style} />
	{ /if }
</main>

<style>
	main {
		display: flex;
		flex-flow: column;
		gap: 0.25rem;
	}

	h4 {
		margin-left: 0.5rem;
		width: 100%;
		text-align: left;
		font-weight: 500;
	}

	button {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	div {
		width: 1.5rem;
		height: 1.5rem;
		background: none;
		color: var(--contrast-high);
		border-radius: 0.5rem;
	}

	textarea {
		min-height: 5rem;
		font-weight: normal;
		resize: none;
	}

	.toggled {
		background: var(--plink);
		color: var(--neutral-high);
	}
</style>