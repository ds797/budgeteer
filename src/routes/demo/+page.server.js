import { redirect } from '@sveltejs/kit'

export const load = async ({ locals: { getSession }, route }) => {
	const sesh = await getSession()

	if (sesh && route.id === '/demo')
		throw redirect(303, '/')
}