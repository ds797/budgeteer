export const signin = async (email, password) => {
	const { user, error: e } = await supabase.auth.signIn({ email, password });

	if (e) error(e.message);

	return user;
}