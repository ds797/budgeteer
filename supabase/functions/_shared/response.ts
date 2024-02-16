import { cors } from './cors.ts'

export const respond = data => {
	return new Response(JSON.stringify({ data }), {
		headers: { ...cors, 'Content-type': 'application/json', "x-content-type-options": "nosniff" },
		status: 200
	})
}

export const err = (message: string, status: number) => {
	console.error({ message, status })
	return new Response(JSON.stringify({ error: { message: message ?? 'Unknown error', status: status ?? 400 } }), {
		headers: { ...cors, 'Content-type': 'application/json', "x-content-type-options": "nosniff" },
		status: 200
	})
}