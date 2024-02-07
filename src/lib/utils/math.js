export const random = (max = 1, min = 0) => {
	min = Math.ceil(min);
	max = Math.floor(max);

	return Math.floor(Math.random() * (max - min + 1) + min);
}

export const cos = deg => {
	return Math.cos(deg * Math.PI / 180);
}

export const sin = deg => {
	return Math.sin(deg * Math.PI / 180);
}

export const tan = deg => {
	return Math.tan(deg * Math.PI / 180);
}

export const sign = num => {
	return typeof num === 'number' ? num ? num < 0 ? -1 : 1 : num === num ? 0 : NaN : NaN;
}

export const clamp = (num, range) => {
	let min = range?.min ?? -Infinity;
	let max = range?.max ?? Infinity;

	if (num < min) num = min;
	if (max < num) num = max;

	return num;
}

export const rollover = (num, range) => {
	range.min ??= -Infinity;
	range.max ??= Infinity;

	// Inclusive
	if (num < min) num += max;
	// Exclusive
	if (max <= num) num %= max;

	return num;
}

export const num = v => {
	v = parseFloat(v)

	if (v === v) return true
}

export const digify = string => {
	let num = parseFloat(string);

	if (isNaN(num)) num = 0;

	return num;
}

export const min = array => {
	let min = 0
	for (const v of array) if (v < min) min = v

	return min
}

export const max = array => {
	let max = 0
	for (const v of array) if (v > max) max = v

	return max
}