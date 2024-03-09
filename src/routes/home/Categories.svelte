<script>
	import { links } from '$lib/stores/user'
	import { route } from '$lib/stores/ui'
	import { month as compareMonth } from '$lib/utils/compare'
	import Progress from '$lib/components/element/Progress.svelte'

	export let month = new Date()

	let date = new Date()

	const updateDate = () => {
		if (month.getMonth() === new Date().getMonth()) date = new Date()
		else {
			const d = new Date()
			d.setMonth(month.getMonth() + 1)
			d.setDate(0)
			d.setHours(23, 59, 59, 999)
			date = d
		}
	}
	$: updateDate(month)

	const sum = (group, category) => {
		console.log(category)
		return $links.get.sum(t =>
			t.properties.group === group.name
			&& t.properties.category === category.name
			&& (category.spend ? t.amount < 0 : 0 < t.amount)
			&& !t.properties.hide && compareMonth(t.date, date)
		) + $links.get.overflow(group.name, category.name, t =>
			(category.spend ? t.amount < 0 : 0 < t.amount)
			&& !t.properties.hide && compareMonth(t.date, date)
		)
	}

	const click = (group, category) => {
		$route.state.category = category
		$route.state.category.group = group.name
		$route.current = $route.category
	}

	const gradient = category => {
		return category.spend
		? ['var(--text-good)', 'var(--text-okay)', 'var(--text-bad)']
		: ['var(--text-bad)', 'var(--text-okay)', 'var(--text-good)']

	}
</script>

<main>
	{ #each $links.selected.groups as group }
		{ #each group.categories as category }
			{ @const amount = Math.abs(sum(group, category))}
			<button class="none category" on:click={() => click(group, category)}>
				<div class="fraction">
					<p>{Math.round(amount)}</p>
					<div class="bar" />
					<p>{Math.round(parseFloat(category.value ?? 0))}</p>
				</div>
				<Progress vertical={true} max={parseFloat(category.value ?? 0)} value={amount} gradient={gradient(category)} />
				{ #if category.emoji }
					<p class="emoji">{category.emoji}</p>
				{ :else }
					<p class="emoji">🤔</p>
				{ /if }
			</button>
		{ /each }
	{ /each }
</main>

<style>
	main {
		flex-flow: row;
		gap: 0.75rem;
	}

	.category {
		min-height: 8.5rem;
		display: flex;
		flex-flow: column;
		align-items: center;
		gap: 0.5rem;
	}

	.fraction {
		width: 2rem;
		display: flex;
		flex-flow: column;
		align-items: stretch;
	}

	.fraction p {
		font-size: 0.75rem;
		text-align: center;
	}

	.fraction .bar {
		height: 0.0625rem;
		margin: 0 0.375rem;
		background: var(--accent-0);
		border-radius: 1rem;
	}

	.emoji {
		font-size: 1.25rem;
	}
</style>