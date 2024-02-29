export const toDate = s => {
	if (typeof s === 'object') return s

	const [year, month, date] = s.split('-').map(Number)

	return new Date(year, month - 1, date)
}

export const fromDate = d => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${(d.getDate()).toString().padStart(2, '0')}`