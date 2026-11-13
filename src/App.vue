<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
const route = useRoute();
const embedded = computed(
  () =>
    window.self !== window.top ||
    "embeded" in route.query ||
    "embedded" in route.query,
);
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
  <main class="app-shell" :class="{ 'is-embedded': embedded }">
    <header v-if="!embedded" class="brand">
      <span class="brand-icon"><AppIcon /></span>
      <div>
        <strong>Бесплатный принтер</strong
        ><span>Профком физфака · Твой ФФ</span>
      </div>
    </header>
    <nav class="tabs" aria-label="Разделы печати">
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
    <router-view />
    <footer>
      Бесплатная печать для членов профсоюза<span
        >PDF · чёрно-белая печать</span
      >
    </footer>
  </main>
</template>
