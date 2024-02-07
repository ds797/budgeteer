export const toTransaction = (...transactions) => {
	return transactions.map(t => {
		return {
			id: t.transaction_id,
			amount: t.amount,
			date: t.authorized_date ?? t.date,
			account: t.account_id,
			merchant: t.merchant_name,
			name: t.name,
			category: t.category
		}
	})
}

export const toDate = s => {
	if (typeof s === 'object') return s

	const [year, month, date] = s.split('-').map(Number)

	return new Date(year, month - 1, date)
}