import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession, paid } }) => {
	if (await paid()) throw redirect(303, '/budget')
	if (!await getSession()) throw redirect(303, '/')
}