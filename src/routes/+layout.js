import { get } from 'svelte/store'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY, PUBLIC_STRIPE_KEY } from '$env/static/public'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import Links from '$lib/classes2/Links'
import { links } from '$lib/stores/user'
import { queue, notifications } from '$lib/stores/ui'
import { post } from '$lib/utils/requests'

export const load = async ({ fetch, data, depends }) => {
	depends('supabase:auth')

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event: { fetch },
		serverSession: data.session,
	})

	const { data: { session } } = await supabase.auth.getSession()

	const invoke = async (name, payload) => {
		let data, error
		if (!payload) ({ data, error } = await supabase.functions.invoke(name))
		else ({ data, error } = await supabase.functions.invoke(name, { body: payload }))
		if (error) return { error }

		({ data, error } = data)
		if (error) return { error }

		return data
	}

	supabase.invoke = invoke

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
		await invoke('removeLink', { id })
	}

	plaid.link = async () => {
		const { data: token, error } = await invoke('generateLinkToken')

		return new Promise((resolve, reject) => {
			const handler = Plaid.create({
				token,
				onSuccess: async (token, metadata) => {
					resolve({ token, metadata })
				},
				onExit: (err, metadata) => {
					// console.log(
					// 	`Exited early. Error: ${JSON.stringify(err)} Metadata: ${JSON.stringify(
					// 		metadata
					// 	)}`
					// )

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
		const { data, error } = await supabase.functions.invoke('refreshLinks', {
			body: { predicate: () => true }
		})
		if (error) console.error(error)

		({ data, error } = data)
		if (error) console.error(error)

		return data ?? []
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

	return { supabase, session, plaid, storage }
}