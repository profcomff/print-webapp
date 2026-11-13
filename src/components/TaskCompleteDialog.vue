<script setup lang="ts">
import { useRoute } from "vue-router";
import AppIcon from "./AppIcon.vue";
import PinCode from "./PinCode.vue";
import { isMobile } from "@/utils/mobile";
defineProps<{ pin: string; saved: boolean }>();
defineEmits<{ click_return: [] }>();
const route = useRoute();
const mobile = isMobile();
</script>
<template>
  <section class="card result-card">
    <span class="result-symbol"><AppIcon name="check" /></span>
    <span class="eyebrow">Файл загружен</span>
    <h1>Можно идти к принтеру</h1>
    <p>Введите этот PIN на панели принтера,<br />чтобы получить документ.</p>
    <PinCode :pin="pin" />
    <div v-if="!saved" class="notice" role="status">
      История недоступна в этом браузере. Сохраните PIN перед закрытием
      страницы.
    </div>
    <router-link
      v-if="mobile"
      class="button primary full"
      :to="{ path: '/qr', hash: `#${pin}`, query: route.query }"
      ><AppIcon name="qr" />Распечатать по QR</router-link
    >
    <p v-if="mobile" class="form-note">
      У принтера отсканируйте QR на его экране.
    </p>
    <button
      class="button secondary full"
      type="button"
      @click="$emit('click_return')"
    >
      Загрузить ещё один файл
    </button>
    <router-link
      class="text-link"
      :to="{ path: '/history', query: route.query }"
      >Открыть историю печати</router-link
    >
  </section>
</template>
