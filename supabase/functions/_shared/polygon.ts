import { restClient } from 'npm:@polygon.io/client-js'

export const polygon = restClient(Deno.env.get('SECRET_POLYGON_KEY'))

export const history = async (ticker: string, interval: string|undefined = 'day', multiplier: number|undefined = 1) => {
	if (['second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].indexOf(interval) === -1)
		throw new Error('Invalid interval!')

	const start = new Date()
	start.setDate(-8) // Week, inclusive
	const end = new Date()

	const data = await polygon.stocks.aggregates(ticker, multiplier, interval, start.getTime(), end.getTime())

	if (!data.resultsCount) throw new Error(`Couldn\'t fetch history for ${ticker}!`)

	return data
}