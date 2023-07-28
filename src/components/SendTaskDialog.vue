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
        @input="(event) => (file = event.target.files[0])"
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

    <div class="accordion accordion-flush" id="accordionFlush">
      <div class="accordion-item">
        <h2 class="accordion-header" id="flush-headingOne">
          <button
            class="accordion-button collapsed"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#flush-collapseOne"
            aria-expanded="false"
            aria-controls="flush-collapseOne"
          >
            Больше настроек
          </button>
        </h2>
        <div
          id="flush-collapseOne"
          class="accordion-collapse collapse"
          aria-labelledby="flush-headingOne"
          data-bs-parent="#accordionFlush"
        >
          <div class="form-group">
            <label for="copies">Количество копий:</label>
            <input
              class="form-control"
              type="number"
              name="copies"
              min="1"
              max="10"
              v-model.lazy="copies"
              required
            />
          </div>

          <div class="form-group">
            <label for="pages">Номера страниц:</label>
            <input
              class="form-control"
              type="text"
              name="pages"
              placeholder="Все"
              v-model="pages"
            />
            <small id="pagesHelp" class="form-text text-muted">
              <i>Формат: 1-2, 4</i>
            </small>
          </div>

          <div class="form-group">
            <input
              class="form-check-input"
              type="checkbox"
              name="twosided"
              v-model="twosided"
            />
            <label for="twosided">&nbsp;Двусторонняя печать</label>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn-success btn-lg">Отправить</button>
      <router-link class="btn btn-primary btn-lg" to="/history">
        История печати
      </router-link>
    </div>
  </form>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      surname: undefined,
      number: undefined,
      file: undefined,
      source: "webapp",

      copies: 1,
      pages: "",
      twosided: false,

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
      localStorage.setItem("surname", new_surname);
    },
    number(new_number) {
      localStorage.setItem("number", new_number);
    },
    copies(new_copies) {
      this.copies = parseInt(new_copies);
    },
  },
  methods: {
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
        this.$emit("uploaded", this.status, this.api_pin, this.file.name);
        console.log("Finished!");
      }
    },

    async request() {
      console.log("Request to API");

      var response = await axios.post(
        `${process.env.VUE_APP_API_PRINTER}/file`,
        {
          surname: this.surname.trim(),
          number: this.number.trim(),
          filename: this.file.name,
          source: this.source,
          options: {
            pages: this.pages,
            copies: this.copies,
            two_sided: this.twosided,
          },
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

      await axios.post(
        `${process.env.VUE_APP_API_PRINTER}/file/${this.api_pin}`,
        body_data
      );
    },
  },
};
</script>
