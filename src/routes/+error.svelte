<script>
	import { page } from '$app/stores';
</script>

<main>
	<h1 class="hero">{$page.status}</h1>
	<h1>{$page.error.message}</h1>
</main>

<style>
	.hero {
		font-size: 15vw;
	}
</style>