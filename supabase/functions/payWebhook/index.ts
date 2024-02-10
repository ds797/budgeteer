import { cors } from '../_shared/cors.ts'
import { stripe, provider } from '../_shared/stripe.ts'
import { service } from '../_shared/service.ts'
import { err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const signature = req.headers.get('Stripe-Signature')

	// First step is to verify the event. The .text() method must be used as the
	// verification relies on the raw request body rather than the parsed JSON.
	const payload = await req.text()
	let event: any

	try {
		event = await stripe.webhooks.constructEventAsync(
			payload,
			signature,
			Deno.env.get('SECRET_STRIPE_WEBHOOK'),
			undefined,
			provider
		)
	} catch (error) {
		return err(error.message, 400)
	}

	// Secondly, we use this event to query the Stripe API in order to avoid
	// handling any forged event. If available, we use the idempotency key.
	const options = event.request && event.request.idempotency_key
		? { idempotencyKey: event.request.idempotency_key } : {}

	let retrieved: any
	try {
		retrieved = await stripe.events.retrieve(event.id, options)
	} catch (error) {
		return err(error.message, 400)
	}

	// retrieved
	let user_id: string
	try {
		user_id = JSON.parse(payload).data.object.metadata.user_id
	} catch {
		return err('No user ID found', 400)
	}

	// Subscription renewed
	if (retrieved.type === 'invoice.paid') {
		console.log('>> invoice paid')
	}

	// User cancelled subscription
	if (retrieved.type === 'customer.subscription.deleted') {
		console.log('>> subscription cancelled')
	}
	
	// User created subscription
	if (retrieved.type === 'checkout.session.completed') {
		const customer_id = retrieved.data.object.customer
		const subscription_id = retrieved.data.object.subscription

		const paid = new Date()
		paid.setMonth(paid.getMonth() + 1)

		const { error } = await service.from('payments').upsert({ user_id, customer_id, subscription_id, paid })
		if (error) console.error(error)
	}

	return new Response(JSON.stringify({ ok: true }), {
		headers: { ...cors, 'Content-type': 'application/json' },
		status: 200
	})
})