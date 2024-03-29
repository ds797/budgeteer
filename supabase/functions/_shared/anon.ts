import { createClient } from 'npm:@supabase/supabase-js@2'

export const createAnon = req => createClient(
	Deno.env.get('SUPABASE_URL') ?? '',
	Deno.env.get('SUPABASE_ANON_KEY') ?? '',
	{ global: { headers: { Authorization: req.headers.get('Authorization')! } } }
)