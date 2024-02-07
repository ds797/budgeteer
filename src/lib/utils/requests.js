import { get } from 'svelte/store'
import { notifications } from '$lib/stores/ui'

export const post = async (url = '', data, f) => {
	let options = {}

	f = f ?? fetch

	if (data)
		options = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		}
	else
		options = { method: 'POST' }
	const response = await f(url, options)

	const res = await response.json()
	if (res.error) {
		notifications.set([...get(notifications), { type: 'error', message: res.error, status: res.status }])
		return undefined
	}

	return res
}