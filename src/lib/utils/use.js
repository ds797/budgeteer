export const outside = node => {
	const click = e => {
		if (e.target === node && !e.defaultPrevented)
			node.dispatchEvent(new CustomEvent('child', { detail: e }))
		if (node && !node.contains(e.target) && !e.defaultPrevented)
			node.dispatchEvent(new CustomEvent('outside', { detail: e }))
	}

	document.addEventListener('click', click, true)
	
	return { destroy: () => document.removeEventListener('click', click, true) }
}

export const scroll = node => {
	const calc = e => {
		let x = 0
		let y = 0

		let parent = e.target

		while (parent) {
			x += parent.scrollLeft ?? 0
			y += parent.scrollTop ?? 0
			parent = parent.parentNode
		}

		node.dispatchEvent(new CustomEvent('change', { detail: { x, y } }))
	}

	document.addEventListener('scroll', calc, true)

	return { destroy: () => document.removeEventListener('scroll', calc, true) }
}