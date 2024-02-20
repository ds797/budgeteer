<script>
	import './styles.css'
	import { onMount } from 'svelte'
	import { v4 as uuidv4 } from 'uuid'
	import { page } from '$app/stores'
	import { goto, invalidate, invalidateAll } from '$app/navigation'
	import { browser } from '$app/environment'
	import { links } from '$lib/stores/user'
	import { route, queue, notifications } from '$lib/stores/ui'
	import { num } from '$lib/utils/math'
	import { toDate } from '$lib/utils/convert'
	import Links from '$lib/classes/Links'
	import Menu from '$lib/components/Menu.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import Notifications from '$lib/components/Notifications.svelte'
	import Assistant from '$lib/components/Assistant.svelte'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	export let data

	$: ({ supabase, session, plaid, storage } = data)

	const quit = () => {
		if ($route.current?.quit) $route.current.quit()
		$route.state = {}
		$route.current = undefined
	}

	const active = () => {
		storage.set('active', new Date().getTime())
	}

	const updateAccount = session => {
		$route.account = {
			name: 'Account',
			children: [{
				name: 'Exit',
				type: 'action',
				dangerous: true,
				click: async () => {
					try {
						const { error } = await data.supabase.auth.signOut()
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
								const { data: notification } = await data.supabase.invoke('pay', { type: 'stop' })
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
	}

	const updateLinks = () => {
		if ($page.url.pathname === '/demo') return

		queue.enq(data.supabase.updateLinks)
	}

	const updateBudgets = () => {
		if ($page.url.pathname === '/demo') return

		queue.enq(data.supabase.updateBudgets)
	}

	$route.state = {}

	const link = async () => {
		try {
			const { token } = await plaid.link()

			if (!token) return 0

			const { data } = await supabase.invoke('links', { type: { create: [token] } })
			console.log(data)
			$links = $links.add.link(data)
			$route = $route
			updateLinks()

			notifications.add({ type: 'success', message: 'Successfully linked your account to Budgeteer' })
		} catch (error) {
			notifications.add({ type: 'error', message: error })
		}

		return 1
	}
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

	$route.links = {
		name: 'Links',
		children: []
	}

	$route.selectAccounts = {}
	const updateSelectAccounts = () => {
		$route.selectAccounts.name = 'Links'
		$route.selectAccounts.children = [...$links.links.map(l => {
			return {
				name: l.name,
				link: l,
				type: 'account',
				children: [...l.accounts.map(a => {
					return {
						name: a.name,
						type: 'toggle',
						value: $links.has.account(a.account_id),
						close: updateLinks,
						children: [{
							name: 'Account Name',
							type: 'input',
							placeholder: 'Name',
							value: a.name,
							set: v => {
								a.name = v
								$route = $route
							}
						}],
						set: () => {
							if ($links.has.account(a.account_id)) {
								$links = $links.remove.account(a.account_id)
								$route = $route
							} else {
								$links = $links.add.account(a.account_id)
								$route = $route
							}
							updateBudgets()

							return 0
						}
					}
				}), {
					name: 'Unlink',
					type: 'action',
					dangerous: true,
					disabled: !l.institution,
					click: () => {
						queue.enq(async () => await data.plaid.unlink(l.id))

						// Update database
						queue.enq(async () => {
							const { error } = await data.supabase.from('links').delete().match({ id: l.id })
							if (error) console.error(error)
						})

						$links = $links.remove.link(l.id)
						$route = $route

						updateLinks()
						updateBudgets()

						return 1
					}
				}]
			}
		}), $route.link]
	}

	$route.pickAccount = {}
	const updatePickAccount = () => {
		if (!$route.state.pickAccount)
			$route.state.pickAccount = {}

		let any = false

		$route.pickAccount.hint = $route.state.pickAccount.hint
		$route.pickAccount.name = $links.get.parent($route.state.pickAccount.account)?.name ?? 'Select Account'
		$route.pickAccount.fill = $route.state.pickAccount.account
		$route.pickAccount.children = [...$links.links.map(l => {
			if (($route.state.pickAccount.disabled ?? []).find(id => id === l.id)) return {}
			if ($route.state.pickAccount.enabled && !$route.state.pickAccount.enabled.find(id => l.accounts.find(a => a.account_id === id))) return {}

			any = true

			return {
				name: l.name,
				link: l,
				type: 'account',
				fill: l.accounts.find(a => a.account_id === $route.state.pickAccount.account),
				children: [...l.accounts.map(a => {
					return {
						name: a.name,
						type: 'action',
						fill: $route.state.pickAccount.account === a.account_id,
						click: () => {
							$route.state.pickAccount.account = a.account_id
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
			$route.pickAccount.children = [{
				name: 'Select Links',
				description: 'You haven\'t selected any custom accounts for this budget.',
				fill: true,
				type: 'action',
				click: () => $route.current = $route.selectAccounts
			}]
	}

	$route.pickBudget = {}
	const updatePickBudget = () => {
		if (!$route.state.pickBudget) $route.state.pickBudget = {}

		$route.pickBudget.name = 'Select Budget'
		$route.pickBudget.children = [...$links.budgets.map(b => {
			return {
				name: b.name,
				type: 'action',
				fill: $links.selected === b,
				close: updateBudgets,
				children: [{
					name: 'Name',
					type: 'input',
					placeholder: 'Budget Name',
					value: b.name,
					set: v => {
						b.name = v
						$route = $route
					}
				}, { type: 'spacer' }, {
					name: 'Delete Budget',
					type: 'action',
					dangerous: true,
					click: () => {
						$links = $links.remove.budget(b.name)
						$route = $route
						return 1
					}
				}],
				click: () => {
					$links.selected = b
					$route = $route
					updateBudgets()
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
				value: $route.state.pickBudget.name,
				set: v => $route.state.pickBudget.name = v
			}, {
				name: 'Add',
				type: 'action',
				submit: true,
				disabled: !$route.state.pickBudget.name,
				fill: true,
				click: () => {
					$links = $links.add.budget({
						...$links.default(),
						name: $route.state.pickBudget.name
					})
					$route = $route
					updateBudgets()
					return 1
				}
			}]
		}]
	}

	$route.pickCategory = {}
	const updatePickCategory = () => {
		if (!$route.state.pickCategory) $route.state.pickCategory = {}

		$route.pickCategory.hint = $route.state.pickCategory.hint
		$route.pickCategory.disabled = $route.state.pickCategory.disabled == true
		$route.pickCategory.name = (!$route.state.pickCategory.overflow && !$route.state.pickCategory.manual) ? 'Auto' : $route.state.pickCategory?.category ?? 'Select Category'
		$route.pickCategory.icon = (!$route.state.pickCategory.overflow && !$route.state.pickCategory.manual) && 'sparkle'
		$route.pickCategory.fill = (!$route.state.pickCategory.overflow && !$route.state.pickCategory.manual) || $route.state.pickCategory?.category
		$route.pickCategory.children = [...$links.selected.groups.map(g => {
			return {
				name: g.name,
				fill: ($route.state.pickCategory.overflow || $route.state.pickCategory.manual) && $route.state.pickCategory.group === g.name,
				click: () => $route.state.pickCategory.groupName = g.name,
				children: [...g.categories.map(c => {
					return {
						name: c.name,
						type: 'action',
						disabled: (($route.state.pickCategory.disabled?.length && $route.state.pickCategory.disabled) ?? []).find(d => d.group === g.name && d.name === c.name),
						fill: ($route.state.pickCategory.overflow || $route.state.pickCategory.manual) && $route.state.pickCategory.category === c.name,
						click: () => {
							$route.state.pickCategory.group = g.name
							$route.state.pickCategory.category = c.name
							if (!$route.state.pickCategory.overflow) $route.state.pickCategory.manual = true
							return 2
						}
					}
				}), {
					name: 'New Category',
					children: [{
						name: 'Name',
						type: 'input',
						placeholder: 'Category Name',
						value: $route.state.pickCategory?.categoryName,
						set: v => $route.state.pickCategory.categoryName = v
					}, {
						name: 'Description',
						fill: $route.state.pickCategory?.description,
						children: [{
							name: 'Description',
							type: 'textarea',
							placeholder: 'Add a description to help Budgeteer sort your transactions with higher accuracy.',
							value: $route.state.pickCategory?.description,
							set: v => $route.state.pickCategory.description = v
						}]
					}, {
						name: 'Value',
						type: 'money',
						placeholder: 'Category Value',
						value: $route.state.pickCategory?.categoryValue,
						set: v => $route.state.pickCategory.categoryValue = v
					}, {
						name: 'Add',
						type: 'action',
						submit: true,
						fill: true,
						disabled: !$route.state.pickCategory?.categoryName,
						click: () => {
							// TODO: if route protected, don't set
							delete $route.state.pickCategory.new
							$links = $links.add.category($route.state.pickCategory.groupName, $route.state.pickCategory.categoryName, { description: $route.state.pickCategory.description || '', value: parseFloat($route.state.pickCategory.categoryValue) || 0 })
							$route.state.pickCategory.group = $route.state.pickCategory.groupName
							$route.state.pickCategory.category = $route.state.pickCategory.categoryName
							$route.state.pickCategory.categoryName = undefined
							$route.state.pickCategory.categoryValue = undefined
							queue.enq(async () => {
								$links = await $links.ai.category($route.state.pickCategory.group, $route.state.pickCategory.category)
								$links = $links.sort(...$links.which.transactions(t => !t.properties.manual))
								$route = $route
							})
							updateBudgets()
							return 1
						}
					}]
				}]
			}
		}), {
			name: 'New Group',
			click: () => $route.state.pickCategory.groupName = undefined,
			children: [{
				name: 'Name',
				type: 'input',
				placeholder: 'Group Name',
				value: $route.state.pickCategory?.groupName,
				set: v => $route.state.pickCategory.groupName = v
			}, {
				name: 'Add',
				type: 'action',
				submit: true,
				fill: true,
				disabled: !$route.state.pickCategory?.groupName,
				click: () => {
					$links = $links.add.group($route.state.pickCategory.groupName)
					$route.state.pickCategory.groupName = undefined
					updateBudgets()
					return 1
				}
			}]
		}, { type: 'spacer' }, ]
		if ($route.state.pickCategory.overflow) {
			$route.pickCategory.children.push({
				name: 'Deselect',
				type: 'action',
				dangerous: true,
				disabled: !$route.state.pickCategory.category,
				click: () => {
					$route.state.pickCategory.group = undefined
					$route.state.pickCategory.category = undefined
					return 1
				}
			})
		} else {
			$route.pickCategory.children.push({
				name: 'Auto',
				icon: 'sparkle',
				type: 'action',
				fill: !$route.state.pickCategory.manual,
				click: () => {
					$route.state.pickCategory.manual = false
					return 1
				}
			})
		}
	}

	$route.transaction = {}
	const format = d => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
	const updateTransaction = () => {
		if (!$route.state.transaction) $route.state.transaction = {}
		$route.state.transaction.new = structuredClone($route.state.transaction.new ?? $route.state.transaction)
		$route.state.transaction.new.date = $route.state.transaction.new.date ? toDate($route.state.transaction.new.date) : new Date()

		if ($route.state.transaction.new.new) delete $route.state.transaction.new.new

		if (!$route.state.transaction.new.properties) $route.state.transaction.new.properties = {}

		if ($route.current === $route.transaction) {
			$route.state.pickCategory = $route.state.transaction.new.properties
			$route.state.pickCategory.hint = 'Category'
			$route.state.pickAccount = $route.state.transaction.new
			$route.state.pickAccount.hint = 'Account'
			$route.state.pickAccount.enabled = [...$links.selected.accounts.filter(id => $links.links.find(l => !l.institution).accounts.find(a => a.account_id === id))]
		}

		$route.transaction.name = $route.state.transaction.id	? 'Edit Transaction' : 'Add Transaction'
		$route.transaction.quit = async () => {
			if ($route.state.transaction.id) {
				if (!$route.state.transaction.new.name) $route.state.transaction.new.name = $route.state.transaction.name
				else if ($route.state.transaction.name !== $route.state.transaction.new.name ?? $route.state.transaction.name) {
					const id = $route.state.transaction.id

					queue.enq(async () => {
						$links = await $links.ai.transaction(id)
						$links = $links.sort(...$links.which.transactions(t => t.id === id))
					})
				}
				// Auto sort
				if (!$route.state.transaction.new.properties.manual) $links = $links.sort($route.state.transaction.new)

				const data = $links.update.transaction($route.state.transaction.id, $route.state.transaction.new)
				if (data) {
					$links = data
					// Edit Custom
					$links.links.forEach(l => {
						const t = l.transactions.find(t => t.id === $route.state.transaction.id)
						if (t) Object.assign(t, $route.state.transaction.new)
					})
					delete $route.state.transaction.new
					updateBudgets()
					updateLinks()
					return
				}
				delete $route.state.transaction.new
			} else {
				delete $route.state.transaction.new
				updateBudgets()
				updateLinks()
			}
		}
		$route.transaction.children = [$route.pickCategory, $route.pickAccount, {
			name: 'Name',
			type: 'input',
			placeholder: 'Transaction Name',
			value: $route.state.transaction.new?.name,
			set: v => $route.state.transaction.new.name = v
		}, {
			name: 'Amount',
			type: 'money',
			placeholder: 'Transaction Amount',
			value: $route.state.transaction.new?.amount,
			set: v => $route.state.transaction.new.amount = parseFloat(v)
		}, {
			hint: 'Date',
			name: format($route.state.transaction.new?.date ?? new Date()),
			children: [{
				name: 'Date',
				type: 'date',
				value: $route.state.transaction.new?.date,
				set: v => $route.state.transaction.new.date = v
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
					$links = $links

					delete $route.state.transaction.new
					$route.state = {}
					updateBudgets()
					updateLinks()
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
					queue.enq(async () => {
						$links = $links.add.transaction(t)
						$links = await $links.ai.transaction(t.id)
						$links = $links.sort(...$links.which.transactions(u => u.id === t.id))
						$links.links.find(l => !l.institution).transactions.push(t)
					})
					return 1
				}
			})
		}
	}

	$route.category = {}
	const conflicts = (group, category) => {
		let categories = []
		$links.selected.groups.forEach(g => {
			g.categories.forEach(c => {
				if (c.overflow?.group === group && c.overflow?.category === category)
					categories.push(c, ...conflicts(g.name, c.name))
			})
		})

		return categories
	}
	const updateCategory = () => {
		if (!$route.state.category) $route.state.category = {}
		$route.state.category.new = structuredClone($route.state.category.new ?? $route.state.category)
		if ($route.state.category.new.new) delete $route.state.category.new.new

		if (!$route.state.category.new.overflow) $route.state.category.new.overflow = {}

		if ($route.current === $route.category) {
			$route.state.pickCategory = $route.state.category.new.overflow
			let categories = conflicts($route.state.category.group?.name, $route.state.category.name)

			$route.state.pickCategory.disabled = num($route.state.category.new.value) ? [
				$route.state.category,
				...categories
			] : true
			updatePickCategory()
			$route.state.pickCategory.hint = $route.state.category.new.spend ? 'Underflow' : 'Overflow'
			$route.state.pickCategory.overflow = true
		}

		$route.category.name = 'Edit Category'
		$route.category.quit = () => {
			// Remove circular reference
			delete $route.state.category.new.overflow.disabled

			// Should we update PFCs?
			const update = $route.state.category.new.group && $route.state.category.name !== $route.state.category.new.name

			// Update category
			const data = $links.update.category($route.state.category.group, $route.state.category.name, $route.state.category.new.group ? $route.state.category.new : null)

			if (update) queue.enq(async () => $links.ai.category($route.state.category.new.group, $route.state.category.new.name))
			delete $route.state.category.new
			if (data) {
				$links = data
				updateBudgets()
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
		}, $route.pickCategory, { type: 'spacer' }, {
			name: 'Remove Category',
			type: 'action',
			dangerous: true,
			click: () => {
				$route.state.category.new = {}
				return 1
				// $links = $links.remove.category($route.state.category.new.group, $route.state.category.new.name)
				// updateBudgets()
				// return 1
			}
		}]
	}

	$route.group = {}
	const updateGroup = () => {
		if (!$route.state.group) $route.state.group = {}
		$route.state.group.new = structuredClone($route.state.group.new ?? $route.state.group)
		if ($route.state.group.new.new) delete $route.state.group.new.new

		$route.group.name = 'Edit Group'
		$route.group.quit = () => {
			if ($route.state.group.name !== $route.state.group.new.name) {
				const { data, error } = $links.update.group($route.state.group.name, $route.state.group.new)
				$links = data
				if (!error) updateBudgets()
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
							$links = $links
							updateBudgets()
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
						updateBudgets()
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
				updateBudgets()
				return 1
			}
		}]
	}

	const update = () => {
		if (!$links.selected) return

		updateTransaction()
		updatePickCategory()
		updatePickAccount()
		updateSelectAccounts()
		updateGroup()
		updateCategory()
		updatePickBudget()
	}

	$: {
		const message = $page.url.searchParams.get('error')
		if (message) {
			notifications.add({ type: 'error', message })
			if (browser) goto('.', { replaceState: true })
		}
	}

	onMount(async () => {
		if ($page.url.pathname === '/demo') $route.current = undefined

		const { data } = supabase.auth.onAuthStateChange((_, _session) => {
			updateAccount(_session)
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth')
				invalidateAll()
			}

			if ($page.url.pathname === '/' && _session) {
				$route.current = undefined
				goto('/app')
			}
			if ($page.url.pathname === '/app' && !_session) {
				$route.current = undefined
				goto('/')
			}
		})

		return () => data.subscription.unsubscribe()
	})

	$: update($route)

	const MINUTE = 60 * 1000
	const FREQUENCY = 5 * MINUTE

	$: console.log($links.links)

	const refreshLinks = async () => {
		// Within cooldown range OR been 3 * FREQUENCY since last active
		if ((storage.get('cooldown') && new Date().getTime() - storage.get('cooldown') < FREQUENCY)
			|| (storage.get('active') && 3 * FREQUENCY < new Date().getTime() - storage.get('active')))
			return

		const ls = await plaid.getLinks()
		if (!ls.length) return

		// ls.push($links.links.find(l => !l.institution))
		$links.set.links(ls)
		$links = $links
	}

	const init = async () => {
		// Step 1: get budgets
		$links = new Links(storage.get('links'), m => notifications.add({ type: 'error', message: m }), supabase.invoke)

		let { budgets, selected } = await supabase.getBudgets()

		if (budgets) {
			// Step 2: budgets exist, so user must be set up -
			// ...get links from DB
			const data = await supabase.getLinks()

			$links.set.links(data)
			
			// Step 3: When possible, get links from Plaid and
			// ...update DB now that the user most likely has
			// ...some links already
			queue.enq(supabase.updateLinks)
		} else {
			budgets = [$links.default()]
			selected = budgets[0]
			await supabase.setBudgets({ budgets, selected })
		}
		
		$links.budgets = budgets
		$links.selected = selected

		storage.set('links', $links)

		supabase.setBudgets({
			budgets: $links.budgets,
			selected: $links.selected,
			groups: $links.groups
		})

		setTimeout(() => {
			setInterval(() => {
				queue.enq(refreshLinks)
			}, FREQUENCY)
		}, FREQUENCY)
	}

	const stored = () => {
		if (storage.get('links')) $links = storage.get('links')
	}

	const tab = uuidv4()

	const check = () => {
		let tabs = storage.get('tabs') ?? []
		const now = new Date().getTime()
		tabs = tabs.filter(t => now - t.time < MINUTE)
		const index = tabs.findIndex(t => t.name === tab)
		if (index === -1) tabs.push({ name: tab, time: now })
		else tabs[index].time = now
		if (tabs.length === 1 && !tabs[0].leader) {
			tabs[0].leader = true
			queue.enq(init)
		} else stored()
		storage.set('tabs', tabs)
	}

	onMount(() => {
		check()
		setTimeout(check, MINUTE)
		// If any value is present, don't initialize
		const redirect = $page.url.searchParams.get('redirect')
		if (redirect) queue.enq(cont)
		else queue.enq(init)
	})
</script>

<svelte:window on:keydown={active} on:mousemove={active} />

<main>
	<Notifications />
	<!-- svelte-ignore empty-block -->
	{ #if $route.current?.loading }
	{ :else if $route.current?.assistant }
		<Modal alpha={0} on:close={() => $route.current = undefined}>
			<Assistant {session} />
		</Modal>
	{ :else if $route.current }
		<Modal closable={false} on:close={quit}>
			<Menu bind:menu={$route.current} on:close={quit} />
		</Modal>
	{ /if }
	<div class="top">
		<Header {data} />
	</div>
	<div class="fill">
		<slot {data} />
	</div>
	<div class="bottom">
		<Footer {session} />
	</div>
</main>

<style>
	main {
		height: 100%;
		justify-content: stretch;
		align-items: stretch;
	}

	.top {
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.bottom {
		position: sticky;
		bottom: 0;
	}

	.fill {
		flex: 1;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
	}
</style>