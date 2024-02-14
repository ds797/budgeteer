import { redirect } from '@sveltejs/kit'

export const GET = async ({ url: { searchParams }, locals: { supabase, paid } }) => {
	const token_hash = searchParams.get('token_hash')
	const type = searchParams.get('type')

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		})

		if (!error) {
			if (await paid()) throw redirect(303, '/')
			else throw redirect(303, '/pay')
		}

		throw redirect(303, `/?error=${encodeURIComponent(error)}`)
	}

	throw redirect(303, `/?error=${encodeURIComponent('Authentication error')}`)
}