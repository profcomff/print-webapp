<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
const route = useRoute();
const content = ref<HTMLElement | null>(null);
watch(
  () => route.path,
  () => {
    content.value?.scrollTo({ top: 0 });
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
  { immediate: true, flush: "post" },
);
</script>
<template>
  <main class="app-shell">
    <div ref="content" class="app-content">
      <router-view />
      <footer>
        Бесплатная печать для членов профсоюза
        <span>PDF · чёрно-белая печать</span>
        <div>
          Сделано в
          <a
            href="https://dyakov.space/"
            target="_blank"
            rel="noopener noreferrer"
            >dyakov.space</a
          >
        </div>
      </footer>
    </div>
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
