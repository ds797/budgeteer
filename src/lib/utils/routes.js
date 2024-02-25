import { v4 as uuidv4 } from 'uuid'
import { links } from '$lib/stores/user'
import { route, queue, notifications } from '$lib/stores/ui'
import { toDate } from '$lib/utils/convert'

const link = async ($route, $links) => {
	try {
		const { token } = await plaid.link()

		if (!token) return 0

		const { data } = await supabase.invoke('links', { type: { create: [token] } })
		$links = $links.add.link(data)
		links.set($links)
		route.set($route)
		save.links(state)

		notifications.add({ type: 'success', message: 'Successfully linked your account to Budgeteer' })
	} catch (error) {
		notifications.add({ type: 'error', message: error })
	}

	return 1
}

const save = {
	links: state => {
		if (state.demo) return

		queue.enq(state.supabase.updateLinks)
	},
	budgets: state => {
		if (state.demo) return

		queue.enq(state.supabase.updateBudgets)
	}
}

export const initialize = $route => {
	$route.state = { choose: {} },
	$route.link = {
		name: 'Link Institution',
		// TODO: remove this and fix in Menu
		key: async e => {
			if (e.key !== 'Enter') return

			await link()
		},
		children: [{
			name: 'Create Link',
			description: 'Budgeteer uses Plaid to link your account.',
			type: 'action',
			click: async () => {
				if ($page.url.pathname === '/demo') {
					notifications.add({ type: 'error', message: 'Join Budgeteer to link your personal accounts!' })
					$route.current = undefined
				} else return await link()
			},
			fill: true
		}],
		fill: true
	}
	$route.transaction = {}
	$route.choose = {
		category: {},
		account: {},
		budget: {}
	}
	$route.links = {}
	$route.group = {}
	$route.category = {}
	$route.account = {}
}

const format = d => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
const conflicts = ($links, group, category) => {
	let categories = []
	$links.selected.groups.forEach(g => {
		g.categories.forEach(c => {
			if (c.overflow?.group === group && c.overflow?.category === category)
				categories.push({ group: g.name, category: c.name }, ...conflicts($links, g.name, c.name))
		})
	})

	return categories
}

export const update = {
	transaction: ($route, $links, state) => {
		if (!$route.state.transaction) $route.state.transaction = {}
		$route.state.transaction.new = structuredClone($route.state.transaction.new ?? $route.state.transaction)
		$route.state.transaction.new.date = $route.state.transaction.new.date ? toDate($route.state.transaction.new.date) : new Date()

		if ($route.state.transaction.new.new) delete $route.state.transaction.new.new

		if (!$route.state.transaction.new.properties) $route.state.transaction.new.properties = {}

		if ($route.current === $route.transaction) {
			$route.state.choose.category = $route.state.transaction.new.properties
			$route.state.choose.category.hint = 'Category'
			$route.state.account = $route.state.transaction.new
			$route.state.account.hint = 'Account'
			$route.state.account.enabled = [...$links.selected.accounts.filter(id => $links.links.find(l => !l.institution).accounts.find(a => a.account_id === id))]
		}

		$route.transaction.name = $route.state.transaction.id	? 'Edit Transaction' : 'Add Transaction'
		$route.transaction.quit = async () => {
			if ($route.state.transaction.id) {
				const old = $route.state.transaction.name
				// Blank name field
				if (!$route.state.transaction.new.name) $route.state.transaction.new.name = old

				// Update transaction
				const data = $links.update.transaction($route.state.transaction.id, $route.state.transaction.new)
				if (data) links.set(data)

				// If transaction name changed, update categories
				if ($route.state.transaction.new.name !== old) {
					const id = $route.state.transaction.id

					queue.enq(async () => {
						links.set(await $links.ai.transaction($links.selected.transactions.find(t => t.id === $route.state.transaction.new.id)))
						links.set($links.sort(...$links.which.transactions(t => t.id === id)))
					})
				}
				// Auto sort
				if (!$route.state.transaction.new.properties.manual) {
					$route.state.transaction.new.properties.group = $links.fallback().group
					$route.state.transaction.new.properties.category = $links.fallback().category
					links.set($links.sort($route.state.transaction.new))
				}

				if (data) {
					// Update Custom Link
					$links.links.forEach(l => {
						const t = l.transactions.find(t => t.id === $route.state.transaction.id)
						if (t) Object.assign(t, $route.state.transaction.new)
					})
					delete $route.state.transaction.new
					save.budgets(state)
					save.links(state)
					return
				}
			}
			delete $route.state.transaction.new
		}
		$route.transaction.children = [$route.choose.category, $route.account, {
			name: 'Name',
			type: 'input',
			placeholder: 'Transaction Name',
			value: $route.state.transaction.new?.name,
			set: v => {
				$route.state.transaction.new.name = v
				route.set($route)
			}
		}, {
			name: 'Amount',
			type: 'money',
			placeholder: 'Transaction Amount',
			value: $route.state.transaction.new?.amount,
			set: v => {
				$route.state.transaction.new.amount = parseFloat(v)
				route.set($route)
			}
		}, {
			hint: 'Date',
			name: format($route.state.transaction.new?.date ?? new Date()),
			children: [{
				name: 'Date',
				type: 'date',
				max: new Date(),
				value: $route.state.transaction.new?.date,
				set: v => {
					$route.state.transaction.new.date = v
					route.set($route)
					return 1
				}
			}]
		}, { type: 'spacer' }]

		if ($route.state.transaction.id) {
			$route.transaction.children.push({
				name: $route.state.transaction.new?.properties?.hide ? 'Unhide' : 'Hide',
				type: 'action',
				fill: $route.state.transaction.new.properties.hide,
				click: () => {
					$route.state.transaction.new.properties.hide = !$route.state.transaction.new?.properties?.hide
					return 1
				}
			}, {
				name: 'Remove',
				type: 'action',
				dangerous: true,
				click: () => {
					$links.remove.transaction($route.state.transaction.id)

					// Remove from custom
					const ts = $links.links.find(l => !l.institution).transactions
					ts.splice(ts.findIndex(t => t.id === $route.state.transaction.id), 1)
					links.set($links)

					delete $route.state.transaction.new
					$route.state = { choose: {} }
					save.budgets(state)
					save.links(state)
					$route.current = undefined
				}
			})
		} else {
			$route.transaction.children.push({
				name: 'Add',
				type: 'action',
				submit: true,
				disabled: !$route.state.transaction.new.name || !$route.state.transaction.new.amount || (!$route.state.transaction.new.properties.category && $route.state.transaction.new.properties.manual) || !$route.state.transaction.new.account,
				fill: true,
				click: () => {
					const t = {
						id: uuidv4(),
						name: $route.state.transaction.new.name,
						date: $route.state.transaction.new.date,
						amount: $route.state.transaction.new.amount,
						account: $route.state.transaction.new.account,
						properties: $route.state.transaction.new.properties
					}
					delete $route.state.transaction.new
					if (t.properties.manual) {
						if (state.demo) {
							links.set($links.add.transaction(t))
						} else {
							links.set($links.add.transaction(t))
							save.links(state)
						}
					} else {
						if (state.demo) {
							t.properties.group = $links.fallback().group
							t.properties.category = $links.fallback().category
							t.properties.manual = true
							links.set($links.add.transaction(t))
							notifications.add({ type: 'warning', message: `'${t.name}' was sorted into Other. Create an account to auto-sort!` })
						} else {
							queue.enq(async () => {
								$links = await $links.ai.transaction(t)
								$links = $links.sort(...$links.which.transactions(u => u.id === t.id))
								$links.links.find(l => !l.institution).transactions.push(t)
								$links = $links.add.transaction(t)
								links.set($links)
								save.links(state)
							})
						}
					}
					return 1
				}
			})
		}
	},
	choose: {
		category: ($route, $links, state) => {
			if (!$route.state.choose.category) $route.state.choose.category = {}

			$route.choose.category.hint = $route.state.choose.category.hint
			$route.choose.category.disabled = $route.state.choose.category.disabled == true
			$route.choose.category.name = (!$route.state.choose.category.overflow && !$route.state.choose.category.manual) ? 'Auto' : $route.state.choose.category?.category ?? 'Select Category'
			$route.choose.category.icon = (!$route.state.choose.category.overflow && !$route.state.choose.category.manual) && 'sparkle'
			$route.choose.category.fill = (!$route.state.choose.category.overflow && !$route.state.choose.category.manual) || $route.state.choose.category?.category
			$route.choose.category.children = [...$links.selected.groups.map(g => {
				return {
					name: g.name,
					fill: ($route.state.choose.category.overflow || $route.state.choose.category.manual) && $route.state.choose.category.group === g.name,
					click: () => $route.state.choose.category.groupName = g.name,
					children: [...g.categories.map(c => {
						return {
							name: c.name,
							type: 'action',
							disabled: (($route.state.choose.category.disabled?.length && $route.state.choose.category.disabled) ?? []).find(d => d.group === g.name && d.category === c.name),
							fill: ($route.state.choose.category.overflow || $route.state.choose.category.manual) && $route.state.choose.category.category === c.name,
							click: () => {
								$route.state.choose.category.group = g.name
								$route.state.choose.category.category = c.name
								if (!$route.state.choose.category.overflow) $route.state.choose.category.manual = true
								route.set($route)
								return 2
							}
						}
					}), {
						name: 'New Category',
						children: [{
							name: 'Name',
							type: 'input',
							placeholder: 'Category Name',
							value: $route.state.choose.category?.categoryName,
							set: v => {
								$route.state.choose.category.categoryName = v
								route.set($route)
							}
						}, {
							name: 'Description',
							fill: $route.state.choose.category?.description,
							children: [{
								name: 'Description',
								type: 'textarea',
								placeholder: 'Add a description to help Budgeteer sort your transactions with higher accuracy.',
								value: $route.state.choose.category?.description,
								set: v => {
									$route.state.choose.category.description = v
									route.set($route)
								}
							}]
						}, {
							name: 'Value',
							type: 'money',
							placeholder: 'Category Value',
							value: $route.state.choose.category?.categoryValue,
							set: v => {
								$route.state.choose.category.categoryValue = v
								route.set($route)
							}
						}, {
							name: 'Add',
							type: 'action',
							submit: true,
							fill: true,
							disabled: !$route.state.choose.category?.categoryName,
							click: () => {
								// TODO: if route protected, don't set
								delete $route.state.choose.category.new
								$route.state.choose.category.group = $route.state.choose.category.groupName
								$route.state.choose.category.category = $route.state.choose.category.categoryName
								$route.state.choose.category.manual = true
								$links = $links.add.category($route.state.choose.category.group, $route.state.choose.category.category, { description: $route.state.choose.category.description || '', value: parseFloat($route.state.choose.category.categoryValue) || 0 })
								links.set($links)

								if (state.demo) {
									route.set($route)
									return 1
								}

								queue.enq(async () => {
									$links = await $links.ai.category($route.state.choose.category.group, $route.state.choose.category.category)
									$links = $links.sort(...$links.which.transactions(t => !t.properties.manual))
									links.set($links)
									route.set($route)
									save.budgets(state)
								})
								return 1
							}
						}]
					}]
				}
			}), {
				name: 'New Group',
				click: () => $route.state.choose.category.groupName = undefined,
				children: [{
					name: 'Name',
					type: 'input',
					placeholder: 'Group Name',
					value: $route.state.choose.category?.groupName,
					set: v => {
						$route.state.choose.category.groupName = v
						route.set($route)
					}
				}, {
					name: 'Add',
					type: 'action',
					submit: true,
					fill: true,
					disabled: !$route.state.choose.category?.groupName,
					click: () => {
						$links = $links.add.group($route.state.choose.category.groupName)
						$route.state.choose.category.groupName = undefined
						route.set($route)
						links.set($links)
						save.budgets(state)
						return 1
					}
				}]
			}, { type: 'spacer' }, ]
			if ($route.state.choose.category.overflow) {
				$route.choose.category.children.push({
					name: 'Deselect',
					type: 'action',
					dangerous: true,
					disabled: !$route.state.choose.category.category,
					click: () => {
						$route.state.choose.category.group = undefined
						$route.state.choose.category.category = undefined
						route.set($route)
						return 1
					}
				})
			} else {
				$route.choose.category.children.push({
					name: 'Auto',
					icon: 'sparkle',
					type: 'action',
					fill: !$route.state.choose.category.manual,
					click: () => {
						$route.state.choose.category.manual = false
						route.set($route)
						return 1
					}
				})
			}
		},
		account: ($route, $links) => {
			if (!$route.state.account) $route.state.account = {}

			let any = false

			$route.account.hint = $route.state.account.hint
			$route.account.name = $links.get.parent($route.state.account.account)?.name ?? 'Select Account'
			$route.account.fill = $route.state.account.account
			$route.account.children = [...$links.links.map(l => {
				if (($route.state.account.disabled ?? []).find(id => id === l.id)) return {}
				if ($route.state.account.enabled && !$route.state.account.enabled.find(id => l.accounts.find(a => a.account_id === id))) return {}

				any = true

				return {
					name: l.name,
					link: l,
					type: 'account',
					fill: l.accounts.find(a => a.account_id === $route.state.account.account),
					children: [...l.accounts.map(a => {
						return {
							name: a.name,
							type: 'action',
							fill: $route.state.account.account === a.account_id,
							click: () => {
								$route.state.account.account = a.account_id
								route.set($route)
								return 2
							}
						}
					}), {
						name: 'Unlink',
						type: 'action',
						dangerous: true,
						click: () => {
							// TODO: Unlink
						}
					}]
				}
			})]
			if (!any)
				$route.account.children = [{
					name: 'Select Links',
					description: 'You haven\'t selected any custom accounts for this budget.',
					fill: true,
					type: 'action',
					click: () => $route.current = $route.links
				}]
		},
		budget: ($route, $links, state) => {
			if (!$route.state.choose.budget) $route.state.choose.budget = {}

			$route.choose.budget.name = 'Select Budget'
			$route.choose.budget.children = [...$links.budgets.map(b => {
				return {
					name: b.name,
					type: 'action',
					fill: $links.selected === b,
					close: () => save.budgets(state),
					children: [{
						name: 'Name',
						type: 'input',
						placeholder: 'Budget Name',
						value: b.name,
						set: v => {
							b.name = v
							route.set($route)
						}
					}, { type: 'spacer' }, {
						name: 'Delete Budget',
						type: 'action',
						dangerous: true,
						click: () => {
							$links = $links.remove.budget(b.name)
							links.set($links)
							route.set($route)
							return 1
						}
					}],
					click: () => {
						$links.selected = b
						route.set($route)
						save.budgets(state)
						return 1
					}
				}
			}), {
				name: 'Add Budget',
				fill: true,
				children: [{
					name: 'Name',
					type: 'input',
					placeholder: 'Budget Name',
					value: $route.state.choose.budget.name,
					set: v => $route.state.choose.budget.name = v
				}, {
					name: 'Add',
					type: 'action',
					submit: true,
					disabled: !$route.state.choose.budget.name,
					fill: true,
					click: () => {
						$links = $links.add.budget({
							...$links.default(),
							name: $route.state.choose.budget.name
						})
						links.set($links)
						route.set($route)
						save.budgets(state)
						return 1
					}
				}]
			}]
		}
	},
	links: ($route, $links, state) => {
		$route.links.name = 'Links'
		$route.links.children = [...$links.links.map(l => {
			return {
				name: l.name,
				link: l,
				type: 'account',
				children: [...l.accounts.map(a => {
					return {
						name: a.name,
						type: 'toggle',
						value: $links.has.account(a.account_id),
						close: () => save.links(state),
						children: [{
							name: 'Account Name',
							type: 'input',
							placeholder: 'Name',
							value: a.name,
							set: v => {
								a.name = v
								route.set($route)
							}
						}],
						set: () => {
							if ($links.has.account(a.account_id))
								$links = $links.remove.account(a.account_id)
							else
								$links = $links.add.account(a.account_id)
							links.set($links)
							route.set($route)
							save.budgets(state)

							return 0
						}
					}
				}), {
					name: 'Unlink',
					type: 'action',
					dangerous: true,
					disabled: !l.institution,
					click: () => {
						queue.enq(async () => await state.plaid.unlink(l.id))

						// Update database
						queue.enq(async () => {
							const { error } = await state.supabase.from('links').delete().match({ id: l.id })
							if (error) console.error(error)
						})

						$links = $links.remove.link(l.id)
						links.set($links)
						route.set($route)

						save.links(state)
						save.budgets(state)

						return 1
					}
				}]
			}
		}), $route.link]
	},
	group: ($route, $links, state) => {
		if (!$route.state.group) $route.state.group = {}
		$route.state.group.new = structuredClone($route.state.group.new ?? $route.state.group)
		if ($route.state.group.new.new) delete $route.state.group.new.new

		$route.group.name = 'Edit Group'
		$route.group.quit = () => {
			if ($route.state.group.name !== $route.state.group.new.name) {
				const { data, error } = $links.update.group($route.state.group.name, $route.state.group.new)
				$links = data
				links.set($links)
				if (!error) save.budgets(state)
			}

			delete $route.state.group.new
		}
		$route.group.children = [...($route.state.group.categories ?? []).map(c => {
			return {
				name: c.name,
				click: () => {
					$route.state.category = c
					$route.state.category.new = structuredClone(c)
					$route.state.category.new.group = $route.state.group.name
				},
				close: () => {
					if ($route.state.category.new?.name && $route.state.category.new?.name !== $route.state.category.name) { // No name
						const group = $links.selected.groups.find(g => g.name === $route.state.category.new?.group)

						// Name match
						if (group && group.categories.find(c => c.name === $route.state.category.new?.name)) {
							notifications.add({
								type: 'error',
								message: 'Another category by the same name exists!'
							})
						} else {
							for (const t of $links.which.transactions(() => true))
								if (t.properties.category === $route.state.category.name)
									t.properties.category = $route.state.category.new?.name
							$route.state.category.name = $route.state.category.new?.name
							links.set($links)
							save.budgets(state)
						}

						delete $route.state.category.new
						return
					}
				},
				children: [{
					name: 'Name',
					type: 'input',
					placeholder: 'Category Name',
					value: $route.state.category.new?.name,
					set: v => $route.state.category.new.name = v
				}, {
					name: 'Remove Category',
					type: 'action',
					dangerous: true,
					click: () => {
						$links = $links.remove.category($route.state.category.new.group, $route.state.category.name)
						links.set($links)
						save.budgets(state)
						return 1
					}
				}],
			}
		}), {
			name: 'Name',
			type: 'input',
			placeholder: 'Group Name',
			value: $route.state.group.new?.name,
			set: v => $route.state.group.new.name = v
		}, {
			name: 'Remove Group',
			type: 'action',
			dangerous: true,
			click: () => {
				$links = $links.remove.group($route.state.group.name)
				links.set($links)
				save.budgets(state)
				return 1
			}
		}]
	},
	category($route, $links, state) {
		if (!$route.state.category) $route.state.category = {}
		$route.state.category.new = structuredClone($route.state.category.new ?? $route.state.category)
		if ($route.state.category.new.new) delete $route.state.category.new.new

		if (!$route.state.category.new.overflow) $route.state.category.new.overflow = {}

		if ($route.current === $route.category) {
			$route.state.choose.category = $route.state.category.new.overflow
			let categories = conflicts($links, $route.state.category.group?.name, $route.state.category.name)

			$route.state.choose.category.disabled = [{
				group: $route.state.category.group?.name,
				category: $route.state.category.name
			}, ...categories]
			this.choose.category($route, $links, state)
			$route.state.choose.category.hint = $route.state.category.new.spend ? 'Underflow' : 'Overflow'
			$route.state.choose.category.overflow = true
		}

		$route.category.name = 'Edit Category'
		$route.category.quit = () => {
			// Remove circular reference
			delete $route.state.category.new.overflow.disabled

			// Should we update PFCs?
			const update = $route.state.category.new.group?.name && $route.state.category.name !== $route.state.category.new.name

			// Update category
			const data = $links.update.category($route.state.category.group?.name, $route.state.category.name, $route.state.category.new.group?.name ? $route.state.category.new : null)

			if (state.demo) {
				delete $route.state.category.new
				if (data) links.set(data)
				return
			}

			if (update) queue.enq(async () => $links.ai.category($route.state.category.new.group?.name, $route.state.category.new.name))
			delete $route.state.category.new
			if (data) {
				links.set(data)
				save.budgets(state)
			}

			return
		}
		$route.category.children = [{
			name: 'Name',
			type: 'input',
			placeholder: 'Category Name',
			value: $route.state.category.new?.name,
			set: v => $route.state.category.new.name = v
		}, {
			name: 'Description',
			fill: $route.state.category.new?.description,
			children: [{
				name: 'Description',
				type: 'textarea',
				placeholder: 'Add a description to help Budgeteer sort your transactions with higher accuracy.',
				value: $route.state.category.new?.description,
				set: v => $route.state.category.new.description = v
			}]
		}, {
			name: 'Value',
			type: 'input',
			placeholder: 'Category Value',
			value: $route.state.category.new?.value,
			set: v => $route.state.category.new.value = v
		}, {
			name: $route.state.category.new?.spend ? 'Spending' : 'Saving',
			type: 'switch',
			value: $route.state.category.new?.spend,
			set: v => $route.state.category.new.spend = v,
			// bg: !$route.state.category.new?.spend ? 'var(--text-good)' : 'var(--text-bad)'
		}, $route.choose.category, { type: 'spacer' }, {
			name: 'Remove Category',
			type: 'action',
			dangerous: true,
			click: () => {
				$links = $links.remove.category($route.state.category.new.group, $route.state.category.new.name)
				links.set($links)
				save.budgets(state)
				return 1
			}
		}]
	},
	account: ($route, session, state) => {
		$route.account = {
			name: 'Account',
			children: [{
				name: 'Exit',
				type: 'action',
				dangerous: true,
				click: async () => {
					try {
						const { error } = await state.supabase.auth.signOut()
						if (error) {
							notifications.add({
								type: 'error',
								message: error
							})
						} else {
							invalidateAll()
							goto('/')
						}
					} catch (error) {
						notifications.add({
							type: 'error',
							message: error
						})
					}
					return 1
				}
			}]
		}
		if (session) {
			$route.account.children.unshift({
				name: 'Subscription',
				children: [{
					name: 'Unsubscribe',
					dangerous: true,
					children: [{
						name: 'Unsubscribe',
						description: 'Are you sure you want to unsubscribe?',
						type: 'action',
						dangerous: true,
						click: () => {
							queue.enq(async () => {
								const { data: notification } = await state.supabase.invoke('pay', { type: 'stop' })
								if (notification) notifications.add(notification)
								goto('/')
							})
							$route.current = undefined
						}
					}]
				}]
			})
		}

		$route.account = $route.account
		route.set($route)
	},
	all($route, $links, state) {
		if (!$links.selected) return

		this.transaction($route, $links, state)
		this.choose.category($route, $links, state)
		this.choose.account($route, $links)
		this.choose.budget($route, $links, state)
		this.links($route, $links, state)
		this.group($route, $links, state)
		this.category($route, $links, state)
	}
}