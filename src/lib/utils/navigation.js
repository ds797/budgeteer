import { goto as reroute } from '$app/navigation'
import { browser } from '$app/environment'
import { loading } from '$lib/stores/ui'

export const goto = async route => {
	if (!browser) return
	loading.set(true)
	await reroute(route)
	loading.set(false)
}