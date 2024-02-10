import { cors } from '../_shared/cors.ts'
import { refreshLink } from '../_shared/plaid.ts'
import { service } from '../_shared/service.ts'
import { createAnon } from '../_shared/anon.ts'
import { respond, err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	let { predicate } = await req.json()
	if (!predicate) predicate = () => true

	const { data: { user } } = await createAnon(req).auth.getUser()
	const id = user?.id

	const anon = createAnon(req)
	if (!anon) return err('Error creating supabase client!', 500)

	let { data, error } = await service.from('links').select('id, user_id, access_token, transactions, cursor')
	if (error) return err(error.message, 0)

	data = data.filter((l: any) => l.user_id === id)

	let build: any = []

	for (let { id, access_token, cursor, transactions } of data) {
		if (!access_token) continue

		const { data, error } = await refreshLink(anon, id, access_token, cursor, transactions)
		if (error) return err(error.message, error.status)

		build.push(data)
	}

	build = build.filter((l: any) => predicate(l))

	return respond(build)
})