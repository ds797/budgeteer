<script>
	import { goto, invalidateAll } from '$app/navigation'
	import { route, notifications } from '$lib/stores/ui'
	import Account from '$lib/svg/Account.svelte'

	export let data

	let card
	let account = {
		name: 'Account',
		children: [{
			name: 'Exit',
			type: 'action',
			dangerous: true,
			click: async () => {
				try {
					await data.supabase.auth.signOut()
					invalidateAll()
					goto('/')
				} catch {
					notifications.add({
						type: 'error',
						message: 'Couldn\'t sign out'
					})
				}
				return 1
			}
		}]
	}

	const move = e => {
		let x = e.x / window.innerWidth - 0.5
		let y = e.y / window.innerHeight - 0.5
		card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
	}
</script>

<svelte:window on:mousemove={move} />

<main>
	<div class="navbar">
		<div class="left" />
		<div class="middle">
			<h1>Pricing</h1>
		</div>
		<div class="right">
			<button class="none" on:click={() => $route.current = account}>
				<Account />
			</button>
		</div>
	</div>
	<div class="container">
		<div class="card" bind:this={card}>
			<div class="header">
				<h2>Budgeteer</h2>
				<div class="price">
					<h3>$9.99</h3>
					<p>/</p>
					<p>month</p>
				</div>
			</div>
			<div class="info">
				<p>Simple, streamlined budgeting that allows you to act on your decisions as easily as if you controlled Budgeteer with your mind.</p>
				<div class="buy">
					<button class="fill" on:click={() => goto('/')}>Start</button>
				</div>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		padding: 1rem;
		flex: 1;
		box-sizing: border-box;
		align-items: stretch;
	}

	h1 {
		text-shadow: var(--shadow);
	}

	.navbar {
		display: flex;
	}

	.left, .middle, .right {
		flex: 1;
		display: flex;
		align-items: center;
	}

	.left { justify-content: flex-start; }
	.middle { justify-content: center; }
	.right { justify-content: flex-end; }

	.container {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		perspective: 40rem;
	}

	.card {
		width: 15rem;
		height: 20rem;
		padding: 1rem;
		display: flex;
		flex-flow: column;
		justify-content: flex-start;
		gap: 0.5rem;
		background: var(--frosted);
		border-radius: 0.75rem;
		box-shadow: var(--shadow);
		transform-style: preserve-3d;
	}

	.header {
		display: flex;
		flex-flow: column;
	}

	.price {
		display: flex;
		gap: 0.25rem;
	}

	.price > p {
		color: var(--text-weak);
	}

	.info {
		flex: 1;
		display: flex;
		flex-flow: column;
		justify-content: space-between;
	}

	.buy {
		display: flex;
		flex-flow: column;
		justify-content: space-between;
		gap: 0.25rem;
	}

	.buy > p {
		color: var(--text-weak);
	}

	.buy > .tos {
		font-size: 0.875rem;
	}

	.buy > button {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>