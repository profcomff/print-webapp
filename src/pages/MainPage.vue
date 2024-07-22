<script setup lang="ts">
import { userdataUserApi } from '../api';
import { useProfileStore } from '../store';
import { onMounted, ref } from 'vue';

const profileStore = useProfileStore();

const showUserWarn = ref(false);

onMounted(async () => {
	// Get username
	if (!profileStore.full_name && profileStore.id) {
		const resp = await userdataUserApi.getById(profileStore.id);
		if (resp.status != 200) {
			showUserWarn.value = true;
			return;
		}
		const data = resp.data;
		if (!data || !data.items) {
			showUserWarn.value = true;
			return;
		}
		const nameItem = data.items.find(item => {
			return item.category == 'Личная информация' && item.param == 'Полное имя';
		});
		if (!nameItem) {
			showUserWarn.value = true;
			return;
		}
		profileStore.full_name = nameItem?.value ?? null;
	}
});

const location = document.location.origin + '/docs/';
</script>

<template>
	<div>
		<h1 class="text-h1">
			Привет<span v-if="profileStore.full_name">, {{ profileStore.full_name }}</span
			>!
		</h1>
		<p v-if="!profileStore.full_name">
			Не удалось получить твое имя из
			<a href="https://api.profcomff.com/?urls.primaryName=userdata">Userdata API</a>
			=(
		</p>
		<p>Твой id: {{ profileStore.id }}</p>
		<div>
			<p>
				Документация к этому коду находится по адресу <a href="/docs/">{{ location }}</a>
			</p>
		</div>
	</div>
</template>
