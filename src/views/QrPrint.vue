<template>
  <div>
    <h1 class="accordion-header" id="histAccordion-headingOne">
      Печать по QR коду
    </h1>
    <small
      ><a href="#" @click.prevent="this.$router.go(-1)">← Вернуться</a></small
    >
    <p>
      Для быстрой печати по QR подойдите к принтеру и отсканируйте код под
      кнопкой "Печать".
    </p>
    <div v-if="!isMobile">
      <p class="alert alert-success" role="alert">
        Откройте эту страницу с смартфона или планшета
      </p>
    </div>
    <div v-else-if="qrInitSuccess === undefined">
      <p class="alert alert-success" role="alert">
        Попытка подключиться к камере
      </p>
      <p>
        Пожалуйста, предоставьте сайту доступ к камере вашего устройства. Вся
        обработка происходит на вашем устройстве, разработчики получают доступ
        только к отсканированному коду.
      </p>
    </div>
    <div v-else-if="qrInitSuccess === false">
      <p class="alert alert-secondary" role="alert">
        Для печати необходимо предоставить сайту доступ к камере!
      </p>
      <p>
        Пожалуйста, предоставьте сайту доступ к камере вашего устройства. Вся
        обработка происходит на вашем устройстве, разработчики получают доступ
        только к отсканированному коду.
      </p>
    </div>
    <qrcode-stream
      @decode="onDecode"
      @init="onInit"
      v-if="isMobile & (qrInitSuccess !== false) & !qrPrintStatus"
    >
    </qrcode-stream>
    <div class="form-actions">
      <div v-if="qrPrintStatus === 'pending'">
        <span class="pending material-icons"> pending </span>
        <span class="pending">Выполняю</span>
      </div>
      <div v-if="qrPrintStatus === 'success'">
        <span class="success material-icons"> thumb_up </span>
        <span class="success">Готово!</span>
        <router-link to="/" class="btn btn-lg btn-primary">
          Вернуться на главную
        </router-link>
        <router-link to="/history" class="btn btn-lg btn-primary">
          Перейти к истории
        </router-link>
      </div>
      <div v-if="qrPrintStatus === 'error'">
        <span class="error material-icons"> thumb_down </span>
        <span class="error">Не вышло!</span>
        <p>{{ qrPrintErrorMsg }}</p>
        <router-link to="/" class="btn btn-lg btn-primary">
          Вернуться на главную
        </router-link>
        <router-link to="/history" class="btn btn-lg btn-primary">
          Перейти к истории
        </router-link>
        <div class="btn btn-lg btn-success" @click="reset">
          Попробовать еще раз
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { QrcodeStream } from "vue3-qrcode-reader";
import { log_open_qr, log_print_qr, log_error_qr } from "@/utils/marketing";
import { isMobile } from "@/utils/mobile";

export default {
  data: () => ({
    pins: [],
    qrInitSuccess: undefined,
    qrPrintStatus: undefined,
    qrPrintErrorMsg: "",
  }),
  computed: {
    isMobile() {
      return isMobile();
    },
  },
  components: {
    QrcodeStream,
  },
  methods: {
    reset() {
      this.qrInitSuccess = undefined;
      this.qrPrintStatus = undefined;
      this.qrPrintErrorMsg = "";
    },
    onDecode(decodedString) {
      console.log(decodedString);
      this.qrPrintStatus = "pending";

      fetch(`${process.env.VUE_APP_API_PRINTER}/qr`, {
        method: "POST",
        cache: "no-cache",
        redirect: "follow",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qr_token: decodedString,
          files: this.pins,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          console.log(response);
          if (response.status === "ok") {
            this.qrPrintStatus = "success";
            log_print_qr(this.pins);
          } else if (response.detail === "Terminal not found by qr") {
            this.qrPrintStatus = "error";
            this.qrPrintErrorMsg = "QR код недействительный";
            log_error_qr(this.pins, response);
          } else if (response.detail === "Terminal not found by qr") {
            this.qrPrintStatus = "error";
            this.qrPrintErrorMsg = "QR код недействительный";
            log_error_qr(this.pins, response);
          } else {
            this.qrPrintStatus = "error";
            this.qrPrintErrorMsg = "Неизвестная ошибка";
            log_error_qr(this.pins, response);
          }
        })
        .catch((error) => {
          console.log(error);
          this.qrPrintStatus = "error";
          this.qrPrintErrorMsg = "Ошибка сети";
          log_error_qr(this.pins, error);
        });
    },
    async onInit(promise) {
      // show loading indicator

      try {
        await promise;
        this.qrInitSuccess = true;
      } catch (error) {
        this.qrInitSuccess = false;
        if (error.name === "NotAllowedError") {
          // user denied camera access permisson
        } else if (error.name === "NotFoundError") {
          // no suitable camera device installed
        } else if (error.name === "NotSupportedError") {
          // page is not served over HTTPS (or localhost)
        } else if (error.name === "NotReadableError") {
          // maybe camera is already in use
        } else if (error.name === "OverconstrainedError") {
          // did you requested the front camera although there is none?
        } else if (error.name === "StreamApiNotSupportedError") {
          // browser seems to be lacking features
        }
      } finally {
        // hide loading indicator
      }
    },
  },
  mounted() {
    const location = document.location.hash.replace(/^#?/, "");
    this.pins = location.split(",");
    log_open_qr();
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
span.pending {
  display: block;
  font-size: 32px;
  width: 100%;
  color: var(--bs-dark);
  text-align: center;
}
</style>
