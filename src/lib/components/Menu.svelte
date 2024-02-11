<script>
	import { createEventDispatcher } from 'svelte'
	import { slide } from '$lib/utils/transition'
	import Chevron from '$lib/svg/Chevron.svelte'
	import Check from '$lib/svg/Check.svelte'
	import Input from '$lib/components/element/Input.svelte'
	import Switch from '$lib/components/element/Switch.svelte'
	import Loading from '$lib/components/Loading.svelte'
	import Date from '$lib/components/element/Date.svelte'
	import Sparkle from '$lib/svg/Sparkle.svelte'

	export let menu = {};
	let reverse = false;

	let blank = v => v;
	
	const dispatch = createEventDispatcher();
	
	const key = async e => {
		if (menu.key) {
			const close = await menu.key(e);
			if (close) dispatch('close', 0);
		}

		if (e.key !== 'Escape') return;

		if (show === -1) dispatch('close', 0);
	}

	let show = -1;
	let loading = 0

	let click = {
		menu: async (child, i) => {
			if (child.click) {
				loading = i + 1
				await child.click()
				loading = 0
			}

			show = i
		},
		action: async (child, i) => {
			if (child.click) {
				loading = i + 1
				const close = await child.click()
				loading = 0
				if (close) dispatch('close', close - 1)
			}
		}
	}

	$: if (!menu) dispatch('close', 0)
</script>

<svelte:window on:keydown={key} />

<div class="container" style="flex-flow: {reverse ? 'row-reverse' : 'row'};">
{ #if show === -1 }
	<main on:introend={() => reverse = false} transition:slide|global={{ axis: 'both' }}>
		<div class='items'>
			<div class='title'>
				<button class="close" class:disabled={!(menu?.close ?? true) || loading} on:click={() => dispatch('close', 0)}>
					<Chevron direction={'left'} size={'1.5rem'} />
				</button>
				{ #if menu?.name }
					<h3 style={'cursor: default;'}>{menu?.name}</h3>
				{ /if }
			</div>

			{ #each menu?.children ?? [] as child, index }
				{ #if !child.hide }
					{ #if child.description }
						<p class='description'>{child.description}</p>
					{ /if }

					<div class="hint">
						{ #if child.hint }
							<h4>{child.hint}</h4>
						{ /if }
						{ #if child.name && (child.type ?? 'menu') === 'menu' }
							<button class:fill={child.fill} class:disabled={child.disabled} on:click={() => click.menu(child, index)} class:dangerous={child.dangerous}>{child.name}</button>
						{ :else if child.name && child.type === 'action' }
							<div class='select'>
								<button class='action' class:fill={child.fill} class:disabled={child.disabled || loading == index + 1} class:dangerous={child.dangerous} on:click={() => click.action(child, index)}>
									{ #if child.icon }
										{ #if child.icon === 'sparkle' }
											<Sparkle size={'1rem'} />
										{ /if }
									{ /if }	
									{child.name}
									{ #if loading == index + 1 }
										<Loading size={'0.5rem'} border={'0.125rem'} />
									{ /if }
								</button>
								{ #if child.children }
									<button class:disabled={child.disabled} on:click={() => click.menu({}, index)}>
										<Chevron direction={'right'} size={'1.5rem'} />
									</button>
								{ /if }
							</div>
						{ :else if child.type === 'spacer' }
							<div />
						{ :else if child.type === 'input' }
							<Input value={child.value} name={child.name} placeholder={child.placeholder} set={child.set ?? blank} style={child.css ?? ''} />
						{ :else if child.type === 'money' }
							<Input type='money' value={child.value} name={child.name} placeholder={child.placeholder} set={child.set ?? blank} style={child.css ?? ''} />
						{ :else if child.type === 'textarea' }
							<Input type='textarea' value={child.value} name={child.name} placeholder={child.placeholder} set={child.set ?? blank} style={'height: 3rem; ' + child.css ?? ''} />
						<!-- { :else if child.type === 'time' }
							<div class="time">
								<Date value={child.value} set={child.set ?? blank} />
								<Time value={child.value} set={child.set ?? blank} />
							</div> -->
						{ :else if child.type === 'toggle' }
							<div class="toggle">
								<button class="label" class:none={!child.children} style={child.children ? '' : 'pointer-events: none;'} on:click={() => click.menu(child, index)}>
									{child.name}
								</button>
								<button class:disabled={child.disabled} class:fill={child.value} on:click={child.set}>
									<Check size={'1.5rem'} />
								</button>
							</div>
						{ :else if child.type === 'switch' }
							<div class="switch">
								<h4>{child.name}</h4>
								<Switch on={child.value} set={child.set} background={child.bg} />
							</div>
						{ :else if child.type === 'account' }
							<div class="column">
								<button class:fill={child.fill} class:disabled={child.disabled} on:click={() => click.menu(child, index)}>{child.link.name}</button>
								<div class="container">
									<div class="bar" />
									<div class="account">
										{ #each child.link.accounts as account }
											<div class="label">
												<p class="name">{account.name}</p>
												<p class="balance {account.balances.available < 0 ? 'bad' : 'good'}">{account.balances.available}</p>
											</div>
										{ /each }
									</div>
								</div>
							</div>
						{ :else if child.type === 'date' }
							<div class="date">
								<Date value={child.value} set={child.set} />
							</div>
						<!-- { :else if child.type === 'color' && child.value !== undefined }
							<Color value={child.value} set={child.set ?? blank} />
						{ :else if child.type === 'colors' }
							<Colors set={v => {
								child.set(v) ?? blank;
								dispatch('close');
							}} /> -->
						{ :else if child.type === 'email' }
							<Input type='email' value={child.value} name={child.name} placeholder={child.placeholder} set={child.set ?? blank} style={child.css ?? ''} />
						{ :else if child.type === 'password' }
							<Input type='password' value={child.value} name={child.name} placeholder={child.placeholder} set={child.set ?? blank} style={child.css ?? ''} />
						{ /if }
					</div>
				{ /if }
			{ /each }
		</div>
	</main>
{ :else }
	<svelte:self bind:menu={menu.children[show]} on:close={e => {
		if (menu.close) menu.close()
		for (const c of menu.children ?? [])
			if (c.close) c.close()
		
		if (e.detail > 0) dispatch('close', e.detail - 1)
		else {
			reverse = true
			show = -1
		}
	}} />
{ /if }
</div>

<style>
	main {
		all: unset;
		display: flex;
		flex-flow: row;
		align-items: center;
		height: unset;
	}

	.container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.select {
		display: flex;
		justify-content: stretch;
		gap: 0.5rem;
	}

	.select > .action {
		flex: 1;
	}

	.hint {
		display: flex;
		flex-flow: column;
		gap: 0.25rem;
	}

	.hint > h4 {
		margin-left: 0.25rem;
		font-weight: 500;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
	}

	.toggle {
		display: flex;
		justify-content: stretch;
		gap: 0.5rem;
	}

	.toggle > .label {
		justify-content: left;
		flex: 1;
	}

	.switch {
		margin: 0 0.25rem;
		display: flex;
	}

	.switch > h4 {
		flex: 1;
	}

	.column {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: stretch;
		gap: 0.125rem;
	}

	.bar {
		align-self: stretch;
		width: 0.125rem;
		margin: 0.25rem 0 0.25rem 0.125rem;
		background: black;
		border-radius: 0.125rem;
	}

	.account {
		flex: 1;
		display: flex;
		flex-flow: column;
	}

	.account > .label {
		margin: 0 0.25rem;
		display: flex;
	}

	.label > .name {
		flex: 1;
	}

	.label > .balance {
		font-weight: bold;
	}

	h3 {
		min-width: 10rem;
		margin: 0;
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
		white-space: nowrap;
	}

	p {
		margin: 0;
	}

	.items {
		display: flex;
		flex-flow: column;
		gap: 0.5rem;
	}

	.title {
		display: flex;
		justify-content: stretch;
		gap: 0.5rem;
		align-self: stretch;
		white-space: nowrap;
	}

	/* .time {
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
	} */
</style>