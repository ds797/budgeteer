<script>
	import { onMount } from 'svelte'
	import { PUBLIC_STRIPE_KEY } from '$env/static/public'
	import { post } from '$lib/utils/requests'

	onMount(async () => {
		const stripe = Stripe(PUBLIC_STRIPE_KEY)

		const { secret } = await post('/pay/create')

		const checkout = await stripe.initEmbeddedCheckout({ clientSecret: secret })

		checkout.mount('#checkout')
	})
</script>

<main>
	<div id="checkout" />
</main>

<style>
	main {
		flex-flow: row;
	}
	#checkout {
		flex: 1;
	}
</style>