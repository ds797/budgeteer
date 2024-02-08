import OpenAI from 'openai'
import Stripe from 'stripe'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public'
import { SECRET_SUPABASE_KEY, PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENVIRONMENT } from '$env/static/private'
import { SECRET_OPENAI_KEY } from '$env/static/private'
import { toTransaction } from '$lib/utils/convert'

export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event,
	})

	/**
	 * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
	 */
	event.locals.getSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession()
		return session
	}

	event.locals.paid = async id => {
		const supabase = createClient(PUBLIC_SUPABASE_URL, SECRET_SUPABASE_KEY)

		const get = await supabase.from('payments').select('*')
		if (get.error) console.error(get.error)

		const data = get.data.filter(p => p.user_id === id)

		return data[0]?.paid
	}

	const plaidConfig = new Configuration({
		basePath: PlaidEnvironments[PLAID_ENVIRONMENT],
		baseOptions: {
			headers: {
				'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
				'PLAID-SECRET': PLAID_SECRET
			}
		}
	})

	// Plaid client
	event.locals.plaid = new PlaidApi(plaidConfig)

	event.locals.openai = new OpenAI({
		apiKey: SECRET_OPENAI_KEY
	})

	event.locals.stripe = new Stripe('sk_test_51OfvXCBA2iuGdMvmDaiczZAH0QCksuhTNU0fRJXrUI46YNlo6Y8xobgkZn7xtKhudiTBybtpNisbIvPV2wSNZ01q00q8FfK3zs')

	event.locals.sort = async message => {
		const instructions = `This model takes transactions that have associated metadata and re-categorizes them into user-defined categories. The input is a JSON object with two properties: 'transactions', which is the array of transactions to sort, and 'user_groups', which is the array of category groups the transactions must be sorted into. Each transaction is an object with three properties: 'name', 'merchant', and 'general_categories'. Use this data to determine which group and category from 'user_groups' fits the transaction best. Return a JSON object which has a single property: 'sorted', an array of objects each with the following properties: 'group' and 'category'. The group and category are the ones you chose for the transaction. They MUST be chosen from user_groups.`
		const instructions2 = `You're an assistant that sorts transactions for a budgeting application. You're given an object in JSON format with two keys: 'transactions' and 'user_defined'. 'user_defined' is an array of category groups, that the user created, each category group has an array of categories. 'transactions' is an array of transactions, each with a name, merchant, and general_categories. General categories is determined by a third party. What you need to do is return a JSON object with one property: 'sorted', which is an array of objects. Each object has two properties: 'group' and 'category', both of which are determined by taking the three parameters of each transaction into account and finding the best-fitting category and category group of the ones provided in 'user_defined'. Importantly, you're not to use any categories provided in each transaction's 'general_categories' field -- as you're sorting these transactions for a budgeting app, they need to be sorted into the user_defined groups and categories. Also, each category MUST be a subcategory of the group you choose -- don't choose a category that's a subcategory of a different group.`
		try {
			const completion = await event.locals.openai.chat.completions.create({
				messages: [{
					role: 'system',
					content: instructions
				}, {
					role: 'user',
					content: JSON.stringify(message),
				}],
				model: 'gpt-3.5-turbo-1106',
				response_format: { type: 'json_object' }
			})

			return completion.choices[0].message.content
		} catch (error) {
			return { error: 'Error sorting transactions' }
		}
	}

	event.locals.getLink = async id => {
		// id, access_token, institution, name, accounts, transactions
		const { data, error } = await event.locals.supabase.from('links').select('*')

		if (error) throw new Error(error)

		return data.find(l => l.id === id)
	}

	event.locals.setLink = async link => {
		// link.transactions = JSON.stringify(link.transactions)

		// id, access_token, institution, name, accounts, transactions
		const { error } = await event.locals.supabase.from('links').upsert(link)

		if (error) throw new Error(error)
	}

 	event.locals.refreshLink = async (id, access_token, cursor, transactions) => {
		let link = { id }

		const request = { access_token }

		if (transactions) {
			if (typeof transactions === 'string')
				transactions = JSON.parse(transactions)
		} else {
			const l = await event.locals.getLink(id)
			if (!l?.length) transactions = []
			else transactions = l.transactions
		}

		try {
			// Get item
			const { data: { item } } = await event.locals.plaid.itemGet(request)

			// Get accounts
			const { data: { accounts } } = await event.locals.plaid.accountsGet(request)

			// Get institution name
			const { data: { institution: { name } } } = await event.locals.plaid.institutionsGetById({
				institution_id: item.institution_id,
				country_codes: ['US', 'GB', 'ES', 'NL', 'FR', 'IE', 'CA', 'DE', 'IT', 'PL', 'DK', 'NO', 'SE', 'EE', 'LT', 'LV', 'PT', 'BE']
			})

			link.institution = item.institution_id
			link.name = name

			// TODO: refresh transactions? (expensive, but this code will do it)
			// await event.locals.plaid.transactionsRefresh(request)

			// Get transactions
			let added = []
			let modified = []
			let removed = []
			let more = true

			while (more) {
				request.cursor = cursor
				const response = await event.locals.plaid.transactionsSync(request)

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
			transactions.filter(t => !removed.some(r => r.transaction_id === t.transaction_id))
			// Modify
			transactions.map(t =>
				modified.some(r => r.transaction_id === t.transaction_id)
				? { ...t, ...modified.find(r => r.transaction_id === t.transaction_id) }
				: t
			)
			// Add
			transactions = [...transactions, ...added]

			link.accounts = accounts
			link.transactions = transactions

			event.locals.setLink({
				...link,
				access_token,
				cursor
			})

			return { link }
		} catch (error) {
			console.error(error)
			return { error: { status: error?.response?.statusCode ?? 400, error: error?.response?.statusText ?? 'Bad request' } }
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range'
		},
	})
}