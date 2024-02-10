import { v4 as uuidv4 } from 'npm:uuid'
import { cors } from '../_shared/cors.ts'
import { createAnon } from '../_shared/anon.ts'
import { plaid, refreshLink } from '../_shared/plaid.ts'
import { respond, err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const { public_token } = await req.json()

	// Get token
	try {
		const response = await plaid.itemPublicTokenExchange({
			public_token
		})
		if (response.data != null && response.data.access_token != null) {
			// Access token OK, fetch Item
			const access_token = response.data.access_token

			const { data, error } = await refreshLink(createAnon(req), uuidv4(), access_token, null, null)
			if (error) return err(error.message, error.status)

			return respond(data)
		}
	} catch (error) {
		return err(error, 0)
	}
})