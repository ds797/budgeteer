import Stripe from 'stripe'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY } from '$env/static/public'
import { PLAID_CLIENT_ID, PLAID_SECRET, PLAID_ENVIRONMENT } from '$env/static/private'

export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_KEY,
		event,
	})

	/**
	 * A convenience helper so we can just call await getSession() instead const { data: { session } } = await supabase.auth.getSession()
	 */
	event.locals.getSession = async () => {
		const {
			data: { session },
		} = await event.locals.supabase.auth.getSession()
		return session
	}

	event.locals.paid = async () => {
		const { data, error } = await event.locals.supabase.functions.invoke('paid')
		if (data?.data) return true

		return false
	}

	const plaidConfig = new Configuration({
		basePath: PlaidEnvironments[PLAID_ENVIRONMENT],
		baseOptions: {
			headers: {
				'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
				'PLAID-SECRET': PLAID_SECRET
			}
		}
	})

	// Plaid client
	event.locals.plaid = new PlaidApi(plaidConfig)

	event.locals.stripe = new Stripe('sk_test_51OfvXCBA2iuGdMvmDaiczZAH0QCksuhTNU0fRJXrUI46YNlo6Y8xobgkZn7xtKhudiTBybtpNisbIvPV2wSNZ01q00q8FfK3zs')

	event.locals.getLink = async id => {
		// id, access_token, institution, name, accounts, transactions
		const { data, error } = await event.locals.supabase.from('links').select('*')

		if (error) throw new Error(error)

		return data.find(l => l.id === id)
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range'
		},
	})
}