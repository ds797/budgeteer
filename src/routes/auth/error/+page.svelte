<script>
	import { onMount } from 'svelte'
	import { notifications } from '$lib/stores/ui'

	onMount(() => {
		notifications.add({
			type: 'error',
			message: 'Invalid authentication'
		})
		window.location.href = ''
	})
</script>