export const POST = async event => {
	const { predicate } = await event.request.json()

	const { data, error: supabaseError } = await event.locals.supabase.from('links').select('id, access_token, transactions, cursor')

	if (supabaseError) return new Response(JSON.stringify({ error: supabaseError.message, status: 400 }), { status: 200 })

	let build = []

	for (let { id, access_token, cursor, transactions } of data) {
		if (!access_token) continue

		const { link, error: plaidError } = await event.locals.refreshLink(id, access_token, cursor, transactions)

		if (plaidError) return new Response(JSON.stringify({ error: plaidError.error, status: plaidError.status ?? 400 }), { status: 200 })

		build.push(link)
	}

	if (predicate) build = build.filter(l => predicate(l))

	return new Response(JSON.stringify(build), { status: 200 })
}