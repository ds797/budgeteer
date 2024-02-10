import { cors } from '../_shared/cors.ts'
import { plaid } from '../_shared/plaid.ts'
import { createAnon } from '../_shared/anon.ts'
import { respond, err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const { id } = await req.json()

	const { data, error } = await createAnon(req).from('links').select('id, access_token')
	if (error) return err(error, 0)

	const link = data.find((l: any) => l.id === id)
	if (!link) return err('Invalid link ID', 400)

	const { access_token } = link

	try {
		const response = await plaid.itemRemove({ access_token })
		if (response.status != 200) return err(response.error, response.status)

		return respond(true)
	} catch (error) {
		return err(error, 0)
	}
})