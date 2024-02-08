import { redirect } from '@sveltejs/kit'

export const GET = async ({ url: { searchParams }, locals: { supabase, paid } }) => {
	const token_hash = searchParams.get('token_hash')
	const type = searchParams.get('type')

	if (token_hash && type) {
		const { data, error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		})

		if (!error) {
			if (paid(data.user.id)) throw redirect(303, '/')
			else throw redirect(303, '/pay')
		}
	}

	// return the user to an error page with some instructions
	throw redirect(303, '/auth/error')
}