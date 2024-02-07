import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession } }) => {
	if (!await getSession()) throw redirect(303, '/')
}