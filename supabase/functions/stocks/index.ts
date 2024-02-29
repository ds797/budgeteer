import { cors } from '../_shared/cors.ts'
import { history } from '../_shared/polygon.ts'
import { user } from '../_shared/user.ts'
import { service } from '../_shared/service.ts'
import { respond, err } from '../_shared/response.ts'

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

	if (type.history) {
		try {
			const data = await history(type.history.ticker, type.history.interval ?? 'day', type.history.multiplier ?? 1)

			return respond(data)
		} catch (error) {
			return err(error.message, 400)
		}
	}

	return err('No type specified', 400)
})