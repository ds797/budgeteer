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