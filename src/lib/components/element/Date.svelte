<script>
	import { start, count } from '$lib/utils/date'
	import Chevron from '$lib/svg/Chevron.svelte'

	export let calendars = 1
	export let max
	export let value = new Date()
	export let set = v => v
	export let style = {}

	let d = new Date(value)

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
				<button class="none arrow" on:click={() => {
					d.setMonth(d.getMonth() - 1)
					d = d
				}} style={style?.arrows ?? ''}>
					<Chevron direction={'left'} size={'1.5rem'} />
				</button>
				{ #key internal.month }
					<h2 class="month">{d.toLocaleString('default', { month: 'short' })}</h2>
				{ /key }
				<h2 class='year'>{d.getFullYear()}</h2>
				<button class="none arrow" class:disabled={max && max.getMonth() <= d.getMonth() && max.getFullYear() <= d.getFullYear()} on:click={() => {
					d.setMonth(d.getMonth() + 1)
					d = d
				}} style={style?.arrows ?? ''}>
					<Chevron direction={'right'} size={'1.5rem'} />
				</button>
			</div>
			<div class='month' style={style?.month ?? ''}>
				<div class='days' style={style?.days ?? ''}>
					{ #each Array(42) as _, i }
						{ @const day = new Date(new Date(d).setDate(i - before + 1)).setHours(0, 0, 0, 0) }
						{ @const date = i - before + 1 }
						<button class:disabled={date < 1 || date > days || (max && max.getDate() < date && max.getMonth() <= d.getMonth() && max.getFullYear() <= d.getFullYear())} class:fill={day === new Date(internal).setHours(0, 0, 0, 0)} on:click={() => set(new Date(day))} style={style?.day ?? ''}>
							{date < 1 ? prev - before + i + 1 : date > days ? i - days - before + 1 : date}
						</button>
					{ /each }
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

	.text h2 {
		margin: 0;
		width: 3rem;
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
		align-items: center;
		gap: 0.25rem;
	}

	button {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button.day.disabled {
		background: none;
	}

	.month {
		align-items: flex-start;
	}

	.year {
		display: flex;
		flex-flow: column;
		color: var(--text-weak);
		align-items: flex-end;
	}

	.days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		grid-template-rows: repeat(6, 1fr);
		gap: 0.25rem;
	}

	.disabled {
		opacity: 75%;
	}
</style>