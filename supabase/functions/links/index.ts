import { cors } from '../_shared/cors.ts'
import { plaid, get, set, remove, refresh, create, investments } from '../_shared/plaid.ts'
import { user } from '../_shared/user.ts'
import { service } from '../_shared/service.ts'
import { respond, err } from '../_shared/response.ts'

// Cases: get, set, remove, refresh
Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const user_id = await user(req)
	// No user?
	if (!user_id) return err('Unauthorized', 400)
	// Paying?
	let paid = false
	if (user_id) {
		const { data } = await service.from('payments').select('*')
		paid = data.filter((payment: any) => payment.user_id === user_id).length ? true : false
	}
	if (!paid) return err('Unauthorized', 400)

	const { type } = await req.json()

	if (type.get) {
		const links = await get(user_id, () => true, { logos: true })

		const is = await investments(user_id, links.map((l: any) => l.id))

		return respond({ links, investments: is })
	} else if (type.set) {
		const links = type.set

		await set(user_id, ...links)

		return respond({ success: true })
	} else if (type.remove) {
		const ids = type.remove

		await remove(user_id, (l: any) => ids.find((id: any) => id === l.id))

		return respond({ success: true })
	} else if (type.refresh) {
		const links = await refresh(user_id, () => true)

		return respond({ links, investments: await investments(user_id, links.map((l: any) => l.id)) })
	} else if (type.create) {
		const public_token = type.create

		try {
			const links = await create(user_id, ...public_token)
			return respond(links)
		} catch (error) {
			return err(error.message, 0)
		}
	} else if (type.token) {
		const config = {
			user: { client_user_id: user_id },
			client_name: 'Budgeteer',
			language: 'en',
			products: ['auth', 'transactions', 'investments'],
			country_codes: ['US'],
			webhook: 'https://www.example.com/webhook',
		}

		try {
			const token = await plaid.linkTokenCreate(config)
			return respond(token.data.link_token)
		} catch (error) {
			return err(error, 0)
		}
	}

	return err('No type specified', 400)
})