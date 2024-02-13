import { Configuration, PlaidApi, PlaidEnvironments } from 'npm:plaid'
import { service } from '../_shared/service.ts'
import { v4 as uuidv4 } from 'npm:uuid'

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
			category: t.personal_finance_category
		}
	})
}

export const getLinks = async (user_id: string, predicate: any = () => true) => {
	const { data, error } = await service.from('links').select('*')
	if (error) throw new Error(error.message)

	const links = data.filter((l: any) => l.user_id === user_id)
	links.forEach((l: any) => {
		delete l.access_token
		delete l.cursor
	})

	return links.filter((l: any) => predicate(l))
}

export const setLinks = async (user_id: string, ...links: any[]) => {
	for (const link of links) {
		link.user_id = user_id

		// id, access_token, institution, name, accounts, transactions
		const { error } = await service.from('links').upsert(link)
		if (error) throw new Error(error)
	}
}

export const removeLinks = async (user_id: string, ...ids: string[]) => {
	const { data, error } = await service.from('links').select('*')
	if (error) throw new Error(error.message)

	const links = data.filter((l: any) => l.user_id === user_id && ids.find(id => id === l.id))

	for (const link of links) {
		const { error } = await service.from('links').delete().match({ id: link.id })
		if (error) throw new Error(error)

		const { access_token } = link

		try {
			const response = await plaid.itemRemove({ access_token })
			if (response.status != 200) throw new Error(response.error)
		} catch (error) {
			throw new Error(error)
		}
	}
}

const refreshLink = async (user_id: string, id: string, access_token: string, cursor: string|null, transactions: any[]) => {
	let link: any = {
		id,
		institution: '',
		access_token,
		cursor,
		name: '',
		accounts: [],
		transactions: []
	}

	const request: any = { access_token }

	try {
		// Get item
		const { data: { item } } = await plaid.itemGet(request)

		// Get accounts
		const { data: { accounts } } = await plaid.accountsGet(request)

		// Get institution name
		const { data: { institution: { name } } } = await plaid.institutionsGetById({
			institution_id: item.institution_id,
			country_codes: ['US', 'GB', 'ES', 'NL', 'FR', 'IE', 'CA', 'DE', 'IT', 'PL', 'DK', 'NO', 'SE', 'EE', 'LT', 'LV', 'PT', 'BE']
		})

		link.institution = item.institution_id
		link.name = name

		// TODO: refresh transactions? (expensive, but this code will do it)
		// await plaid.transactionsRefresh(request)

		// Get transactions
		let added: any[] = []
		let modified: any[] = []
		let removed: any[] = []
		let more = true

		request.options = { include_personal_finance_category: true }
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

		link.accounts = accounts
		link.transactions = transactions

		await service.from('links').upsert({
			user_id,
			...link
		})

		delete link.access_token
		delete link.cursor

		return link
	} catch (error) {
		throw new Error(error?.response?.statusText ?? error ?? 'Bad request')
	}
}

export const refreshLinks = async (user_id: string, predicate: Function|undefined = () => true) => {
	const { data, error } = await service.from('links').select('*')
	if (error) throw new Error(error)

	let links = data.filter((l: any) => predicate(l))

	for (let i = 0; i < links.length; i++) {
		let { id, access_token, cursor, transactions } = links[i]
		if (!access_token) continue

		if (transactions) {
			if (typeof transactions === 'string')
				transactions = JSON.parse(transactions)
		} else {
			const l = await getLinks(user_id, (l: any) => l.id === id)
			if (!l?.length) transactions = []
			else transactions = l.transactions
		}

		links[i] = await refreshLink(user_id, id, access_token, cursor, transactions)
	}

	return links
}

export const createLinks = async (user_id: string, ...tokens: any[]) => {
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

				if ((await getLinks(user_id, (l: any) => l.institution === item.institution_id)).length) throw new Error('Link already exists!')

				const data = await refreshLink(user_id, uuidv4(), access_token, null, [])

				return data
			}
		} catch (error) {
			throw new Error(error)
		}
	}
}