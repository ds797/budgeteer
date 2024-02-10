export const toDate = s => {
	if (typeof s === 'object') return s

	const [year, month, date] = s.split('-').map(Number)

	return new Date(year, month - 1, date)
}