import Links from '$lib/classes/Links'
import { random } from '$lib/utils/math'

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

	// // Wants > Dinners
	let t = {
		id: 'demo-dinner-1',
		date: new Date(today.getFullYear(), today.getMonth(), random(28, 1)),
		name: 'Moonlit Serenade Bistro',
		account: 'demo-checking',
		amount: -82.12,
		properties: { group: 'Wants', category: 'Dinners Out' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)
	t = {
		id: 'demo-dinner-2',
		date: new Date(today.getFullYear(), today.getMonth(), random(28, 1)),
		name: 'McD\'s',
		account: 'demo-checking',
		amount: -18.54,
		properties: { group: 'Wants', category: 'Dinners Out' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)
	t = {
		id: 'demo-dinner-3',
		date: new Date(today.getFullYear(), today.getMonth(), random(28, 1)),
		name: 'McD\'s',
		account: 'demo-checking',
		amount: -15.91,
		properties: { group: 'Wants', category: 'Dinners Out' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)

	// // Needs > Groceries
	t = {
		id: 'demo-groceries-1',
		date: new Date(today.getFullYear(), today.getMonth(), random(14, 1)),
		name: 'Kroger',
		account: 'demo-checking',
		amount: -145.95,
		properties: { group: 'Needs', category: 'Groceries' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)
	t = {
		id: 'demo-groceries-2',
		date: new Date(today.getFullYear(), today.getMonth(), random(28, 15)),
		name: 'Kroger',
		account: 'demo-checking',
		amount: -33.56,
		properties: { group: 'Needs', category: 'Groceries' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)

	// // Bills > Mortgage
	// links.add.category('Bills', '2Mortgage', {
	// 	value: 1000,
	// 	overflow: { group: 'Wants', category: 'Dinners' }
	// })
	t = {
		id: 'demo-paycheck-1',
		date: new Date(today.getFullYear(), today.getMonth(), 1),
		name: 'Paycheck',
		account: 'demo-checking',
		amount: 1100.00,
		properties: { group: 'Bills', category: 'Mortgage' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)
	t = {
		id: 'demo-paycheck-2',
		date: new Date(today.getFullYear(), today.getMonth(), 15),
		name: 'Paycheck',
		account: 'demo-checking',
		amount: 1100.00,
		properties: { group: 'Bills', category: 'Mortgage' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)
	// // Other > Uncategorized
	t = {
		id: 'demo-interest',
		name: 'Interest',
		account: 'demo-saving',
		amount: 3.29,
		properties: { group: 'Other', category: 'Uncategorized' }
	}
	links.add.transaction(t)
	links.links.find(l => l.id === 'demo-link').transactions.push(t)

	return links
}