import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit'

const PUBLIC_SUPABASE_URL = 'https://mabqpjflhufudqpifesa.supabase.co'
const PUBLIC_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnFwamZsaHVmdWRxcGlmZXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ4NDA0NzIsImV4cCI6MjAyMDQxNjQ3Mn0.1SppoHM5zG3j-P_RbaSOYaf7QyrJ00RxouWS34_c148'

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
		const { data } = await event.locals.supabase.functions.invoke('paid')
		if (data?.data) return true

		return false
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range'
		},
	})
}