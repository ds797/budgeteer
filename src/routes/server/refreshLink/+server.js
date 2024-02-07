export const POST = async event => {
	const { id } = await event.request.json()

	const { data, error: supabaseError } = await event.locals.supabase.from('links').select('id, access_token, cursor')

	if (supabaseError) return new Response(JSON.stringify({ error: supabaseError }), { status: 400 })

	const index = data.indexOf(l => l.id === id)
	if (index === -1) return new Response(JSON.stringify({ error: 'Invalid link ID' }), { status: 400 })

	const { access_token, cursor } = data[index]

	const { error: plaidError } = await event.locals.refreshLink(id, access_token, cursor)

	if (plaidError) return new Response(JSON.stringify({ error: plaidError.error, status: plaidError.status ?? 400 }), { status: 200 })

	return new Response(JSON.stringify(transactions), { status: 200 })
}