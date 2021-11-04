<template>
  <form class="print-form" @submit.prevent @submit="send">
    <p class="form-item-name" v-bind:value="surname">Фамилия:</p>
    <input
      class="form-item"
      type="text"
      name="surname"
      placeholder="Иванов"
      @input="surname_on_change"
      required
    />

    <p class="form-item-name">Номер профсоюзного билета:</p>
    <input
      class="form-item"
      type="text"
      name="number"
      placeholder="12341234"
      @input="number_on_change"
      required
    />

    <p class="form-item-name">Файл для печати в формате PDF:</p>
    <input
      class="form-item"
      type="file"
      accept="application/pdf"
      @input="file_on_change"
      required
    />

    <p class="form-item-tip">
      <i>
        Мы принимаем файлы для печати только в формате PDF и размером до 3
        мегабайт.
      </i>
    </p>

    <input class="form-item" type="submit" value="Отправить" />
  </form>
</template>

<script>
import axios from "axios";

const API_ROOT = "http://app.profcomff.com/print";

export default {
  data() {
    return {
      surname: undefined,
      number: undefined,
      file: undefined,
      api_pin: undefined,
    };
  },
  methods: {
    surname_on_change(event) {
      this.surname = event.target.value;
    },
    number_on_change(event) {
      this.number = event.target.value;
    },
    file_on_change(event) {
      this.file = event.target.files[0];
    },

    async send() {
      console.log("Start send routine");
      try {
        await this.request();
        await this.upload();
        console.log("Ok");
      } catch (error) {
        console.error(`Произошла ошибка: ${error}`);
      } finally {
        console.log("Finished!");
      }
    },

    async request() {
      console.log("Request to API");

      var response = await axios.post(`${API_ROOT}/file`, {
        body: {
          surname: this.surname,
          number: this.number,
          filename: this.file.name,
        },
        headers: { "Content-Type": "application/json" },
      });

      this.api_pin = JSON.parse(response.data).pin;
      console.log(`Request done ${this.api_pin}`);
    },

    async upload() {
      console.log(`Upload file ${this.api_pin} to API`);

      var body_data = new FormData();
      body_data.append("file", this.file);

      await axios.post(`${API_ROOT}/file/${this.api_pin}`, {
        body: body_data,
      });
    },
  },
};
</script>

<style scoped>
h1 {
  color: white;
  text-transform: uppercase;
  font-family: "PT Sans", sans-serif;
  font-size: 4vw;
  font-style: normal;
  font-weight: 700;
  max-width: 100%;
}
.form-item {
  height: 50px;
  width: 100%;
}

.print-form {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}
</style>
