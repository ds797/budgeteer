import { Configuration, PlaidApi, PlaidEnvironments } from 'npm:plaid'
import { service } from '../_shared/service.ts'
import { err } from './response.ts'

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
			category: t.category
		}
	})
}

export const getLink = async (id: string) => {
	// id, access_token, institution, name, accounts, transactions
	const { data, error } = await service.from('links').select('*')

	if (error) throw new Error(error)

	return data.find((l: any) => l.id === id)
}

export const setLink = async (anon: any, link: any) => {
	// id, access_token, institution, name, accounts, transactions
	const { error } = await anon.from('links').upsert(link)

	if (error) throw new Error(error)
}
export const refreshLink = async (anon: any, id: string, access_token: any, cursor: any, transactions: any) => {
	let link: {
		id: string;
		institution: string;
		name: string;
		accounts: any[];
		transactions: any[];
	} = {
		id,
		institution: '',
		name: '',
		accounts: [],
		transactions: []
	}

	const request: any = { access_token }

	if (transactions) {
		if (typeof transactions === 'string')
			transactions = JSON.parse(transactions)
	} else {
		const l = await getLink(id)
		if (!l?.length) transactions = []
		else transactions = l.transactions
	}

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

		while (more) {
			request.cursor = cursor
			const response = await plaid.transactionsSync(request)

			const { status, data: transactions } = response

			if (status != 200) throw new Error(`Server not OK (${status}`)

			added = [...added, ...transactions.added]
			modified = [...modified, ...transactions.modified]
			removed = [...removed, ...transactions.removed]
			more = transactions.has_more

			cursor = transactions.next_cursor
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

		setLink(anon, {
			...link,
			access_token,
			cursor
		})

		return { data: link }
	} catch (error) {
		return { error: { message: error?.response?.statusText ?? error ?? 'Bad request', status: error?.response?.statusCode ?? 400 } }
	}
}