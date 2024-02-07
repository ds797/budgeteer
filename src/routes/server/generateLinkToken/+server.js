export const POST = async event => {
	const config = {
		user: { client_user_id: 'randomuserlol' },
		client_name: 'Budgeteer',
		language: 'en',
		products: ['auth', 'transactions'],
		country_codes: ['US'],
		webhook: 'https://www.example.com/webhook',
	}

	const token = await event.locals.plaid.linkTokenCreate(config)

	return new Response(JSON.stringify({
    token: token.data.link_token
  }), { status: 200 })
}