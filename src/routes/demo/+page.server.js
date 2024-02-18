import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession }, route }) => {
	if (await getSession()) throw redirect(303, '/app')
}