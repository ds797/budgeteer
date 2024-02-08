import { get } from 'svelte/store'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, PUBLIC_STRIPE_KEY } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import Links from '$lib/classes2/Links'
import { links } from '$lib/stores/user'
import { queue } from '$lib/stores/ui'
import { post } from '$lib/utils/requests'

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event: { fetch },
		serverSession: data.session,
	})

	const {
		data: { session },
	} = await supabase.auth.getSession()

	let storage = {}

	storage.get = key => {
		let data = localStorage.getItem(key)
		if (!data) return

		data = JSON.parse(data)
	
		if (key === 'links') return new Links(data)

		return data
	}

	storage.set = (key, data) => {
		data = JSON.stringify(data)
		localStorage.setItem(key, data)
	}

	supabase.refreshBudget = async budget => {
		const predicate = link => link.accounts.findIndex(a => budget.accounts.indexOf(a.account_id) !== -1)
		return await post('/server/refreshLinks', { predicate })
	}

	supabase.getBudgets = async () => {
		let { data, error } = await supabase.from('budgets').select('*')

		if (error) console.error(error)

		if (!data.length) return {}

		let budgets = JSON.parse(data[0].budgets)
		budgets.selected = budgets.budgets[budgets.selected]

		return budgets
	}

	supabase.setBudgets = async budgets => {
		budgets.selected = budgets.budgets.findIndex(b => b.name === budgets.selected.name)

		const { error } = await supabase.from('budgets').upsert({ budgets: JSON.stringify(budgets) })

		if (error) console.error(error)
	}

	supabase.getLinks = async () => {
		let { data, error } = await supabase.from('links').select('*')

		if (error) console.error(error)

		// There's no "custom" link -- add it
		if (!data.find(l => !l.institution)) data.push(new Links().custom())

		return data ?? []
	}

	supabase.setLinks = async links => {
		for (const link of links.links) {
			// id, institution, name, accounts, transactions
			const { error } = await supabase.from('links').upsert(link)

			if (error) throw new Error(error)
		}
	}

	let plaid = {}

	plaid.unlink = async id => {
		await post('/server/removeItem', { id })
	}

	plaid.link = async () => {
		const response = await post('/server/generateLinkToken')

		if (response === undefined) return { error: 'Link generation failure' }

		return new Promise((resolve, reject) => {
			const handler = Plaid.create({
				token: response.token,
				onSuccess: async (token, metadata) => {
					// TODO: Add notification to stack
					// Set Supabase item

					resolve({ token, metadata })
				},
				onExit: (err, metadata) => {
					console.log(
						`Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(
							metadata
						)}`
					)

					if (err) reject({ err, metadata })

					else resolve({ exit: true, metadata })

					// TODO: Add notification to stack
					// showOutput(`Link existed early with status ${metadata.status}`)
				}
			})
	
			handler.open()
		})
	}

	plaid.getLinks = async () => {
		storage.set('cooldown', new Date().getTime())
		return await post('/server/refreshLinks', { predicate: v => v })
	}

	supabase.updateLinks = () => {
		const update = async () => {
			storage.set('links', get(links))
			await supabase.setLinks(get(links))
		}
		if (get(queue).find((f, i) => i !== 0 && f.toString() === update.toString())) return

		queue.enq(update)
		queue.set(get(queue))
	}

	supabase.updateBudgets = () => {
		const update = async () => {
			storage.set('links', get(links))
			await supabase.setBudgets({
				budgets: get(links).budgets,
				selected: get(links).selected
			})
		}
		if (get(queue).find((f, i) => i !== 0 && f.toString() === update.toString())) return

		queue.enq(update)
		queue.set(get(queue))
	}

	let openai = {}

	openai.sort = async message => {
		return await post('/server/sortTransactions', { message })
	}

	return { supabase, session, plaid, storage, openai }
}