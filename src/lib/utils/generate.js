import Links from '$lib/classes/Links'
import { random } from '$lib/utils/math'

const count = d => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

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
			date: new Date(today.getFullYear(), today.getMonth() + offset, random(count(today), 1)),
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
			date: new Date(today.getFullYear(), today.getMonth() + offset, random(count(today), 1)),
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

	for (let i = 0; i < 2; i++) {
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
	links.budgets = [links.default()]
	links.selected = links.budgets[0]
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

	// Bills > Mortgage
	// links.add.category('Bills', '2Mortgage', {
	// 	value: 1000,
	// 	overflow: { group: 'Wants', category: 'Dinners' }
	// })

	return links
}