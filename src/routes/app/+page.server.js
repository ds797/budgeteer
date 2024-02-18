import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession } }) => {
	const sesh = await getSession()

	if (!sesh) throw redirect(303, '/')
}