import { cors } from '../_shared/cors.ts'
import { plaid, get, set, remove, refresh, create } from '../_shared/plaid.ts'
import { user } from '../_shared/user.ts'
import { service } from '../_shared/service.ts'
import { respond, err } from '../_shared/response.ts'

const format = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}`

const investments = async (user_id: string, ids: any[]) => {
	const links = await get(user_id, (l: any) => ids.find((m: any) => m === l.id), { secrets: true })
	const holdings: any = []
	const transactions: any = []
	const start: Date = new Date()
	start.setDate(-7)
	const end: Date = new Date()
	for (const { id, access_token, institution } of links) {
		if (!institution) continue

		try {
			const { data: hs } = await plaid.investmentsHoldingsGet({ access_token })
			const { data: ts } = await plaid.investmentsTransactionsGet({
				access_token,
				start_date: format(start),
				end_date: format(end)
			})
			holdings.push({ id, holdings: hs.holdings, securities: hs.securities })
			transactions.push(ts.investment_transactions)
		} catch (error) {
			if (error.response)
				if (error.response.data.error_type === 'ITEM_ERROR') continue
				else throw new Error(error.response.data.error_message)
			throw new Error(error.message)
		}
	}

	const { error } = await service.from('investments').upsert(holdings.map((h: any) => {
		return { ...h, user_id, transactions: transactions.filter((t: any) => t.account_id === h.account_id).flat() }
	}))
	if (error) throw new Error(error.message)

	return { ...holdings, transactions: transactions.flat() }
}

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