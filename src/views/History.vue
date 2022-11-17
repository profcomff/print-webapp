<template>
  <div>
    <div>
      <h1 class="accordion-header" id="histAccordion-headingOne">
        Последние файлы
      </h1>
      <small><router-link to="/">← Вернуться к печати</router-link></small>
      <ul class="hist" v-if="hist.length > 0">
        <li v-for="item in hist" v-bind:key="item.pin" class="hist-item">
          <code>{{ item.pin }}</code> <small>{{ item.name }}</small>
        </li>
      </ul>
      <p v-else>Вы еще ничего не печатали</p>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import { get_history } from "@/utils/history";
import { log_open_history } from "@/utils/marketing";

export default defineComponent({
  name: "Home",
  data() {
    return {
      hist: [],
    };
  },
  mounted() {
    this.hist = get_history();
    this.hist.reverse();
    log_open_history();
  },
});
</script>

<style>
.hist {
  list-style: none;
}
.hist-item {
  display: block;
  margin: 20px;
  font-size: 1.5rem;
}
.hist-item > small {
  font-size: 1rem;
}
</style>
