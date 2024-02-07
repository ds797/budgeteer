// export const POST = async event => {
// 	const { item } = await event.request.json()

// 	const { data, error } = await event.locals.supabase.from('links').select('*').eq('item', item).select('access_token, transactions, cursor')

// 	const token = data[0].access_token
// 	let transactions = data[0].transactions ?? []
// 	let balance = 0
// 	let cursor = data[0].cursor ?? null

// 	if (error) throw new Error(error)

// 	let added = []
// 	let modified = []
// 	let removed = []
// 	let more = true

// 	// Get transactions
// 	try {
// 		while (more) {
// 			let request = { access_token: token }

// 			await event.locals.plaid.transactionsRefresh(request)
// 			const { data: a } = await event.locals.plaid.accountsBalanceGet(request)
// 			request.cursor = cursor
// 			const { data: t } = await event.locals.plaid.transactionsSync(request)

// 			balance = a.accounts[0].balances.available

// 			added = [...added, ...t.added]
// 			modified = [...modified, ...t.modified]
// 			removed = [...removed, ...t.removed]
// 			more = t.has_more

// 			cursor = t.next_cursor
// 		}

// 		// Remove
// 		transactions.filter(t => !removed.some(r => r.transaction_id === t.transaction_id))
// 		// Modify
// 		transactions.map(t =>
// 			modified.some(r => r.transaction_id === t.transaction_id)
// 			? modified.find(r => r.transaction_id === t.transaction_id)
// 			: t
// 		)
// 		// Add
// 		transactions = [...transactions, ...added]

// 		// Update database
// 		await event.locals.supabase.from('links').insert(item)

// 		delete item.access_token
// 	} catch (error) {
// 		return new Response(JSON.stringify({ error }), { status: 500 })
// 	}

// 	return new Response(JSON.stringify({ transactions, balance }), { status: 200 })
// }