import { v4 as uuidv4 } from 'uuid'
import { clamp, num } from '$lib/utils/math'
import { format } from '$lib/utils/string'

const PFCs = [
	'INCOME_DIVIDENDS',
	'INCOME_INTEREST_EARNED',
	'INCOME_RETIREMENT_PENSION',
	'INCOME_TAX_REFUND',
	'INCOME_UNEMPLOYMENT',
	'INCOME_WAGES',
	'INCOME_OTHER_INCOME',
	'TRANSFER_IN_CASH_ADVANCES_AND_LOANS',
	'TRANSFER_IN_DEPOSIT',
	'TRANSFER_IN_INVESTMENT_AND_RETIREMENT_FUNDS',
	'TRANSFER_IN_SAVINGS',
	'TRANSFER_IN_ACCOUNT_TRANSFER',
	'TRANSFER_IN_OTHER_TRANSFER_IN',
	'TRANSFER_OUT_INVESTMENT_AND_RETIREMENT_FUNDS',
	'TRANSFER_OUT_SAVINGS',
	'TRANSFER_OUT_WITHDRAWAL',
	'TRANSFER_OUT_ACCOUNT_TRANSFER',
	'TRANSFER_OUT_OTHER_TRANSFER_OUT',
	'LOAN_PAYMENTS_CAR_PAYMENT',
	'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT',
	'LOAN_PAYMENTS_PERSONAL_LOAN_PAYMENT',
	'LOAN_PAYMENTS_MORTGAGE_PAYMENT',
	'LOAN_PAYMENTS_STUDENT_LOAN_PAYMENT',
	'LOAN_PAYMENTS_OTHER_PAYMENT',
	'BANK_FEES_ATM_FEES',
	'BANK_FEES_FOREIGN_TRANSACTION_FEES',
	'BANK_FEES_INSUFFICIENT_FUNDS',
	'BANK_FEES_INTEREST_CHARGE',
	'BANK_FEES_OVERDRAFT_FEES',
	'BANK_FEES_OTHER_BANK_FEES',
	'ENTERTAINMENT_CASINOS_AND_GAMBLING',
	'ENTERTAINMENT_MUSIC_AND_AUDIO',
	'ENTERTAINMENT_SPORTING_EVENTS_AMUSEMENT_PARKS_AND_MUSEUMS',
	'ENTERTAINMENT_TV_AND_MOVIES',
	'ENTERTAINMENT_VIDEO_GAMES',
	'ENTERTAINMENT_OTHER_ENTERTAINMENT',
	'FOOD_AND_DRINK_BEER_WINE_AND_LIQUOR',
	'FOOD_AND_DRINK_COFFEE',
	'FOOD_AND_DRINK_FAST_FOOD',
	'FOOD_AND_DRINK_GROCERIES',
	'FOOD_AND_DRINK_RESTAURANT',
	'FOOD_AND_DRINK_VENDING_MACHINES',
	'FOOD_AND_DRINK_OTHER_FOOD_AND_DRINK',
	'GENERAL_MERCHANDISE_BOOKSTORES_AND_NEWSSTANDS',
	'GENERAL_MERCHANDISE_CLOTHING_AND_ACCESSORIES',
	'GENERAL_MERCHANDISE_CONVENIENCE_STORES',
	'GENERAL_MERCHANDISE_DEPARTMENT_STORES',
	'GENERAL_MERCHANDISE_DISCOUNT_STORES',
	'GENERAL_MERCHANDISE_ELECTRONICS',
	'GENERAL_MERCHANDISE_GIFTS_AND_NOVELTIES',
	'GENERAL_MERCHANDISE_OFFICE_SUPPLIES',
	'GENERAL_MERCHANDISE_ONLINE_MARKETPLACES',
	'GENERAL_MERCHANDISE_PET_SUPPLIES',
	'GENERAL_MERCHANDISE_SPORTING_GOODS',
	'GENERAL_MERCHANDISE_SUPERSTORES',
	'GENERAL_MERCHANDISE_TOBACCO_AND_VAPE',
	'GENERAL_MERCHANDISE_OTHER_GENERAL_MERCHANDISE',
	'HOME_IMPROVEMENT_FURNITURE',
	'HOME_IMPROVEMENT_HARDWARE',
	'HOME_IMPROVEMENT_REPAIR_AND_MAINTENANCE',
	'HOME_IMPROVEMENT_SECURITY',
	'HOME_IMPROVEMENT_OTHER_HOME_IMPROVEMENT',
	'MEDICAL_DENTAL_CARE',
	'MEDICAL_EYE_CARE',
	'MEDICAL_NURSING_CARE',
	'MEDICAL_PHARMACIES_AND_SUPPLEMENTS',
	'MEDICAL_PRIMARY_CARE',
	'MEDICAL_VETERINARY_SERVICES',
	'MEDICAL_OTHER_MEDICAL',
	'PERSONAL_CARE_GYMS_AND_FITNESS_CENTERS',
	'PERSONAL_CARE_HAIR_AND_BEAUTY',
	'PERSONAL_CARE_LAUNDRY_AND_DRY_CLEANING',
	'PERSONAL_CARE_OTHER_PERSONAL_CARE',
	'GENERAL_SERVICES_ACCOUNTING_AND_FINANCIAL_PLANNING',
	'GENERAL_SERVICES_AUTOMOTIVE',
	'GENERAL_SERVICES_CHILDCARE',
	'GENERAL_SERVICES_CONSULTING_AND_LEGAL',
	'GENERAL_SERVICES_EDUCATION',
	'GENERAL_SERVICES_INSURANCE',
	'GENERAL_SERVICES_POSTAGE_AND_SHIPPING',
	'GENERAL_SERVICES_STORAGE',
	'GENERAL_SERVICES_OTHER_GENERAL_SERVICES',
	'GOVERNMENT_AND_NON_PROFIT_DONATIONS',
	'GOVERNMENT_AND_NON_PROFIT_GOVERNMENT_DEPARTMENTS_AND_AGENCIES',
	'GOVERNMENT_AND_NON_PROFIT_TAX_PAYMENT',
	'GOVERNMENT_AND_NON_PROFIT_OTHER_GOVERNMENT_AND_NON_PROFIT',
	'TRANSPORTATION_BIKES_AND_SCOOTERS',
	'TRANSPORTATION_GAS',
	'TRANSPORTATION_PARKING',
	'TRANSPORTATION_PUBLIC_TRANSIT',
	'TRANSPORTATION_TAXIS_AND_RIDE_SHARES',
	'TRANSPORTATION_TOLLS',
	'TRANSPORTATION_OTHER_TRANSPORTATION',
	'TRAVEL_FLIGHTS',
	'TRAVEL_LODGING',
	'TRAVEL_RENTAL_CARS',
	'TRAVEL_OTHER_TRAVEL',
	'RENT_AND_UTILITIES_GAS_AND_ELECTRICITY',
	'RENT_AND_UTILITIES_INTERNET_AND_CABLE',
	'RENT_AND_UTILITIES_RENT',
	'RENT_AND_UTILITIES_SEWAGE_AND_WASTE_MANAGEMENT',
	'RENT_AND_UTILITIES_TELEPHONE',
	'RENT_AND_UTILITIES_WATER',
	'RENT_AND_UTILITIES_OTHER_UTILITIES'
]

export default class Links {
	constructor(obj, err = m => console.error(m), invoke = async () => new Promise(r => r({ error: `No 'invoke' function supplied` }))) {
		const self = this

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
						pfc: [{
							name: 'LOAN_PAYMENTS_MORTGAGE_PAYMENT',
							confidence: 1
						}],
						value: 2000,
						overflow: { group: 'Needs', category: 'Groceries' }
					}]
				}, {
					name: 'Needs',
					categories: [{
						name: 'Groceries',
						pfc: [{
							name: 'FOOD_AND_DRINK_GROCERIES',
							confidence: 1
						}],
						value: 0,
						overflow: { group: 'Wants', category: 'Dinners Out' }
					}]
				}, {
					name: 'Wants',
					categories: [{
						name: 'Dinners Out',
						pfc: [{
							name: 'FOOD_AND_DRINK_RESTAURANT',
							confidence: 1
						}],
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

		self.links = obj?.links ?? [self.custom()]
		self.budgets = obj?.budgets ?? [self.default()]
		self.selected = obj?.selected ?? self.budgets[0]

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
		self.sort = (...transactions) => {
			for (const t of transactions) {
				// TODO: improve efficiency
				const set = t => {
					for (const group of self.selected.groups)
						for (const category of group.categories)
							if ((category.pfc ?? []).find(pfc => pfc.name === t.pfc?.detailed)) {
								t.properties.group = group.name
								t.properties.category = category.name
								return
							}
				}
				set(t)
			}
			return self
		}
		self.add = {
			link: (...links) => {
				for (const link of links) {
					if (self.links.find(l => l.institution === link.institution)) {
						err('Link already exists')
						continue
					}

					self.links.push({
						id: link.id,
						institution: link.institution ?? link.institution_id,
						name: link.name,
						logo: link.logo,
						accounts: link.accounts,
						transactions: link.transactions
					})
				}

				return self
			},
			budget: (...budgets) => {
				for (const budget of budgets) {
					if (self.budgets.find(b => b.name === budget.name)) {
						err('Budget already exists')
						return self
					}

					self.budgets.push({
						name: budget.name,
						accounts: budget.accounts ?? [],
						transactions: budget.transactions ?? [],
						groups: budget.groups ?? [],
						protected: budget.protected
					})
					self.selected = self.budgets.at(-1)
				}

				return self
			},
			group: name => {
				if (!name.length) {
					err('No name supplied')
					return self
				}

				if (self.selected.groups.find(g => g.name === name)) {
					err('Group already exists')
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
					err('No name supplied')
					return
				}
			
				if (g.protected) {
					err('Group is protected')
					return self
				}

				if (!g) {
					err('Group doesn\'t exist')
					return self
				}

				if (g.categories.find(c => c.name === name)) {
					err('Category already exists')
					return self
				}

				if (!properties.overflow) properties.overflow = {}
				if (!properties.pfc) properties.pfc = []

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
						pfc: t.pfc ?? [],
						properties: t.properties
					})
				}

				self.sort(...transactions)

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
						manual: false,
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
				const index = links.findIndex(l => !l.institution)
				if (index === -1) links.push(self.custom())
				else links.push(links.splice(index, 1)[0])
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
					return

				data.properties = Object.assign(transaction.properties, data.properties)

				Object.assign(transaction, data)

				return self
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
					&& c.description === data.description
					&& c.value === data.value
					&& c.spend === data.spend
					&& c.overflow?.group === data.overflow?.group
					&& c.overflow?.category === data.overflow?.category) {
					return
				} if (g.protected) {
					err('Group is protected')
					return
				}

				self.selected.groups.forEach(g => g.categories.forEach(c => {
					if (c.overflow?.group === group && c.overflow?.category === category) c.overflow.category = data.name
				}))

				for (const t of self.which.transactions())
					if (t.properties.group === g.name && t.properties.category === c.name) t.properties.category = data.name
				c.description = data.description
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
						err('Budget doesn\'t exist')
						return self
					}

					self.budgets = self.budgets.filter(b => b.name !== name)
				}

				if (self.budgets.length === 0)
					self.budgets = [self.default()]

				self.selected = self.budgets[0]

				return self
			},
			group: name => {
				const index = self.selected.groups.findIndex(g => g.name === name)
				if (self.selected.groups[index].protected) {
					err('Group is protected')
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
					err('Group is protected')
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
		self.order = (group, category, predicate = () => true) => {
			const ts = self.which.transactions(t => t.properties.group === group && t.properties.category === category && predicate(t))
			if (!ts.length) return ts

			return ts.toSorted((one, two) => new Date(two.date) - new Date(one.date))
		}
		self.ai = {
			category: async (group, category) => {
				let c = self.selected.groups.find(g => g.name === group).categories.find(c => c.name === category)

				const { data } = await invoke('ai', { type: { category: { group, category } } })
				const pfcs = JSON.parse(data ?? '[]')

				c.pfc = pfcs.pfc.map((name, index) => {
					return {
						name,
						confidence: pfcs.confidence[index]
					}
				})

				return self
			},
			transaction: async transaction => {
				const { data } = await invoke('ai', { type: { transaction: { name: transaction.name } } })
				const pfc = JSON.parse(data ?? '[]')

				transaction.pfc = { detailed: pfc.pfc }
				return self
			}
		}
	}
}