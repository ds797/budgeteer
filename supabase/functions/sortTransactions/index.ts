import { cors } from '../_shared/cors.ts'
import { sort } from '../_shared/openai.ts'
import { respond, err } from '../_shared/response.ts'
import { user } from '../_shared/user.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const id = await user(req)
	if (!id) return err('Unauthorized', 401)

	let { messages } = await req.json()

	const response = await sort(messages)

	return respond(response)
})