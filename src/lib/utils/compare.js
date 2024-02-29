import { toDate } from '$lib/utils/date'

export const month = (one, two) => {
	one = toDate(one)
	two = toDate(two)

	if (one.getMonth() !== two.getMonth()) return false
	if (one.getFullYear() !== two.getFullYear()) return false

	return true
}