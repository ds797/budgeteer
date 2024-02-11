import { v4 as uuidv4 } from 'uuid'
import { post } from '$lib/utils/requests'
import { clamp, num } from '$lib/utils/math'
import { format } from '$lib/utils/string'

export default class Links {
	constructor(obj, err = m => console.error(m)) {
		const self = this

		self.links = obj?.links ?? []
		self.budgets = obj?.budgets ?? []
		self.selected = obj?.selected ?? undefined
		self.err = err

		// Methods
		self.fallback = () => {
			return {
				group: 'Other',
				category: 'Uncategorized'
			}
		}
		self.default = () => {
			return {
				name: 'Default budget',
				accounts: [],
				transactions: [],
				groups: [{
					name: 'Bills',
					categories: [{
						name: 'Mortgage',
						value: 2000,
						overflow: { group: 'Needs', category: 'Groceries' }
					}]
				}, {
					name: 'Needs',
					categories: [{
						name: 'Groceries',
						value: 0,
						overflow: { group: 'Wants', category: 'Dinners Out' }
					}]
				}, {
					name: 'Wants',
					categories: [{
						name: 'Dinners Out',
						value: 0,
						spend: true,
						overflow: {}
					}]
				}, {
					name: self.fallback().group,
					categories: [{ name: self.fallback().category, overflow: {} }],
					protected: true
				}]
			}
		}
		self.custom = () => {
			return {
				id: uuidv4(),
				accounts: [{
					account_id: uuidv4(),
					balances: { available: 0 },
					name: 'Custom Account'
				}],
				custom: true,
				name: 'Custom',
				transactions: []
			}
		}
		self.select = name => {
			self.selected = self.budgets.find(b => b.name === name)
		}
		self.each = {
			link: predicate => {
				for (let i = 0; i < self.links.length; i++)
					predicate(self.links[i], i, self.links)
			},
			account: predicate => {
				for (let i = 0; i < self.links.length; i++)
					for (let j = 0; j < self.links[i].accounts.length; j++)
						predicate(self.links[i].accounts[j], j, self.links[i].accounts)
			},
			transaction: predicate => {
				for (let i = 0; i < (self.selected?.transactions ?? []).length; i++)
					predicate(self.selected.transactions[i], i, self.selected.transactions)
			}
		}
		self.which = {
			links: (predicate = () => true) => {
				for (const l of self.links)
					if (predicate(l)) return l
			},
			accounts: (predicate = () => true) => {
				for (const l of self.links)
					for (const a of l.accounts)
						if (predicate(a)) return a
			},
			transactions: (predicate = () => true) => {
				let build = []

				self.each.transaction(t => {
					if (predicate(t)) build.push(t)
				})

				return build
			}
		}
		self.get = {
			groups: () => self.selected?.groups ?? [],
			categories: name => (self.selected?.groups ?? []).find(g => g.name === name).categories ?? [],
			sum: (predicate = () => true) => {
				let sum = 0
				for (const t of self.selected?.transactions ?? []) {
					if (predicate(t)) sum += t.amount
				}
				return sum
			},
			// Overflow is defined as the amount OVER the cat val
			overflow: (group, category, predicate = () => true) => {
				let sum = 0
				self.selected.groups.forEach(g => {
					g.categories.forEach(c => {
						if (num(c.value) && c.overflow?.group === group && c.overflow?.category === category) {
							if (c.spend) {
								sum += clamp(self.get.sum(t => t.properties.group === g.name && t.properties.category === c.name && predicate(t)) + parseFloat(c.value) + self.get.overflow(g.name, c.name, predicate), { max: 0 })
							} else
								sum += clamp(self.get.sum(t => t.properties.group === g.name && t.properties.category === c.name && predicate(t)) - parseFloat(c.value) + self.get.overflow(g.name, c.name, predicate), { min: 0 })
						}
					})
				})

				return sum
			},
			parent: id => {
				for (const l of self.links) {
					const a = l.accounts.find(a => a.account_id === id)
					if (a) return a
				}
			},
			balance: id => {
				let sum = 0
				if (id) {
					for (const l of self.links) {
						const a = l.accounts.find(a => a.account_id === id)
						if (a) {
							sum += a.balances.available
							break
						}
					}

					for (const t of self.selected.transactions)
						if (t.account === id && !t.properties.ignore)
							sum += t.amount
				} else {
					for (const l of self.links)
						for (const a of l.accounts) sum += a.balances.available
				}

				return sum
			}
		}
		self.has = {
			account: id => {
				if (self.selected.accounts.indexOf(id) !== -1) return true

				return false
			},
			link: id => {
				const l = self.links.find(l => l.id === id)
				for (const a of l.accounts) {
					if (self.has.account(a.account_id)) return true
				}

				return false
			}
		}
		self.add = {
			link: (...links) => {
				for (const link of links) {
					if (self.links.find(l => l.institution == link.institution)) {
						self.err('Link already exists')
						continue
					}

					self.links.push({
						id: link.id,
						institution: link.institution ?? link.institution_id,
						name: link.name,
						accounts: link.accounts,
						transactions: link.transactions
					})
				}

				return self
			},
			budget: (...budgets) => {
				for (const budget of budgets) {
					if (self.budgets.find(b => b.name === budget.name)) {
						self.err('Budget already exists')
						return self
					}

					self.budgets.push({
						name: budget.name,
						accounts: budget.accounts ?? [],
						transactions: budget.transactions ?? [],
						groups: budget.groups ?? [],
						protected: budget.protected
					})
				}

				return self
			},
			group: name => {
				if (!name.length) {
					self.err('No name supplied')
					return self
				}

				if (self.selected.groups.find(g => g.name === name)) {
					self.err('Group already exists')
					return self
				}

				self.selected.groups.unshift({
					name,
					categories: []
				})

				return self
			},
			category: (group, name, properties = {}) => {
				const g = self.selected.groups.find(g => g.name === group)
			
				if (!name.length) {
					self.err('No name supplied')
					return
				}
			
				if (g.protected) {
					self.err('Group is protected')
					return self
				}

				if (!g) {
					self.err('Group doesn\'t exist')
					return self
				}

				if (g.categories.find(c => c.name === name)) {
					self.err('Category already exists')
					return self
				}

				if (!properties.overflow) properties.overflow = {}

				g.categories.unshift({ name, ...properties })

				return self
			},
			transaction: (...transactions) => {
				for (let t of transactions) {
					if (t.properties) {
						t.properties.group = t.properties.group ?? 'Other'
						t.properties.category = t.properties.category ?? 'Uncategorized'
					} else t.properties = { group: 'Other', category: 'Uncategorized', ignore: true }
					if (typeof t.date === 'object') t.date = format(t.date)

					self.selected.transactions.push({
						id: t.transaction_id ?? t.id ?? uuidv4(),
						amount: t.amount,
						date: t.date ?? format(new Date()),
						account: t.account_id ?? t.account,
						merchant: t.merchant_name ?? t.merchant,
						name: t.name,
						category: t.category ?? ['Unknown'],
						properties: t.properties
					})
				}

				return self
			},
			account: id => {
				if (self.selected.accounts.indexOf(id) === -1)
					self.selected.accounts.push(id)
	
				const link = self.links.find(l => l.accounts.find(a => a.account_id === id))

				for (const t of link.transactions) {
					if (t.account !== id || self.which.transactions(u => u.id === t.id).length)
						continue

					t.properties = t.properties ?? {
						imported: true,
						group: 'Other',
						category: 'Uncategorized',
						ignore: true
					}
					self.add.transaction(t)
				}

				return self
			}
		}
		self.set = {
			links: links => {
				self.links = []
				links.push(links.splice(links.findIndex(l => !l.institution), 1)[0])
				self.add.link(...links)

				return self
			}
		}
		self.update = {
			transaction: (id, data) => {
				const transaction = self.selected.transactions.find(t => t.id === id)

				if (typeof data.date === 'object') data.date = format(data.date)

				if (transaction.account === data.account
					&& transaction.amount === data.amount
					&& transaction.date === data.date
					&& transaction.name === data.name
					&& transaction.properties.group === data.properties.group
					&& transaction.properties.category === data.properties.category
					&& transaction.properties.hide === data.properties.hide)
					return {}

				data.properties = Object.assign(transaction.properties, data.properties)

				Object.assign(transaction, data)

				return { data: self}
			},
			group: (name, data) => {
				if (!data) {
					err('No data provided')
					return
				} if (!data.name) {
					err('No name provided')
					return
				} if (name === data.name) {
					return
				} if (self.selected.groups.find(g => g.name === data.name)) {
					err('Group already exists')
					return
				}

				const g = self.selected.groups.find(g => g.name === name)
				if (g.protected) {
					err('Group is protected')
					return
				}

				for (const t of self.which.transactions())
					if (t.properties.group === g.name) t.properties.group = data.name
				g.name = data.name

				return self
			},
			category: (group, category, data) => {
				if (!data) {
					return self.remove.category(group, category)
				} if (!data.name) {
					err('No name provided')
					return
				}
				const g = self.selected.groups.find(g => g.name === group)
				if (category !== data.name && g.categories.find(c => c.name === data.name)) {
					err('Category already exists')
					return
				}

				const c = g.categories.find(c => c.name === category)
				if (c.name === data.name
					&& c.value === data.value
					&& c.spend === data.spend
					&& c.overflow?.group === data.overflow?.group
					&& c.overflow?.category === data.overflow?.category) {
					return
				} if (g.protected) {
					err('Group is protected')
					return
				}

				for (const t of self.which.transactions())
					if (t.properties.group === g.name && t.properties.category === c.name) t.properties.category = data.name
				c.name = data.name ?? c.name
				c.value = data.value ?? c.value
				c.spend = data.spend ?? c.spend
				if (data.overflow) c.overflow = data.overflow

				return self
			},
		}
		self.remove = {
			link: (...ids) => {
				for (const id of ids) {
					const link = self.links.find(l => l.id === id)

					// Remove all references to the link
					for (const a of link.accounts) {
						for (const b of self.budgets) {
							b.transactions = b.transactions.filter(t => t.account !== a.account_id)
						}
					}
					self.links = self.links.filter(l => l.id !== id)
				}
			
				return self
			},
			budget: (...names) => {
				for (const name of names) {
					if (!self.budgets.filter(b => b.name === name).length) {
						self.err('Budget doesn\'t exist')
						return self
					}

					self.budgets = self.budgets.filter(b => b.name !== name)
				}

				if (self.budgets.length === 0)
					self.budgets = [self.defaultBudget()]

				self.selected = self.budgets[0]

				return self
			},
			group: name => {
				const index = self.selected.groups.findIndex(g => g.name === name)
				if (self.selected.groups[index].protected) {
					self.err('Group is protected')
					return self
				}

				self.selected.groups.forEach(g => g.categories.forEach(c => {
					if (c.overflow?.group === name) c.overflow = {}
				}))

				const bts = self.which.transactions(t => t.properties.group === name)

				for (const t of bts) {
					t.properties.group = 'Other'
					t.properties.category = 'Uncategorized'
				}

				self.selected.groups.splice(index, 1)

				return self
			},
			category: (group, category) => {
				const gIndex = self.selected.groups.findIndex(g => g.name === group)
				if (self.selected.groups[gIndex].protected) {
					self.err('Group is protected')
					return self
				}

				self.selected.groups.forEach(g => g.categories.forEach(c => {
					if (c.overflow?.group === group && c.overflow?.category === category) c.overflow = {}
				}))

				const cIndex = self.selected.groups[gIndex].categories.findIndex(c => c.name === category)
				const bts = self.which.transactions(t => t.properties.group === group && t.properties.category === category)

				for (const t of bts) {
					t.properties.group = 'Other'
					t.properties.category = 'Uncategorized'
				}

				self.selected.groups[gIndex].categories.splice(cIndex, 1)

				return self
			},
			transaction: (...ids) => {
				for (const id of ids)
					self.selected.transactions = self.selected.transactions.filter(t => t.id != id)

				return self
			},
			account: id => {
				self.selected.accounts = self.selected.accounts.filter(a => a !== id)
				self.selected.transactions = self.selected.transactions.filter(t => t.account !== id)

				return self
			}
		}
		self.sort = async (transactions, invoke) => {
			let build = {
				transactions: [],
				user_groups: self.selected.groups
			}

			let all = []

			const parse = async () => {
				const { data, error } = await invoke('sortTransactions', { messages: build })
				if (error) return { error }
				const parsed = JSON.parse(data)

				if (parsed.sorted.length !== build.transactions.length) return false

				for (const s of parsed.sorted) {
					const g = self.selected.groups.find(g => g.name === s.group)
					if (!g) return false
					if (!g.categories.find(c => c.name === s.category)) return false
				}
				build.transactions = []
		
				return { data: parsed.sorted }
			}

			const loop = async build => {
				let sorted
				for (let i = 0; i < 5; i++) {
					const { data, error } = await parse(build)
					if (error) return error
					sorted = data
					if (sorted) break
				}
				if (!sorted) sorted = build.transactions.map(() => {
					return {
						group: 'Other',
						category: 'Uncategorized'
					}
				})

				all.push(sorted)
			}

			let original = []

			for (const transaction of transactions) {
				if (!transaction.properties.imported) continue

				build.transactions.push({
					name: transaction.name,
					merchant: transaction.merchant,
					general_categories: transaction.category
				})

				original.push(transaction)

				if (5 <= build.transactions.length) {
					const error = await loop(build)
					if (error) return { error }
				}
			}

			// Flush
			if (build.transactions.length) {
				const error = await loop(build)
				if (error) return { error }
			}

			all = all.flat()

			for (let i = 0; i < original.length; i++) {
				original[i].properties.group = all[i].group
				original[i].properties.category = all[i].category
			}

			return { data: self }
		}
		self.order = (group, category, predicate = () => true) => {
			const ts = self.which.transactions(t => t.properties.group === group && t.properties.category === category && predicate(t))
			return ts.toSorted((one, two) => new Date(two.date) - new Date(one.date))
		}
	}
}