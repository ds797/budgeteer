// import { browser } from '$app/environment'
import { get, writable } from 'svelte/store'

export const route = writable({ current: { loading: true } })

// Types: 'success', 'warning', 'info', 'error'
const createNotifications = () => {
	let notis = []
	const { subscribe, set, update } = writable(notis)

	return {
		subscribe,
		set,
		update,
		add: ({ type, message }) => {
			const notis = [...get(notifications), { type, message }]
			// localStorage.setItem('notifications', JSON.stringify(notis))
			set(notis)
		},
		remove: index => {
			const notis = [...get(notifications)]
			notis.splice(index, 1)
			// localStorage.setItem('notifications', JSON.stringify(notis))
			set(notis)
		}
	}
}

export const notifications = createNotifications()

export const serving = writable(false)

const createQueue = () => {
	const queue = []

	const run = async () => {
		if (queue.length == 0 || get(serving)) return

		serving.set(true)

		while (queue.length) {
			const f = queue[0]
			try {
				await f()
			} catch (error) {
				notifications.set([...get(notifications), { type: 'error', message: error }])
			}
			queue.shift()
		}

		serving.set(false)
	}

	const { subscribe, set, update } = writable(queue)

	return {
		subscribe,
		set,
		update,
		enq: f => {
			for (const g of queue)
				if (f.toString() === g.toString()) return
			queue.push(f)
			run()
		},
		deq: () => queue.pop()
	}
}

export const queue = createQueue()