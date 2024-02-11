import { cors } from '../_shared/cors.ts'
import { user } from '../_shared/user.ts'
import { stripe } from '../_shared/stripe.ts'
import { respond } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const DOMAIN = 'http://budgeteer.cc'

	const user_id = await user(req)

	const session = await stripe.checkout.sessions.create({
		ui_mode: 'embedded',
		line_items: [
			{
				price: 'price_1Og0F6BA2iuGdMvmlvxx6FK2',
				quantity: 1,
			},
		],
		mode: 'subscription',
		return_url: `${DOMAIN}/pay/finish`,	
		metadata: { user_id }
	})

	return respond(session.client_secret)
})