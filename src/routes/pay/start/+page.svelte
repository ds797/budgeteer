<script>
	import { onMount } from 'svelte'
	import { PUBLIC_STRIPE_KEY } from '$env/static/public'
	import Loading from '$lib/components/Loading.svelte'

	export let data

	let loading = true
	let element

	onMount(async () => {
		const stripe = Stripe(PUBLIC_STRIPE_KEY)

		const { data: secret } = await data.supabase.invoke('payCreate')

		const checkout = await stripe.initEmbeddedCheckout({ clientSecret: secret })

		loading = false
		checkout.mount(element)
	})
</script>

<main>
	{ #if loading }
		<div class="loading">
			<Loading />
			<p>Initializing secure checkout...</p>
		</div>
	{ /if }
	<div class="checkout" bind:this={element} />
</main>

<style>
	main {
		flex-flow: row;
	}

	.loading {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		display: flex;
		flex-flow: column;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.loading > p {
		color: var(--text-weak);
	}

	.checkout {
		flex: 1;
	}
</style>