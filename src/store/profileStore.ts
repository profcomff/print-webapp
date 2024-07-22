import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProfileStore = defineStore('profile', () => {
	const id = ref<number | null>(null);
	const email = ref<string | null>(null);
	const token = ref<string | null>(null);
	const groups = ref<number[] | null>(null);
	const indirectGroups = ref<number[] | null>(null);
	const userScopes = ref<string[] | null>(null);
	const sessionScopes = ref<string[] | null>(null);

	const full_name = ref<string | null>(null);

	const fromUrl = () => {
		const url = new URL(document.location.toString());
		const currToken = url.searchParams.get('token');
		const currId = url.searchParams.get('user_id');
		const currScopes = url.searchParams.get('scopes');
		if (currToken) {
			token.value = currToken;
		}
		if (currId) {
			id.value = +currId;
		}
		if (currScopes) {
			sessionScopes.value = currScopes.split(',');
		}
	};

	return {
		id,
		email,
		token,
		groups,
		indirectGroups,
		userScopes,
		sessionScopes,

		full_name,

		fromUrl,
	};
});
