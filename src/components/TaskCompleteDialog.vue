<template>
  <div class="dialog-container">
    <div v-if="status === 'OK'">
      <p class="small">Успех! Код для печати:</p>
      <p class="large">{{ pin }}</p>
    </div>
    <div v-else-if="status == 403">
      <p class="small">Не вышло =(</p>
      <p class="medium">
        Проверьте правильность ввода фамилии и номера профсоюзного билета
      </p>
    </div>
    <div v-else-if="status == 415">
      <p class="small">Не вышло =(</p>
      <p class="medium">Отправлять можно только файлы PDF</p>
    </div>
    <div v-else-if="status == 422">
      <p class="small">Не вышло =(</p>
      <p class="medium">Запонены не все поля</p>
      <sup>Как? O_o</sup>
    </div>
    <div v-else>
      <p class="small">Не вышло =(</p>
      <p class="medium">Мы не знаем почему, но попробуйте обновить страницу</p>
      <sup>
        Если не помогло - <a href="https://vk.me/profcomff">напишите нам</a>
      </sup>
    </div>
    <input
      class="form-item"
      type="button"
      value="Вернуться"
      @click="returnButtonClick"
    />
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
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.dialog-container {
  padding: 10%;
  width: 80%;
  max-width: 600px;
  margin: 0 auto;
}

.form-item {
  height: 50px;
  width: 100%;
}

p {
  font-family: "PT Sans", sans-serif;
}

p.small {
  font-size: 1.5vw;
}

p.medium {
  font-size: 2vw;
}

p.large {
  font-size: 4vw;
  font-weight: 700;
}
</style>
