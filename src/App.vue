<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  type CSSProperties,
} from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
const route = useRoute();
const content = ref<HTMLElement | null>(null);
const visibleViewport = ref<CSSProperties>({});
let viewportObserver: IntersectionObserver | undefined;
let viewportRefresh: number | undefined;
function stopViewportRefresh() {
  window.clearInterval(viewportRefresh);
  viewportRefresh = undefined;
}
onMounted(() => {
  if (window.self === window.top) return;
  // The host may clip a cross-origin iframe. Its innerHeight still includes
  // the clipped area; intersectionRect describes the part actually on screen.
  viewportObserver = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting || entry.intersectionRect.height < 1) {
        stopViewportRefresh();
        return;
      }
      const visible = entry.intersectionRect;
      const full = entry.boundingClientRect;
      const clipped = visible.height < full.height - 1;
      visibleViewport.value = !clipped
        ? {}
        : {
            height: `${Math.floor(visible.height)}px`,
            marginTop: `${Math.max(0, Math.ceil(visible.top - full.top))}px`,
          };
      if (!clipped) stopViewportRefresh();
      else if (viewportRefresh === undefined) {
        // ponytail: recheck clipped cross-origin viewports at 5 Hz; replace
        // with host viewport messages if the embedding app supplies them.
        viewportRefresh = window.setInterval(() => {
          viewportObserver?.unobserve(document.documentElement);
          viewportObserver?.observe(document.documentElement);
        }, 200);
      }
    },
    { threshold: [0, 1] },
  );
  // Observe the full document, whose size is independent of the adjusted shell.
  viewportObserver.observe(document.documentElement);
});
onBeforeUnmount(() => {
  viewportObserver?.disconnect();
  stopViewportRefresh();
});
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
  <main class="app-shell" :style="visibleViewport">
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
