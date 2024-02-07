import { writable } from "svelte/store"
import { get } from 'svelte/store'
import Links from '$lib/classes2/Links'

export const links = writable(new Links())

const d = new Date()
d.setDate(1)
d.setHours(0, 0, 0, 0)
export const date = writable(d)