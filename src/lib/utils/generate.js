import Links from '$lib/classes/Links'
import { random, clamp } from '$lib/utils/math'
import { count } from '$lib/utils/date'

const dinners = (offset = 0) => {
	const today = new Date()

	const ts = []
	const options = [{
		name: 'Moonlit Serenade Bistro',
		price: { min: 50, max: 100 }
	}, {
		name: 'McD\'s',
		price: { min: 10, max: 25 }
	}, {
		name: 'Opulent Oasis Grill',
		price: { min: 25, max: 75 }
	}, {
		name: 'Petite Etoile Bistro',
		price: { min: 50, max: 125 }
	}, {
		name: 'The Velvet Fork',
		price: { min: 60, max: 100 }
	}, {
		name: 'Le Château Gastronomique',
		price: { min: 80, max: 120 }
	}]

	for (let i = 0; i < random(5, 3); i++) {
		const option = options[random(options.length - 1)]
		ts.push({
			id: `demo-dinner-${i}`,
			date: new Date(today.getFullYear(), today.getMonth() + offset, random(offset === 0 ? today.getDate() : count(today), 1)),
			name: option.name,
			account: 'demo-checking',
			amount: -random(option.price.max, option.price.min),
			properties: { group: 'Wants', category: 'Dinners Out' }
		})
	}

	return ts
}

const groceries = (offset = 0) => {
	const today = new Date()

	const ts = []
	const options = [{
		name: 'Kroger',
		price: { min: 50, max: 110 }
	}, {
		name: 'Trader Joe\'s',
		price: { min: 20, max: 45 }
	}, {
		name: 'Costco',
		price: { min: 100, max: 275 }
	}, {
		name: 'Whole Foods',
		price: { min: 50, max: 105 }
	}, {
		name: 'Walmart',
		price: { min: 60, max: 200 }
	}]

	for (let i = 0; i < random(4, 2); i++) {
		const option = options[random(options.length - 1)]
		ts.push({
			id: `demo-groceries-${i}`,
			date: new Date(today.getFullYear(), today.getMonth() + offset, random(offset === 0 ? today.getDate() : count(today), 1)),
			name: option.name,
			account: 'demo-checking',
			amount: -random(option.price.max, option.price.min),
			properties: { group: 'Needs', category: 'Groceries' }
		})
	}

	return ts
}

const paychecks = (value = random(2200, 1300), offset = 0) => {
	const today = new Date()

	const ts = []

	const count = offset === 0 ? clamp(Math.floor((today.getDate() - 1) / 14) + 1, { max: 2 }) : 2

	for (let i = 0; i < count; i++) {
		ts.push({
			id: `demo-paycheck-${i}`,
			date: new Date(today.getFullYear(), today.getMonth() + offset, i * 14 + 1),
			name: 'Paycheck',
			account: 'demo-checking',
			amount: value,
			properties: { group: 'Bills', category: 'Mortgage' }
		})
	}

	return ts
}

const investments = () => {
	const amount = 12
	const stocks = [{
		name: 'Budgeteer',
		ticker: 'BGTR',
		price: random(100, 125)
	}, {
		name: 'Microsoft',
		ticker: 'MSFT',
		price: random(400, 500)
	}, {
		name: 'Apple',
		ticker: 'AAPL',
		price: random(150, 225)
	}, {
		name: 'NVIDIA',
		ticker: 'NVDA',
		price: random(750, 850)
	}, {
		name: 'Amazon',
		ticker: 'AMZN',
		price: random(150, 200)
	}, {
		name: 'Alphabet',
		ticker: 'GOOG',
		price: random(100, 175)
	}, {
		name: 'Meta',
		ticker: 'META',
		price: random(450, 550)
	}, {
		name: 'Tesla',
		ticker: 'TSLA',
		price: random(175, 225)
	}, {
		name: 'AMD',
		ticker: 'AMD',
		price: random(175, 225)
	}, {
		name: 'Intel',
		ticker: 'INTC',
		price: random(35, 60)
	}, {
		name: 'PayPal',
		ticker: 'PYPL',
		price: random(50, 80)
	}, {
		name: 'Salesforce',
		ticker: 'CRM',
		price: random(275, 350)
	}, {
		name: 'Netflix',
		ticker: 'NFLX',
		price: random(550, 650)
	}, {
		name: 'Adobe',
		ticker: 'ADBE',
		price: random(525, 625)
	}, {
		name: 'Cisco',
		ticker: 'CSCO',
		price: random(40, 65)
	}, {
		name: 'IBM',
		ticker: 'IBM',
		price: random(150, 250)
	}, {
		name: 'UBER',
		ticker: 'UBER',
		price: random(70, 100)
	}, {
		name: 'SONY',
		ticker: 'SONY',
		price: random(80, 105)
	}, {
		name: 'Airbnb',
		ticker: 'ABNB',
		price: random(140, 200)
	}, {
		name: 'Shopify',
		ticker: 'SHOP',
		price: random(70, 100)
	}, {
		name: 'Spotify',
		ticker: 'SPOT',
		price: random(225, 300)
	}, {
		name: 'Cloudflare',
		ticker: 'NET',
		price: random(85, 125)
	}]

	const holdings = []
	const securities = []
	const transactions = []
	for (let i = 0; i < amount; i++) {
		const index = random(12 - i)
		const stock = stocks[index]
		let total = 0

		for (let j = 0; j < random(9, 3); j++) {
			const date = new Date()
			const offset = -random(date.getDate() - 1)
			date.setDate(date.getDate() + offset)
			const price = offset * 0.1 / 31 * stock.price // Upward trend
				+ (random(3) - 1) * 0.05 * stock.price // Variability`
				+ stock.price
			const quantity = ((total - 10) < 0 ? 1 : random(1) === 0 ? -1 : 1) * random(1, 10)
			total += quantity
			const amount = price * quantity

			transactions.push({
				account_id: 'demo-checking',
				security_id: stock.ticker,
				amount,
				date,
				price,
				type: amount < 0 ? 'sell' : 'buy',
				quantity
			})
		}

		stocks.splice(index, 1)
		holdings.push({
			account_id: 'demo-checking',
			security_id: stock.ticker,
			quantity: total
		})
		securities.push({
			security_id: stock.ticker,
			name: stock.name,
			ticker: stock.ticker,
			close_price: stock.price
		})
	}

	transactions.sort((a, b) => a - b)

	return [{
		id: 'demo-link',
		holdings,
		securities,
		transactions
	}]
}

export const generate = (links, data) => {
	const today = new Date()

	links = new Links({}, m => notifications.add({ type: 'error', message: m }), data.supabase.invoke)
	links.links = [{
		id: 'demo-link',
		name: 'Demo Link',
		institution: '',
		accounts: [{
			account_id: 'demo-checking',
			name: 'Demo Checking',
			balances: { available: 100 }
		}],
		transactions: []
	}]
	links.budgets = [links.default.budget()]
	links.selected = links.budgets[0]
	links.investments = investments()
	links.add.account('demo-checking')

	// Wants > Dinners
	let ts = [...dinners(), ...dinners(-1), ...dinners(-2), ...dinners(-3)]
	for (const t of ts) {
		links.add.transaction(t)
		links.links.find(l => l.id === 'demo-link').transactions.push(t)
	}

	// Needs > Groceries
	ts = [...groceries(), ...groceries(-1), ...groceries(-2), ...groceries(-3)]
	for (const t of ts) {
		links.add.transaction(t)
		links.links.find(l => l.id === 'demo-link').transactions.push(t)
	}

	const amount = random(2200, 1300)

	ts = [...paychecks(amount), ...paychecks(amount, -1), ...paychecks(amount, -2), ...paychecks(amount, -3)]
	for (const t of ts) {
		links.add.transaction(t)
		links.links.find(l => l.id === 'demo-link').transactions.push(t)
	}

	return links
}