import { cors } from '../_shared/cors.ts'
import { user } from '../_shared/user.ts'
import { stripe } from '../_shared/stripe.ts'
import { service } from '../_shared/service.ts'
import { respond, err } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

	const user_id = await user(req)

	if (!user_id) return err('Couldn\'t find a user to unsubscribe', 0)

	const get = await service.from('payments').select('*')
	if (get.error) return err(get.error, 0)

	const remove = await service.from('payments').delete().eq('user_id', user_id)
	if (remove.error) return err(remove.error, 0)

	const id = get.data.filter((payment: any) => payment.user_id === user_id)[0].subscription_id

	try {
		await stripe.subscriptions.cancel(id)
	} catch (error) {
		return err(error, 0)
	}

	return respond({ type: 'success', message: 'You\'ve successfully unsubscribed from Budgeteer!' })
})