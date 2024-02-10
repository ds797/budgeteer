import OpenAI from 'npm:openai'

export const openai = new OpenAI({ apiKey: Deno.env.get('SECRET_OPENAI_KEY') })

export const sort = async message => {
	const instructions = `This model takes transactions that have associated metadata and re-categorizes them into user-defined categories. The input is a JSON object with two properties: 'transactions', which is the array of transactions to sort, and 'user_groups', which is the array of category groups the transactions must be sorted into. Each transaction is an object with three properties: 'name', 'merchant', and 'general_categories'. Use this data to determine which group and category from 'user_groups' fits the transaction best. Return a JSON object which has a single property: 'sorted', an array of objects each with the following properties: 'group' and 'category'. The group and category are the ones you chose for the transaction. They MUST be chosen from user_groups.`
	// const instructions2 = `You're an assistant that sorts transactions for a budgeting application. You're given an object in JSON format with two keys: 'transactions' and 'user_defined'. 'user_defined' is an array of category groups, that the user created, each category group has an array of categories. 'transactions' is an array of transactions, each with a name, merchant, and general_categories. General categories is determined by a third party. What you need to do is return a JSON object with one property: 'sorted', which is an array of objects. Each object has two properties: 'group' and 'category', both of which are determined by taking the three parameters of each transaction into account and finding the best-fitting category and category group of the ones provided in 'user_defined'. Importantly, you're not to use any categories provided in each transaction's 'general_categories' field -- as you're sorting these transactions for a budgeting app, they need to be sorted into the user_defined groups and categories. Also, each category MUST be a subcategory of the group you choose -- don't choose a category that's a subcategory of a different group.`

	try {
		const completion = await openai.chat.completions.create({
			messages: [{
				role: 'system',
				content: instructions
			}, {
				role: 'user',
				content: JSON.stringify(message),
			}],
			model: 'gpt-3.5-turbo-1106',
			response_format: { type: 'json_object' }
		})

		return completion.choices[0].message.content
	} catch (error) {
		return { error: 'Error sorting transactions' }
	}
}