import { redirect } from '@sveltejs/kit'

export const GET = async ({ url: { searchParams }, locals: { supabase } }) => {
	const token_hash = searchParams.get('token_hash')
	const type = searchParams.get('type')
	const next = searchParams.get('next') ?? '/'

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({
			type,
			token_hash,
		})
		if (!error) {
			throw redirect(303, '/')
		}
	}

	// return the user to an error page with some instructions
	throw redirect(303, '/auth/error')
}