import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession, paid } }) => {
	if (!await getSession() || await paid()) throw redirect(303, '/')
}