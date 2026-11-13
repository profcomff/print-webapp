<script setup lang="ts">
import { ref, onMounted } from "vue";
import SendTaskDialog from "@/components/SendTaskDialog.vue";
import TaskCompleteDialog from "@/components/TaskCompleteDialog.vue";
import { add_history } from "@/utils/history";
import { log_open_app, log_print } from "@/utils/marketing";
const pin = ref("");
const saved = ref(true);
function uploaded(code: string, filename: string) {
  pin.value = code;
  saved.value = add_history(code, filename);
  log_print("OK", code);
}
onMounted(log_open_app);
</script>
<template>
  <TaskCompleteDialog
    v-if="pin"
    :pin="pin"
    :saved="saved"
    @click_return="pin = ''"
  />
  <section v-else>
    <div class="page-heading">
      <span class="eyebrow">Всё начинается с файла</span>
      <h1>Что распечатаем?</h1>
      <p>Загрузите PDF, а затем заберите распечатку у принтера.</p>
    </div>
    <SendTaskDialog @uploaded="uploaded" />
    <aside class="how-it-works">
      <h2>Как это работает</h2>
      <ol>
        <li><span>1</span>Загрузите документ</li>
        <li><span>2</span>Подойдите к принтеру</li>
        <li><span>3</span>Введите PIN или сканируйте QR на телефоне</li>
      </ol>
    </aside>
  </section>
</template>
