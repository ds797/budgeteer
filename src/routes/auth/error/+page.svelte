<script>
	import { onMount } from 'svelte'
	import { notifications } from '$lib/stores/ui'

	onMount(() => {
		$notifications = [...$notifications, {
			type: 'error',
			message: 'Invalid authentication'
		}]
		window.location.href = ''
	})
</script>