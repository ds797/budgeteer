import { Configuration, PlaidApi, PlaidEnvironments } from 'npm:plaid'
import { service } from '../_shared/service.ts'
import { storage } from '../_shared/storage.ts'
import { v4 as uuidv4 } from 'npm:uuid'

const format = (d: Date) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}`

const plaidConfig = new Configuration({
	basePath: PlaidEnvironments[Deno.env.get('SECRET_PLAID_ENV') ?? ''],
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': Deno.env.get('SECRET_PLAID_ID'),
			'PLAID-SECRET': Deno.env.get('SECRET_PLAID_KEY')
		}
	}
})

export const plaid = new PlaidApi(plaidConfig)

const toTransaction = (...transactions: any[]) => {
	return transactions.map(t => {
		return {
			id: t.transaction_id,
			amount: t.amount,
			date: t.authorized_date ?? t.date,
			account: t.account_id,
			merchant: t.merchant_name,
			name: t.name,
			pfc: t.personal_finance_category
		}
	})
}

export const get = async (user_id: string, predicate: Function = () => true, options: any = {}) => {
	const { data, error } = await service.from('links').select('*')
	if (error) throw new Error(error)

	const links = data.filter((l: any) => l.user_id === user_id).filter(predicate)

	if (options.logos)
		for (const link of links)
			link.logo = await storage.get(link.institution)

	if (!options.secrets)
		for (const link of links) {
			delete link.access_token
			delete link.cursor
		}

	return links
}

export const set = async (user_id: string, ...links: any) => {
	// Sort by ID
	links = links.toSorted((l1: any, l2: any) => l1.id.localeCompare(l2.id))

	let tokens: any[] = []
	for (const link of links) {
		// Custom link, ignore
		if (!link.institution) continue

		if (!link.access_token) tokens.push(link.id)
	}

	let secrets = []

	// Fetch access_tokens and cursors for those links that need them
	if (tokens.length) secrets = await get(user_id, (l: any) => tokens.find(id => id === l.id), { secrets: true })

	for (const link of links) {
		delete link.logo

		// Access token was found, don't use secret
		if (link.access_token) {
			const res = await service.from('links').upsert({
				user_id,
				...link
			})
			if (res.error) throw new Error(res.error)
		// Access token wasn't found, use secret
		} else {
			const secret: any = secrets.find((s: any) => s.id === link.id)

			// Optional chaining in the case of a custom link
			const res = await service.from('links').upsert({
				user_id,
				...link,
				access_token: secret?.access_token ?? '',
				cursor: secret?.cursor ?? null
			})
			if (res.error) throw new Error(res.error)
		}
	}
}

export const remove = async (user_id: string, predicate: Function = () => false) => {
	const { data, error } = await service.from('links').select('*')
	if (error) throw new Error(error.message)

	const links = data.filter((l: any) => l.user_id === user_id).filter(predicate)

	for (const link of links) {
		const { access_token } = link

		try {
			const response = await plaid.itemRemove({ access_token })
			if (response.status != 200) throw new Error(response.error)
		} catch (error) {
			throw new Error(error)
		}
		const { error } = await service.from('links').delete().match({ id: link.id })
		if (error) throw new Error(error)
	}
}

const update = async (user_id: string, id: string, access_token: string, cursor: string|null, transactions: any[]) => {
	// Link
	let link: any = {
		id,
		institution: '',
		access_token,
		cursor,
		name: '',
		accounts: [],
		transactions: []
	}


	try {
		const request: any = { access_token }

		// Get item data
		const { data: { item } } = await plaid.itemGet(request)

		// Get accounts
		const { data: { accounts } } = await plaid.accountsGet(request)

		// Get institution name and logo
		let logo: string
		const { data: { institution } } = await plaid.institutionsGetById({
			institution_id: item.institution_id,
			country_codes: ['US', 'GB', 'ES', 'NL', 'FR', 'IE', 'CA', 'DE', 'IT', 'PL', 'DK', 'NO', 'SE', 'EE', 'LT', 'LV', 'PT', 'BE'],
			options: { include_optional_metadata: true }
		})

		link.institution = item.institution_id
		link.name = institution.name
		link.color = institution.primary_color
		logo = institution.logo

		// Upload logo
		await storage.set(link.institution, logo)

		// TODO: refresh transactions? (expensive, but this code will do it)
		// await plaid.transactionsRefresh(request)

		// Get transactions
		let added: any[] = []
		let modified: any[] = []
		let removed: any[] = []
		let more = true

		request.options = { include_personal_finance_category: true }
		// Loop until caught up
		while (more) {
			request.cursor = link.cursor
			const response = await plaid.transactionsSync(request)

			const { status, data: transactions } = response

			if (status != 200) throw new Error(`Server not OK (${status}`)

			added = [...added, ...transactions.added]
			modified = [...modified, ...transactions.modified]
			removed = [...removed, ...transactions.removed]
			more = transactions.has_more

			link.cursor = transactions.next_cursor
		}

		// Convert transactions to Budgeteer format
		added = toTransaction(...added)
		modified = toTransaction(...modified)

		// Remove
		transactions.filter((t: any) => !removed.some(r => r.transaction_id === t.transaction_id))
		// Modify
		transactions.map((t: any) =>
			modified.some(r => r.transaction_id === t.transaction_id)
			? { ...t, ...modified.find(r => r.transaction_id === t.transaction_id) }
			: t
		)
		// Add
		transactions = [...transactions, ...added]

		// Update link
		link.accounts = accounts
		link.transactions = transactions

		// Set link
		await set(user_id, link)

		// Remove secrets and add logo data
		link.logo = `data:image/png;base64,${logo}`
		delete link.access_token
		delete link.cursor

		return link
	} catch (error) {
		throw new Error(error?.response?.statusText ?? 'Bad request')
	}
}

export const refresh = async (user_id: string, predicate: Function|undefined = () => true) => {
	let links = await get(user_id, predicate, {
		logos: true,
		secrets: true
	})

	for (let link of links) {
		let { id, access_token, cursor, institution, transactions } = link
		if (!institution) continue

		if (transactions) {
			if (typeof transactions === 'string')
				transactions = JSON.parse(transactions)
		} else {
			const l = await get(user_id, (l: any) => l.id === id)
			if (!l?.length) transactions = []
			else transactions = l.transactions
		}

		link = await update(user_id, id, access_token, cursor, transactions)
	}

	links.forEach((l: any) => {
		delete l.access_token
		delete l.cursor
	})
	return links
}

export const create = async (user_id: string, ...tokens: any[]) => {
	for (const public_token of tokens) {
		// Get token
		try {
			const response = await plaid.itemPublicTokenExchange({
				public_token
			})
			if (response.data != null && response.data.access_token != null) {
				// Access token OK, fetch Item
				const access_token = response.data.access_token
				const { data: { item } } = await plaid.itemGet({ access_token })

				// Check if link exists
				if ((await get(user_id, (l: any) => l.institution === item.institution_id)).length) throw new Error('Link already exists!')

				const data = await update(user_id, uuidv4(), access_token, null, [])

				return data
			}
		} catch (error) {
			throw new Error(error)
		}
	}
}

export const investments = async (user_id: string, ids: any[]) => {
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