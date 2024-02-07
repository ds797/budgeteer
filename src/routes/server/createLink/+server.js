import { v4 as uuidv4 } from 'uuid'

export const POST = async event => {
	const { public_token } = await event.request.json()

	// Get token
	try {
		const response = await event.locals.plaid.itemPublicTokenExchange({
			public_token
		})
		if (response.data != null && response.data.access_token != null) {
			// Access token OK, fetch Item
			const access_token = response.data.access_token

			const { link, error: plaidError } = await event.locals.refreshLink(uuidv4(), access_token, null)

			if (plaidError) return new Response(JSON.stringify({ error: plaidError.error, status: plaidError.status ?? 400 }), { status: 200 })

			return new Response(JSON.stringify({ link }), { status: 200 })
		}
	} catch (error) {
		console.error(error)
	}

	return new Response(JSON.stringify({ error: 'error', status: 400 }), { status: 200 })
}