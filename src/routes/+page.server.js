import { get } from 'svelte/store'
import { redirect } from '@sveltejs/kit'
import { createClient } from '@supabase/supabase-js'
import { notifications } from '$lib/stores/ui'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SECRET_SUPABASE_KEY } from '$env/static/private'

export const load = async ({ locals: { getSession } }) => {
	const sesh = await getSession()
	if (!sesh) return

	const { user: { id: session } } = sesh

	const supabase = createClient(PUBLIC_SUPABASE_URL, SECRET_SUPABASE_KEY)

	const get = await supabase.from('payments').select('*')
	if (get.error) console.error(get.error)

	const data = get.data.filter(p => p.user_id === session)

	// console.log('got data', data)

	// const payment = (data ?? []).find(p => p.user_id === session)

	// User isn't paying
	if (!data[0]?.paid) throw redirect(303, '/pay')
}