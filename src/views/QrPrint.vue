<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  defineAsyncComponent,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { isMobile } from "@/utils/mobile";
import { parsePins } from "@/utils/printing";
import { printQr, errorMessage } from "@/api/printer";
import { log_open_qr, log_print_qr, log_error_qr } from "@/utils/marketing";
const QrcodeStream = defineAsyncComponent(async () => {
  const [scanner, wasm] = await Promise.all([
    import(/* webpackChunkName: "camera" */ "vue-qrcode-reader"),
    import("zxing-wasm/reader/zxing_reader.wasm"),
  ]);
  scanner.setZXingModuleOverrides({
    locateFile: (path: string, prefix: string) =>
      path.endsWith(".wasm") ? wasm.default : prefix + path,
  });
  return scanner.QrcodeStream;
});
const route = useRoute();
const mobile = isMobile();
const pins = computed(() => parsePins(route.hash));
const state = ref<"idle" | "camera" | "pending" | "success" | "error">("idle");
const cameraReady = ref(false);
const cameraError = ref("");
const printError = ref("");
const active = ref(true);
let visibilityPaused = false;
const paused = ref(false);
function visibility() {
  paused.value = document.hidden;
  visibilityPaused = document.hidden;
}
function start() {
  cameraError.value = "";
  printError.value = "";
  cameraReady.value = false;
  state.value = "camera";
}
function onCameraError(error: Error) {
  const messages: Record<string, string> = {
    NotAllowedError:
      "Нет доступа к камере. Разрешите камеру в настройках сайта. Если доступ заблокирован внутри «Твой ФФ», используйте PIN на панели принтера.",
    NotFoundError: "Камера не найдена. Используйте PIN на панели принтера.",
    NotReadableError:
      "Камера занята другим приложением. Закройте его и попробуйте снова.",
    OverconstrainedError:
      "Не удалось включить камеру. Попробуйте другой браузер или используйте PIN.",
    InsecureContextError:
      "Камера доступна только через HTTPS. Откройте приложение по защищённой ссылке.",
    StreamLoadTimeoutError:
      "Камера не ответила. Закройте другие приложения с камерой и попробуйте снова или используйте PIN.",
    NotSupportedError:
      "Камера доступна только через HTTPS. Откройте приложение по защищённой ссылке.",
    StreamApiNotSupportedError:
      "Этот браузер не поддерживает камеру. Откройте приложение в Safari или Chrome.",
  };
  cameraError.value =
    messages[error.name] ||
    "Не удалось запустить сканер. Попробуйте снова или введите PIN на панели принтера.";
  state.value = "idle";
}
async function detect(codes: { rawValue: string }[]) {
  const token = codes[0]?.rawValue;
  if (
    !token ||
    state.value !== "camera" ||
    !pins.value.length ||
    visibilityPaused
  )
    return;
  const files = [...pins.value];
  state.value = "pending"; // Set synchronously before the request; repeated frames cannot print twice.
  try {
    await printQr(token, files);
    if (!active.value) return;
    state.value = "success";
    log_print_qr(files);
  } catch (cause) {
    if (!active.value) return;
    printError.value =
      cause instanceof Error && !("isAxiosError" in cause)
        ? cause.message
        : errorMessage(cause);
    state.value = "error";
    log_error_qr(files, cause);
  }
}
watch(
  () => route.hash,
  () => {
    if (state.value !== "pending") state.value = "idle";
  },
);
onMounted(() => {
  log_open_qr();
  document.addEventListener("visibilitychange", visibility);
  visibility();
});
onBeforeUnmount(() => {
  active.value = false;
  document.removeEventListener("visibilitychange", visibility);
});
</script>
<template>
  <section>
    <router-link
      class="back-link"
      :to="{ path: '/history', query: route.query }"
      ><AppIcon name="arrow" />К документам</router-link
    >
    <div class="page-heading">
      <span class="eyebrow">Вы уже у принтера?</span>
      <h1>Быстрая печать по QR</h1>
      <p>Наведите камеру на QR-код под кнопкой «Печать» на экране принтера.</p>
    </div>
    <div class="card qr-card">
      <template v-if="!mobile"
        >
<span class="file-symbol"><AppIcon name="qr" /></span>
        <h2>Сканируйте с телефона</h2>
        <p>
          Быстрая печать по QR доступна на телефоне и планшете. На компьютере
          сохраните PIN и введите его на панели принтера.
        </p>
</template
      >
      <template v-else-if="!pins.length"
        >
<h2>Сначала выберите файл</h2>
        <p>Откройте историю или загрузите новый документ для печати.</p>
        <router-link
          class="button primary full"
          :to="{ path: '/history', query: route.query }"
          >Выбрать документы</router-link
        >
</template
      >
      <template v-else-if="state === 'success'"
        >
<span class="result-symbol"><AppIcon name="check" /></span>
        <h2>Отправлено на принтер</h2>
        <p>Заберите распечатку и проверьте, что все страницы на месте.</p>
        <router-link
          class="button primary full"
          :to="{ path: '/history', query: route.query }"
          >К документам</router-link
        >
</template
      >
      <template v-else>
        <div class="qr-summary">
          <AppIcon name="file" /><span
            >Файлов для печати: <strong>{{ pins.length }}</strong></span
          >
        </div>
        <div v-if="state === 'camera'" class="camera-frame">
          <QrcodeStream
            :constraints="{ facingMode: { ideal: 'environment' } }"
            :paused="paused"
            @detect="detect"
            @camera-on="cameraReady = true"
            @error="onCameraError"
          />
          <div class="scan-guide" aria-hidden="true"></div>
          <p v-if="!cameraReady" class="camera-loading" role="status">
            Подключаем камеру…
          </p>
        </div>
        <template v-else-if="state === 'pending'"
          >
<div class="spinner" aria-hidden="true"></div>
          <h2 role="status">Отправляем на принтер…</h2>
          <p>Дождитесь ответа. Не запускайте печать повторно.</p>
</template
        >
        <template v-else-if="state === 'error'"
          >
<div class="notice error" role="alert">{{ printError }}</div>
          <p>
            Если ответа не было, задание могло дойти до принтера. Проверьте его
            экран перед повторной отправкой.
          </p>
          <button class="button secondary full" type="button" @click="start">
            Проверил, сканировать снова
          </button>
</template
        >
        <template v-else
          >
<span class="file-symbol"><AppIcon name="qr" /></span>
          <h2>Наведите, сканируйте, готово</h2>
          <p>После сканирования выбранные файлы сразу отправятся на печать.</p>
          <div v-if="cameraError" class="notice error" role="alert">
            {{ cameraError }}
          </div>
          <button class="button primary full" type="button" @click="start">
            <AppIcon name="qr" />{{
              cameraError ? "Попробовать снова" : "Включить камеру"
            }}
          </button>
          <p class="form-note">
            Разрешите доступ к камере. Изображение обрабатывается на вашем
            устройстве.
          </p>
</template
        >
        <p v-if="state === 'camera'" class="form-note">
          {{
            cameraReady
              ? "Поместите QR-код в рамку. Печать начнётся автоматически."
              : "Разрешите доступ к камере в браузере."
          }}
        </p>
        <details class="pin-fallback">
          <summary>Распечатать по PIN без камеры</summary>
          <p>Введите код на панели принтера:</p>
          <code v-for="pin in pins" :key="pin">{{ pin }}</code>
        </details>
      </template>
    </div>
  </section>
</template>
