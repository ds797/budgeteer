import { cors } from '../_shared/cors.ts'
import { sort } from '../_shared/openai.ts'
import { createAnon } from '../_shared/anon.ts'
import { respond, err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	let { messages } = await req.json()

	const response = await sort(messages)

	return respond(response)
})