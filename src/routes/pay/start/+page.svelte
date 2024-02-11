<script>
	import { onMount } from 'svelte'
	import Loading from '$lib/components/Loading.svelte'

	const PUBLIC_STRIPE_KEY = 'pk_live_51OfvXCBA2iuGdMvmwAx2c2L55a60p2zILJp3t3mle06hmFeOcRcxgDCV3duwCHkspbqab8J2EVKKoP65tVwkHYX100oQgoVBhw'

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
	<div class="padding">
		<div class="checkout" bind:this={element} />
	</div>
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

	.padding {
		padding: 1rem;
		flex: 1;
		display: flex;
		flex-flow: column;
		justify-content: stretch;
		align-items: stretch;
	}

	.checkout {
		flex: 1;
	}
</style>