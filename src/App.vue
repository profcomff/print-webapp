<script setup lang="ts">
import { watch } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
const route = useRoute();
watch(
  () => route.path,
  () => {
    document.dispatchEvent(
      new CustomEvent("change-header-layout", {
        detail: {
          layoutName: "back",
          text:
            route.path === "/history" ? "История печати" : "Бесплатный принтер",
        },
      }),
    );
  },
  { immediate: true },
);
</script>
<template>
  <main class="app-shell">
    <router-view />
    <footer>
      Бесплатная печать для членов профсоюза<span
        >PDF · чёрно-белая печать</span
      >
    </footer>
    <nav class="bottom-nav" aria-label="Разделы печати">
      <router-link
        :to="{ path: '/', query: route.query }"
        :class="{ active: route.path !== '/history' }"
        ><AppIcon />Печать</router-link
      >
      <router-link
        :to="{ path: '/history', query: route.query }"
        :class="{ active: route.path === '/history' }"
        ><AppIcon name="history" />История</router-link
      >
    </nav>
  </main>
</template>
