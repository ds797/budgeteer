import { user } from '../_shared/user.ts'
import { plaid } from '../_shared/plaid.ts'
import { cors } from '../_shared/cors.ts'
import { respond, err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const id = await user(req)
	const config = {
		user: { client_user_id: id },
		client_name: 'Budgeteer',
		language: 'en',
		products: ['auth', 'transactions'],
		country_codes: ['US'],
		webhook: 'https://www.example.com/webhook',
	}

	try {
		const token = await plaid.linkTokenCreate(config)
		return respond(token.data.link_token)
	} catch (error) {
		return err(error, 0)
	}
})