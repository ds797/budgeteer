export const POST = async event => {
	let { messages } = await event.request.json()

	const response = await event.locals.sort(messages)

	return new Response(JSON.stringify({ message: response }), { status: 200 })
}