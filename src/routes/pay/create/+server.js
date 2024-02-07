export const POST = async event => {
	const DOMAIN = 'http://localhost:5173'

	const { user: { id: user_id } } = await event.locals.getSession()

	const session = await event.locals.stripe.checkout.sessions.create({
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

	return new Response(JSON.stringify({ secret: session.client_secret }), { status: 200 })
}