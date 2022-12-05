<template>
  <div class="dialog-container">
    <div v-if="status === 'OK'">
      <span class="success material-icons"> thumb_up </span>
      <span class="success"><b>Готово!</b></span>
      <span class="success">
        Код для печати:<br />
        <b>{{ pin }}</b>
      </span>
    </div>
    <div v-else-if="status == 403">
      <span class="error material-icons"> thumb_down </span>
      <span class="error"><b>Не вышло!</b></span>
      <span class="error small">
        Проверьте правильность ввода фамилии и номера профсоюзного билета
      </span>
    </div>
    <div v-else-if="status == 415">
      <span class="error material-icons"> thumb_down </span>
      <span class="error"><b>Не вышло!</b></span>
      <span class="error small"> Отправлять можно только файлы PDF </span>
    </div>
    <div v-else-if="status == 422">
      <span class="error material-icons"> thumb_down </span>
      <span class="error"><b>Не вышло!</b></span>
      <span class="error small">
        Проверьте параметры печати и попробуйте снова
      </span>
    </div>
    <div v-else>
      <span class="error material-icons"> thumb_down </span>
      <span class="error"><b>Не вышло!</b></span>
      <span class="error small">
        Мы не знаем почему, но попробуйте обновить страницу
      </span>
      <sup>
        Если не помогло -
        <a :href="feedback_url" target="_blank">напишите нам</a>
      </sup>
    </div>
    <div class="form-actions">
      <router-link
        class="btn btn-success btn-lg"
        type="button"
        :to="`/qr#${pin}`"
        v-if="isMobile"
      >
        Распечатать по QR
      </router-link>
      <button
        class="btn btn-primary btn-lg"
        type="button"
        @click="this.$emit('click_return')"
      >
        Вернуться
      </button>
    </div>
  </div>
</template>

<script>
import { isMobile } from "@/utils/mobile";

export default {
  computed: {
    isMobile() {
      return isMobile();
    },
    feedback_url() {
      return process.env.VUE_APP_FEEDBACK_FORM;
    },
  },
  props: {
    status: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      required: false,
    },
  },
};
</script>

<style scoped>
@import url(https://fonts.googleapis.com/icon?family=Material+Icons);
span.success {
  display: block;
  font-size: 32px;
  width: 100%;
  color: var(--bs-success);
  text-align: center;
  margin: 0 auto;
}
span.error {
  display: block;
  font-size: 32px;
  width: 100%;
  color: var(--bs-danger);
  text-align: center;
}
span.error.small {
  display: block;
  font-size: 20px;
  width: 100%;
  color: var(--bs-black);
  text-align: center;
}
span.pending {
  display: block;
  font-size: 32px;
  width: 100%;
  color: var(--bs-dark);
  text-align: center;
}
</style>
