<template>
  <div>
    <h1 class="accordion-header" id="histAccordion-headingOne">
      Печать по QR коду
    </h1>
    <small><a href="#" @click.prevent="this.$router.go(-1)">← Вернуться</a></small>
    <p>
      Для быстрой печати по QR подойдите к принтеру и отсканируйте код под
      кнопкой "Печать".
    </p>
    <div v-if="qrInitSuccess === undefined">
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
      v-if="qrInitSuccess !== false"
    >
    </qrcode-stream>
  </div>
</template>

<script>
import { QrcodeStream } from "vue3-qrcode-reader";

export default {
  data: () => ({
    qrInitSuccess: undefined,
  }),
  components: {
    QrcodeStream,
  },
  methods: {
    onDecode(decodedString) {
      console.log(decodedString);
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
};
</script>

<style></style>
