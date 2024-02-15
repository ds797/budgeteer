<script>
	import { tick } from 'svelte'
	import { slide } from '$lib/utils/transition'
	import Account from '$lib/svg/Account.svelte'
	import Sparkle from '$lib/svg/Sparkle.svelte'
	import Loading from '$lib/components/Loading.svelte'

	export let supabase

	let width, height

	let message = ''

	let chats = []
	let thinking = false
	let response

	const scroll = async node => {
		await tick()
		node.scroll({ top: node.scrollHeight, behavior: 'smooth' });
	}

	const ask = async () => {
		thinking = !thinking
		chats = [...chats, {
			role: 'user',
			content: message
		}]
		message = ''
		scroll(response)

		const { data } = await supabase.invoke('ai', { type: { assistant: chats } })

		console.log(data)
		chats = [...chats, {
			role: 'assistant',
			content: data
		}]
		scroll(response)
		// const response = await fetch('https://mabqpjflhufudqpifesa.supabase.co/functions/v1/ai', {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-type': 'application/json',
		// 		'Authorization': `Bearer ${session.access_token}`
		// 	},
		// 	body: JSON.stringify({ type: { assistant: chats } })
		// })

		// const reader = response.body.getReader()
		// while (true) {
		// 	const { done, value } = await reader.read()
		// 	console.log(value, done)
		// 	if (done) break
		// 	const text = new TextDecoder().decode(value)
		// 	console.log('got text', text)
		// 	chats[chats.length - 1].content += text
		// }
		thinking = false
	}

	const key = e => e.key === 'Enter' && !thinking && ask()
</script>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} />

<main style="width: {width / 1.5}px; height: {height / 1.5}px;">
	<div class="response" bind:this={response}>
		{ #each chats as chat, index }
			{ #if chat.content }
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
									<Sparkle size={'1.5rem'} />
								{ /if }
							</div>
							<div class="message">
								{ #each chat.content.split('\n') as chunk }
									<p>{chunk}</p>
								{ /each }
							</div>
						</div>
					</div>
				</div>
			{ /if }
		{ /each }
	</div>
	<div class="send">
		<input class="none" on:keydown={key} bind:value={message}>
		<button class="fill" class:disabled={thinking || !message.length} on:click={ask}>
			Send
			{ #if thinking }
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
		gap: 0.5rem;
	}

	.role .icon {
		min-width: 1.5rem;
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