import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL } from '$env/static/public'
import { SECRET_SUPABASE_KEY } from '$env/static/private'

export const POST = async event => {
	const { session } = await event.request.json()

	const user_id = session?.user?.id
	console.log('Cancelling subscription', user_id)

	if (!user_id) return new Response(JSON.stringify({ type: 'error', message: 'Couldn\'t find a user to unsubscribe' }))

	const supabase = createClient(PUBLIC_SUPABASE_URL, SECRET_SUPABASE_KEY)

	const get = await supabase.from('payments').select('*')
	if (get.error) console.error(get.error)

	const remove = await supabase.from('payments').delete().eq('user_id', user_id)
	if (remove.error) console.error(remove.error)

	const id = get.data.filter(payment => payment.user_id === user_id)[0].subscription_id

	await event.locals.stripe.subscriptions.cancel(id)

	return new Response(JSON.stringify({ type: 'success', message: 'You\'ve successfully unsubscribed from Budgeteer!' }), { status: 200 })
}