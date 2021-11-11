<template>
  <form class="dialog-container" @submit.prevent @submit="send">
    <div class="form-group">
      <label for="surname">Фамилия:</label>
      <input
        class="form-control"
        type="text"
        name="surname"
        placeholder="Иванов"
        v-model="surname"
        required
      />
    </div>

    <div class="form-group">
      <label for="number">Номер профсоюзного билета:</label>
      <input
        class="form-control"
        type="text"
        name="number"
        placeholder="1012000"
        v-model="number"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label" for="file"
        >Файл для печати в формате PDF:</label
      >
      <input
        class="form-control"
        id="file"
        type="file"
        accept="application/pdf"
        @input="file_on_change"
        aria-describedby="fileHelp"
        required
      />
      <small id="fileHelp" class="form-text text-muted">
        <i>
          Мы принимаем файлы для печати только в формате PDF и размером до 3
          мегабайт.
        </i>
      </small>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">Отправить</button>
    </div>
  </form>
</template>

<script>
import axios from "axios";

const API_ROOT = "https://app.profcomff.com/print";

export default {
  data() {
    return {
      surname: undefined,
      number: undefined,
      file: undefined,
      api_pin: undefined,
      status: "PENDING",
    };
  },
  mounted() {
    if (localStorage.surname) {
      this.surname = localStorage.surname;
    }
    if (localStorage.number) {
      this.number = localStorage.number;
    }
  },
  watch: {
    surname(new_surname) {
      localStorage.surname = new_surname;
    },
    number(new_number) {
      localStorage.number = new_number;
    },
  },
  methods: {
    file_on_change(event) {
      this.file = event.target.files[0];
    },

    async send() {
      console.log("Start send routine");
      this.status = "PROGRESS";

      try {
        await this.request();
        await this.upload();
        this.status = "OK";
      } catch (error) {
        console.error(`Произошла ошибка: ${error}`);
        var code = undefined;
        try {
          code = error.response.status;
        } finally {
          if (code === undefined) {
            this.status = "FAIL";
          } else {
            this.status = `${code}`;
          }
        }
      } finally {
        this.$emit("uploaded", this.status, this.api_pin);
        console.log("Finished!");
      }
    },

    async request() {
      console.log("Request to API");

      var response = await axios.post(
        `${API_ROOT}/file`,
        {
          surname: this.surname.trim(),
          number: this.number.trim(),
          filename: this.file.name,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      this.api_pin = response.data.pin;
      console.log(`Request done ${this.api_pin}`);
    },

    async upload() {
      console.log(`Upload file ${this.api_pin} to API`);

      var body_data = new FormData();
      body_data.append("file", this.file);

      await axios.post(`${API_ROOT}/file/${this.api_pin}`, body_data);
    },
  },
};
</script>
