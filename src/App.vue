<script setup lang="ts">
import { useProfileStore } from './store';
import { onMounted } from 'vue';

const profileStore = useProfileStore();

onMounted(() => {
	profileStore.fromUrl();
});
</script>

<template>
	<main class="container">
		<RouterView />
	</main>
	<footer>
		Made by
		<a href="https://app.profcomff.com"><img src="https://app.profcomff.com/favicon.png" class="logo" /></a>
		in association with
		<a href="https://dyakov.space"><img src="https://dyakov.space/files/Icon.svg" class="logo" /></a>
	</footer>
</template>

<style scoped>
.container {
	width: 100%;
	height: 100%;
}

footer {
	position: sticky;
	bottom: 0;
	width: 100%;
	color: gray;
	text-align: center;

	& .logo {
		height: 30px;
		vertical-align: middle;
	}
}
</style>
