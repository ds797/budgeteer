import { cors } from '../_shared/cors.ts'
import { user } from '../_shared/user.ts'
import { service } from '../_shared/service.ts'
import { respond } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	let paid = false

	const id = await user(req)

	if (id) {
		const { data } = await service.from('payments').select('*')
		paid = data.filter((payment: any) => payment.user_id === id).length ? true : false
	}
	
	return respond(paid)
})