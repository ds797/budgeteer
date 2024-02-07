export const hash = path => {
	const url = new URL(window.location.href)
	url.pathname = path

	const state = { path }
	window.history.pushState(state, '', url)
}