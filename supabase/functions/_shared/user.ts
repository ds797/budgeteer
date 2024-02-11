import { createAnon } from "./anon.ts"

export const user = async (req: any) => {
	const anon = createAnon(req)
	const { data: { user }, error } = await anon.auth.getUser()

	return user?.id
}