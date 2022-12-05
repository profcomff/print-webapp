<template>
  <div>
    <h1 class="accordion-header" id="histAccordion-headingOne">
      Последние файлы
    </h1>
    <small><router-link to="/">← Вернуться к печати</router-link></small>
    <ul class="hist" v-if="hist.length > 0">
      <li v-for="item in hist" v-bind:key="item.pin" class="hist-item">
        <code>{{ item.pin }}</code>
        <small>{{ item.name }}</small>
        <router-link
          class="material-icons"
          type="button"
          :to="`/qr#${item.pin}`"
          v-if="isMobile"
        >
          qr_code_scanner
        </router-link>
      </li>
    </ul>
    <p v-else>Вы еще ничего не печатали</p>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { get_history } from "@/utils/history";
import { log_open_history } from "@/utils/marketing";
import { isMobile } from "@/utils/mobile";

export default defineComponent({
  name: "Home",
  data() {
    return {
      hist: [],
    };
  },
  computed: {
    isMobile() {
      return isMobile();
    },
  },
  mounted() {
    this.hist = get_history();
    this.hist.reverse();
    log_open_history();
    document.dispatchEvent(
      new CustomEvent("change-header-layout", {
        detail: {
          layoutName: "back",
          text: "История печати",
        },
      })
    );
  },
});
</script>

<style>
@import url(https://fonts.googleapis.com/icon?family=Material+Icons);

.hist {
  list-style: none;
  padding: 0;
  margin: 0;
}
.hist-item {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  margin: 20px;
  font-size: 1.5rem;
  gap: 8px;
}
.hist-item > * {
  display: block;
}
.hist-item > small {
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 0 1 100%;
  white-space: nowrap;
}

.material-icons {
  text-decoration: none;
  color: black;
}
</style>
