import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession, paid } }) => {
	const sesh = await getSession()
	if (!sesh) return

	// User isn't paying
	if (!await paid()) throw redirect(303, '/pay')
}