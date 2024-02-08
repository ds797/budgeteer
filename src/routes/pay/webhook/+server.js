import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SECRET_STRIPE_ENDPOINT, SECRET_SUPABASE_KEY } from '$env/static/private'

export const POST = async event => {
	const { request, locals: { stripe } } = event
	const payload = await request.text()
	const sig = request.headers.get('stripe-signature')
	const id = JSON.parse(payload).data.object.id
	let user_id
	try {
		user_id = JSON.parse(payload).data.object.metadata.user_id
	} catch (error) {
		console.log('no user_id found')
	}

	const supabase = createClient(PUBLIC_SUPABASE_URL, SECRET_SUPABASE_KEY)

	let e

	try {
		e = stripe.webhooks.constructEvent(payload, sig, SECRET_STRIPE_ENDPOINT);
	} catch (err) {
		return new Response(JSON.stringify({ error: `Webhook error: ${err.message}`, status: 400 }, { status: 200 }))
	}

	console.log(e.type)

	// Subscription renewed
	if (e.type === 'invoice.paid') {
		console.log('>> invoice paid')
	}

	// User cancelled subscription
	if (e.type === 'customer.subscription.deleted') {
		console.log('>> subscription cancelled')
	}
	
	// User created subscription
	if (e.type === 'checkout.session.completed') {
		const customer_id = e.data.object.customer
		const subscription_id = e.data.object.subscription

		const { error } = await supabase.from('payments').upsert({ user_id, customer_id, subscription_id, paid: new Date(new Date().setMonth(new Date().getMonth() + 1)) })
		if (error) console.error(error)
	}

	return new Response(null, { status: 200 })
}