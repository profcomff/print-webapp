<script setup lang="ts">
import { ref } from "vue";
import AppIcon from "./AppIcon.vue";
const props = defineProps<{ pin: string }>();
const message = ref("");
async function copy() {
  try {
    await navigator.clipboard.writeText(props.pin);
    message.value = "Код скопирован";
  } catch {
    message.value = "Выделите код и скопируйте вручную";
  }
}
</script>
<template>
  <div class="pin-block">
    <code>{{ pin }}</code
    ><button
      class="icon-button"
      type="button"
      :aria-label="`Скопировать PIN ${pin}`"
      @click="copy"
    >
      <AppIcon name="copy" />
    </button>
  </div>
  <small v-if="message" class="copy-message" role="status">{{ message }}</small>
</template>
