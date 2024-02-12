import { cors } from '../_shared/cors.ts'
import { getLinks, setLinks, removeLinks, refreshLinks, createLinks } from '../_shared/plaid.ts'
import { user } from '../_shared/user.ts'
import { respond, err } from '../_shared/response.ts'

// Cases: get, set, remove, refresh
Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const user_id = await user(req)
	if (!user_id) return err('Unauthorized', 400)

	const { type } = await req.json()

	if (type.get) {
		const links = await getLinks(user_id, () => true)

		return respond(links)
	} else if (type.set) {
		const links = type.set

		await setLinks(user_id, ...links)

		return respond({ success: true })
	} else if (type.remove) {
		const ids = type.remove

		await removeLinks(user_id, ...ids)

		return respond({ success: true })
	} else if (type.refresh) {
		const links = await refreshLinks(user_id, ...await getLinks(user_id, () => true))

		return respond(links)
	} else if (type.create) {
		const public_token = type.create

		try {
			const links = await createLinks(user_id, ...public_token)
			return respond(links)
		} catch (error) {
			return err(error, 0)
		}
	}

	return err('No type specified', 400)
})