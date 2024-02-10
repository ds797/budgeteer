import { redirect } from '@sveltejs/kit'

export const load = async () => {
	// TODO: poll server?
	await new Promise(r => {
		setTimeout(r, 5000)
	})

	throw redirect(303, '/')
}