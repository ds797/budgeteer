<script>
	import { onMount, tick } from 'svelte'
	import { slide } from '$lib/utils/transition'
	import { month } from '$lib/utils/compare'
	import { links, date } from '$lib/stores/user'
	import { notifications, assistant } from '$lib/stores/ui'
	import Account from '$lib/svg/Account.svelte'
	import Sparkle from '$lib/svg/Sparkle.svelte'
	import Loading from '$lib/components/Loading.svelte'

	export let session

	let width, height

	let message = ''

	let input, response

	const scroll = async () => {
		await tick()
		response.scroll({ top: response.scrollHeight, behavior: 'smooth' })
	}

	const ask = async () => {
		$assistant.thinking = !$assistant.thinking
		$assistant.chats = [...$assistant.chats, {
			role: 'user',
			content: message
		}, {
			role: 'assistant',
			content: ''
		}]
		message = ''
		scroll()

		const obj = structuredClone($links.selected)
		delete obj.accounts
		delete obj.groups
		const context = JSON.stringify({
			inflow: $links.get.sum(t => !t.properties.hide && t.amount > 0 && month(t.date, $date)),
			outflow: obj.month_outflow = $links.get.sum(t => !t.properties.hide && t.amount < 0 && month(t.date, $date)),
			transactions: $links.which.transactions(t => {
				// Check if transactions are within last three months
				const one = new Date($date)
				one.setMonth($date.getMonth() - 1)
				const two = new Date($date)
				two.setMonth($date.getMonth() - 2)
				return month(t.date, $date) || month(t.date, one) || month(t.date, two)
			}).map(t => {
				return {
					name: t.name,
					amount: t.amount,
					date: t.date,
					properties: t.properties
				}
			})
		})

		try {
			const res = await fetch('https://mabqpjflhufudqpifesa.supabase.co/functions/v1/ai', {
				method: 'POST',
				headers: {
					'Content-type': 'application/json',
					'Authorization': `Bearer ${session.access_token}`
				},
				body: JSON.stringify({ type: { assistant: { context: `Metadata: ${context}`, messages: $assistant.chats } } })
			})

			const reader = res.body.getReader()
			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				const text = new TextDecoder().decode(value)
				$assistant.chats[$assistant.chats.length - 1].content += text
				scroll()
			}
		} catch (error) {
			notifications.add({ type: 'error', message: error })
		}
		$assistant.thinking = false
	}

	onMount(() => {
		input.focus()
		scroll()
	})

	const key = e => e.key === 'Enter' && !$assistant.thinking && ask()
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<main style="width: {width / 1.5}px; height: {height / 1.5}px;">
	<div class="response" bind:this={response}>
		<div transition:slide>
			<div class="chat">
				<div class="role">
					<div class="icon">
						<Sparkle size={'1.5rem'} />
					</div>
					<div class="message">
						<p>Ask AI any questions you have about your budget!</p>
					</div>
				</div>
			</div>
			<div class="bar" />
		</div>
		{ #each $assistant.chats as chat, index }
			<div transition:slide>
				{ #if index !== 0 }
					<div class="bar" />
				{ /if }
				<div class="chat">
					<div class="role">
						<div class="icon">
							{ #if chat.role === 'user' }
								<Account size={'1.5rem'} />
							{ :else }
								{ #if chat.content === '' }
									<Loading size={'1rem'} border={'0.125rem'} />
								{ :else }
									<Sparkle size={'1.5rem'} />
								{ /if }
							{ /if }
						</div>
						<div class="message">
							{ #each (chat.content ?? '').split('\n') as chunk }
								<p>{chunk}</p>
							{ /each }
						</div>
					</div>
				</div>
			</div>
		{ /each }
	</div>
	<div class="send">
		<input bind:this={input} class="none" on:keydown={key} bind:value={message}>
		<button class="fill" class:disabled={$assistant.thinking || !message.length} on:click={ask}>
			Send
			{ #if $assistant.thinking }
				<div transition:slide={{ axis: 'both' }} class="icon">
					<Loading size={'0.5rem'} border={'0.125rem'} />
				</div>
			{ /if }
		</button>
	</div>
</main>

<style>
	main {
		width: 25rem;
		height: 20rem;
		display: flex;
		align-items: stretch;
		gap: 1rem;
	}

	.response {
		padding: 0.5rem;
		flex: 1;
		display: flex;
		flex-flow: column;
		align-items: stretch;
		background: var(--bg-1);
		border-radius: 0.375rem;
		box-shadow: var(--shadow);
		overflow-y: auto;
	}

	.role {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
	}

	.role .icon {
		min-width: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.message {
		display: flex;
		flex-flow: column;
		gap: 0.25rem;
	}

	.bar {
		height: 0.125rem;
		margin: 0.5rem 0;
		background: var(--text-bg);
		border-radius: 0.25rem;
	}

	.send {
		padding: 0.5rem;
		display: flex;
		justify-content: stretch;
		align-items: stretch;
		gap: 0.5rem;
		background: var(--bg-1);
		border-radius: 0.375rem;
		box-shadow: var(--shadow);
	}

	.send > input {
		min-width: 0;
		flex: 1;
	}

	.send > button {
		width: 4.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.fill .icon {
		margin: 0 0.25rem;
		padding: 0.125rem;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
	}
</style>