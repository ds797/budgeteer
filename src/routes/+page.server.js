import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession, paid } }) => {
	const sesh = await getSession()
	if (!sesh) return

	const { user: { id } } = sesh

	// User isn't paying
	if (!paid(id)) throw redirect(303, '/pay')
}