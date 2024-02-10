import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SECRET_SUPABASE_KEY } from '$env/static/private'
import { createClient } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'

export const load = async () => {
	// TODO: poll server?
	await new Promise(r => {
		setTimeout(r, 5000)
	})

	throw redirect(303, '/')
}