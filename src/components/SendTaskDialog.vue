<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { profileSession, loadPrintProfile } from "@/api/profile";
import AppIcon from "./AppIcon.vue";
import { readStorage, writeStorage } from "@/utils/history";
import { validateFile, validatePages } from "@/utils/printing";
import { uploadFile, errorMessage } from "@/api/printer";
import { log_print } from "@/utils/marketing";
const emit = defineEmits<{ uploaded: [pin: string, filename: string] }>();
const session = profileSession(window.location.search);
const surname = ref(session ? "" : readStorage("surname"));
const number = ref(session ? "" : readStorage("number"));
const file = ref<File>();
const copies = ref(1);
const pages = ref("");
const busy = ref(false);
const progress = ref(0);
const error = ref("");
const dragging = ref(false);
const surnameEdited = ref(false);
const numberEdited = ref(false);
onBeforeRouteLeave(() => !busy.value);
function beforeUnload(event: BeforeUnloadEvent) {
  if (busy.value) {
    event.preventDefault();
    event.returnValue = "";
  }
}
onBeforeUnmount(() => window.removeEventListener("beforeunload", beforeUnload));
onMounted(async () => {
  window.addEventListener("beforeunload", beforeUnload);
  if (!session) return;
  try {
    const identity = await loadPrintProfile(session);
    if (!busy.value) {
      if (identity.surname && !surnameEdited.value)
        surname.value = identity.surname;
      if (identity.number && !numberEdited.value)
        number.value = identity.number;
    }
  } catch {
    /* Missing or unavailable profile data leaves manual entry available. */
  }
});
const fileSize = computed(() =>
  file.value
    ? `${(file.value.size / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} МБ`
    : "",
);
function selectFile(value?: File) {
  file.value = value;
  error.value = "";
}
function onFile(event: Event) {
  selectFile((event.target as HTMLInputElement).files?.[0]);
}
function drop(event: DragEvent) {
  dragging.value = false;
  if (!busy.value) selectFile(event.dataTransfer?.files[0]);
}
async function send() {
  if (busy.value) return;
  error.value = "";
  if (!file.value) {
    error.value = "Выберите PDF для печати.";
    return;
  }
  if (!surname.value.trim() || !number.value.trim()) {
    error.value = "Укажите фамилию и номер профсоюзного билета.";
    return;
  }
  if (
    !Number.isInteger(copies.value) ||
    copies.value < 1 ||
    copies.value > 10
  ) {
    error.value = "Можно заказать от 1 до 10 копий.";
    return;
  }
  error.value = validatePages(pages.value);
  if (error.value) return;
  busy.value = true;
  progress.value = 0;
  try {
    error.value = await validateFile(file.value);
    if (error.value) return;
    writeStorage("surname", surname.value.trim());
    writeStorage("number", number.value.trim());
    const pin = await uploadFile(
      {
        surname: surname.value,
        number: number.value,
        file: file.value,
        copies: copies.value,
        pages: pages.value,
      },
      (percent) => {
        progress.value = percent;
      },
    );
    emit("uploaded", pin, file.value.name);
  } catch (cause) {
    error.value = errorMessage(cause);
    log_print("FAIL");
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <form class="card upload-form" :aria-busy="busy" @submit.prevent="send">
    <fieldset :disabled="busy">
      <label
        class="drop-zone"
        :class="{ 'is-dragging': dragging, 'has-file': file }"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="drop"
      >
        <input
          id="file"
          class="file-input"
          type="file"
          accept="application/pdf,.pdf"
          aria-describedby="file-help"
          @change="onFile"
        />
        <span class="file-symbol"
          ><AppIcon :name="file ? 'file' : 'upload'"
        /></span>
        <strong>{{ file ? file.name : "Выберите PDF-файл" }}</strong>
        <span>{{
          file
            ? `${fileSize} · Нажмите, чтобы заменить`
            : "или перетащите его сюда"
        }}</span>
        <small id="file-help">До 25 МБ · до 50 страниц на печать</small>
      </label>
      <div class="section-label">
        <span>Данные для печати</span><small>Как в профсоюзном билете</small>
      </div>
      <div class="fields-grid">
        <div class="field">
          <label for="surname">Фамилия</label
          ><input
            id="surname"
            v-model="surname"
            name="surname"
            autocomplete="family-name"
            placeholder="Иванов"
            required
            maxlength="100"
            @input="surnameEdited = true"
          />
        </div>
        <div class="field">
          <label for="number">Номер профсоюзного билета</label
          ><input
            id="number"
            v-model="number"
            name="number"
            inputmode="numeric"
            placeholder="1012000"
            required
            maxlength="50"
            @input="numberEdited = true"
          />
        </div>
      </div>
      <details class="print-settings">
        <summary>
          Настройки печати
          <span>{{ copies }} коп. · {{ pages || "Все страницы" }}</span>
        </summary>
        <div class="fields-grid settings-fields">
          <div class="field">
            <label for="copies">Количество копий</label
            ><input
              id="copies"
              v-model.number="copies"
              type="number"
              min="1"
              max="10"
              required
            />
          </div>
          <div class="field">
            <label for="pages">Страницы</label
            ><input
              id="pages"
              v-model="pages"
              placeholder="Все"
              aria-describedby="pages-help"
            /><small id="pages-help">Например: 1-3, 5</small>
          </div>
        </div>
      </details>
    </fieldset>
    <div v-if="error" class="notice error" role="alert">{{ error }}</div>
    <div v-if="busy" class="upload-progress" role="status">
      <span>{{
        progress ? `Загружаем файл · ${progress}%` : "Подготавливаем файл…"
      }}</span><progress
        :value="progress"
        max="100"
        aria-label="Загрузка файла"
      /><small>Дождитесь PIN-кода, прежде чем закрывать страницу.</small>
    </div>
    <button class="button primary full" type="submit" :disabled="busy">
      <AppIcon name="print" />{{ busy ? "Загружаем…" : "Загрузить для печати" }}
    </button>
    <p class="form-note">Печать начнётся у принтера — по PIN-коду или QR.</p>
  </form>
</template>
