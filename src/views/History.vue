<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { get_history } from "@/utils/history";
import { log_open_history } from "@/utils/marketing";
import { isMobile } from "@/utils/mobile";
import AppIcon from "@/components/AppIcon.vue";
import PinCode from "@/components/PinCode.vue";
const route = useRoute();
const history = get_history().reverse();
const selected = ref<string[]>([]);
const mobile = isMobile();
const qrTarget = computed(() => ({
  path: "/qr",
  query: route.query,
  hash: `#${selected.value.join(",")}`,
}));
onMounted(log_open_history);
function date(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return "";
  return new Date(value).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });
}
</script>
<template>
  <section>
    <div class="page-heading">
      <span class="eyebrow">Всегда под рукой</span>
      <h1>Ваши документы</h1>
      <p>Последние 10 файлов, загруженных в этом браузере.</p>
    </div>
    <div v-if="!history.length" class="card empty-state">
      <span class="file-symbol"><AppIcon name="history" /></span>
      <h2>Здесь будут ваши файлы</h2>
      <p>
        После загрузки сохраним название и PIN,<br />чтобы их было легко найти.
      </p>
      <router-link
        class="button primary"
        :to="{ path: '/', query: route.query }"
        >Загрузить первый файл</router-link
      >
    </div>
    <template v-else>
      <p v-if="mobile" class="selection-hint">
        Выберите файлы, чтобы распечатать их одним сканированием QR у принтера.
      </p>
      <ul class="history-list">
        <li v-for="item in history" :key="item.pin" class="card history-item">
          <div class="history-title">
            <input
              v-if="mobile"
              :id="`select-${item.pin}`"
              v-model="selected"
              type="checkbox"
              :value="item.pin"
              :aria-label="`Выбрать ${item.name}`"
            /><AppIcon v-else name="file" />
            <div>
              <label
                :for="mobile ? `select-${item.pin}` : undefined"
                class="filename"
                >{{ item.name }}</label
              ><small>{{ date(item.createdAt) || "Загружен ранее" }}</small>
            </div>
          </div>
          <div class="history-actions">
            <PinCode :pin="item.pin" /><router-link
              v-if="mobile"
              class="button secondary compact"
              :to="{ path: '/qr', hash: `#${item.pin}`, query: route.query }"
              ><AppIcon name="qr" />Печать</router-link
            >
          </div>
        </li>
      </ul>
      <div v-if="mobile && selected.length" class="selection-bar">
        <span>Выбрано: {{ selected.length }}</span
        ><router-link class="button primary" :to="qrTarget"
          ><AppIcon name="qr" />Распечатать по QR</router-link
        >
      </div>
      <p class="form-note">
        Срок хранения файлов ограничен. Если PIN больше не работает, загрузите
        документ заново.
      </p>
    </template>
  </section>
</template>
