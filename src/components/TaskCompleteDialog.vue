<template>
  <div class="dialog-container">
    <div v-if="status === 'OK'">
      <p class="h5">Успех! Код для печати:</p>
      <p class="h1">{{ pin }}</p>
    </div>
    <div v-else-if="status == 403">
      <p class="h5">Не вышло =(</p>
      <p class="h3">
        Проверьте правильность ввода фамилии и номера профсоюзного билета
      </p>
    </div>
    <div v-else-if="status == 415">
      <p class="h5">Не вышло =(</p>
      <p class="h3">Отправлять можно только файлы PDF</p>
    </div>
    <div v-else-if="status == 422">
      <p class="h5">Не вышло =(</p>
      <p class="h3">Запонены не все поля</p>
      <sup>Как? O_o</sup>
    </div>
    <div v-else>
      <p class="h5">Не вышло =(</p>
      <p class="h3">Мы не знаем почему, но попробуйте обновить страницу</p>
      <sup>
        Если не помогло - <a href="https://vk.me/profcomff">напишите нам</a>
      </sup>
    </div>
    <div class="form-actions">
      <button class="btn btn-primary" type="button" @click="returnButtonClick">
        Вернуться
      </button>
    </div>
  </div>
</template>

<script>
export default {
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
  methods: {
    returnButtonClick() {
      this.$emit("click_return");
    },
  },
};
</script>
