export const POST = async event => {
	const { id } = await event.request.json()

	const { data, error: supabaseError } = await event.locals.supabase.from('links').select('id, access_token')

	if (supabaseError) return new Response(JSON.stringify({ error: supabaseError }), { status: 400 })

	const index = data.findIndex(l => l.id === id)
	if (index === -1) return new Response(JSON.stringify({ error: 'Invalid link ID' }), { status: 400 })

	const { access_token } = data[index]

	// Unlink
	try {
		const response = await event.locals.plaid.itemRemove({
			access_token
		})

		if (response.status != 200) return new Response(JSON.stringify({ status: 'error' }), { status: 500 })

		return new Response(JSON.stringify({ status: 'success' }), { status: 200 })
	} catch (error) {
		return new Response(JSON.stringify({ error, status: 400 }), { status: 200 })
	}

}