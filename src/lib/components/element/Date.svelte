<script>
	import Chevron from '$lib/svg/Chevron.svelte'

	export let calendars = 1
	export let value = new Date()
	export let set = v => v

	let d = new Date(value)

	const start = d => {
		const first = new Date(d.getFullYear(), d.getMonth(), 1)

		return first.getDay()
	}

	const count = d => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()

	$: internal = value
	$: internal, value.getTime() !== internal.getTime() && set(internal)
</script>

<main>
	{ #each Array(calendars) as _, index }
		{ @const before = start(d) }
		{ @const prev = count(new Date(new Date(d).setMonth(d.getMonth() - 1))) }
		{ @const days = count(d) }

		<div class='container'>
			<div class='text'>
				<button class="none day" on:click={() => {
					d.setMonth(d.getMonth() - 1)
					d = d
				}}>
					<Chevron direction={'left'} size={'1.5rem'} />
				</button>
				{ #key internal.month }
					<h2>{d.toLocaleString('default', { month: 'short' })}</h2>
				{ /key }
				<h2 class='year'>{d.getFullYear()}</h2>
				<button class="none day" on:click={() => {
					d.setMonth(d.getMonth() + 1)
					d = d
				}}>
					<Chevron direction={'right'} size={'1.5rem'} />
				</button>
			</div>
			<div class='month'>
				<div class='days'>
					{ #each Array(42) as _, i }
						{ @const day = new Date(new Date(d).setDate(i - before + 1)).setHours(0, 0, 0, 0) }
						{ @const date = i - before + 1 }
						<button class:disabled={date < 1 || date > days} class:fill={day === new Date(internal).setHours(0, 0, 0, 0)} on:click={() => set(new Date(day))}>
							{date < 1 ? prev - before + i + 1 : date > days ? i - days - before + 1 : date}
						</button>
					{ /each }
					<!-- { #each Array(before) as _, i }
						{ @const month = new Date(new Date(d).setMonth(d.getMonth() - 1)) }
						<button class="day disabled">
							{count(month) - start(d) + i + 1}	
						</button>
					{ /each }
					{ #each Array(days) as _, index }
						{ @const day = new Date(new Date(d).setDate(index + 1)).setHours(0, 0, 0, 0) }
						<button class="day" class:fill={day === new Date(internal).setHours(0, 0, 0, 0)} on:click={() => set(new Date(day))}>
							{index + 1}
						</button>
					{ /each }
					{ #each Array(after) as _, i }
						<button class="day disabled">
							{i + 1}	
						</button>
					{ /each } -->
				</div>
			</div>
		</div>
	{ /each }
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2rem !important;
	}

	h2 {
		margin: 0;
	}

	p {
		margin: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 500;
		color: var(--accent);
		user-select: none;
	}

	.container {
		display: flex;
		flex-flow: column;
		gap: 1rem;
	}

	.month {
		display: flex;
		flex-flow: column;
		align-items: center;
	}

	.text {
		display: flex;
		justify-content: space-between;
		gap: 0.25rem;
	}

	.year {
		color: var(--text-weak);
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		grid-template-rows: repeat(6, 1fr);
		gap: 0.25rem;
	}

	.day {
		width: 2rem;
		height: 2rem;
	}

	.selected {
		background: var(--plink);
		color: var(--neutral-high);
	}

	.disabled {
		opacity: 75%;
	}
</style>