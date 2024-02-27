import { get } from 'svelte/store'
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import { links } from '$lib/stores/user'
import { queue, notifications } from '$lib/stores/ui'

// export const ssr = false

const PUBLIC_SUPABASE_URL = 'https://mabqpjflhufudqpifesa.supabase.co'
const PUBLIC_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnFwamZsaHVmdWRxcGlmZXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ4NDA0NzIsImV4cCI6MjAyMDQxNjQ3Mn0.1SppoHM5zG3j-P_RbaSOYaf7QyrJ00RxouWS34_c148'

export const load = async ({ fetch, data, depends, url }) => {
	depends('supabase:auth')

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event: { fetch },
		serverSession: data.session,
	})

	const { data: { session } } = await supabase.auth.getSession()

	const invoke = async (name, payload) => {
		let response
		if (!payload) response = await supabase.functions.invoke(name)
		else response = await supabase.functions.invoke(name, { body: payload })
		if (response.error) {
			console.error(response.error)
			notifications.add({ type: 'error', message: response.error })
			return {}
		}

		const { data, error } = response.data
		if (error) {
			console.error(error)
			notifications.add({ type: 'error', message: error.message })
			return {}
		}

		return { data }
	}
	supabase.invoke = invoke

	const paid = async () => {
		let paid = false
		if ((await invoke('paid'))?.data) paid = true

		return paid
	}

	let paying = await paid()

	let storage = {}

	storage.get = key => {
		let data = localStorage.getItem(key)
		if (!data) return

		data = JSON.parse(data)

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
		const { data, error } = await supabase.invoke('links', { type: { get: true } })

		if (error) console.error(error)

		// There's no "custom" link -- add it
		if (!data.find(l => !l.institution)) data.push(get(links).custom())

		return data ?? []
	}

	supabase.setLinks = async links => {
		const { error } = await supabase.invoke('links', { type: { set: links.links } })

		if (error) throw new Error(error)
	}

	let plaid = {}

	plaid.unlink = async id => {
		await invoke('links', { type: { remove: [id] } })
	}

	plaid.link = async () => {
		const { data: token } = await invoke('links', { type: { token: true } })

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
		const { data } = await invoke('links', { type: { refresh: true } })

		return data ?? []
	}

	supabase.updateLinks = () => {
		if (!paying) return

		const update = async () => {
			storage.set('links', get(links))
			await supabase.setLinks(get(links))
		}
		if (get(queue).find((f, i) => i !== 0 && f.toString() === update.toString())) return

		queue.enq(update)
		queue.set(get(queue))
	}

	supabase.updateBudgets = () => {
		if (!paying) return

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

	const { pathname } = url

	return { supabase, session, plaid, storage, pathname, demo: !session, paid, paying }
}