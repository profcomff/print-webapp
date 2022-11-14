<template>
  <div class="home container-fluid">
    <div v-if="!this.$route.query.embeded">
      <h1>Бесплатный принтер</h1>
    </div>
    <SendTaskDialog id="send_task_dialog" @uploaded="showTaskCompleteDialog" />
    <TaskCompleteDialog
      v-if="['PENDING', 'PROGRESS'].indexOf(status) == -1"
      :status="status"
      :pin="pin"
      @click_return="showSendTaskDialog"
    />
    <div>
      <h3 class="accordion-header" id="histAccordion-headingOne">
        Последние файлы:
      </h3>
      <ul class="hist">
        <li v-for="item in hist" v-bind:key="item.pin" class="hist-item">
          {{ item.pin }} <small>{{ item.name }}</small>
        </li>
      </ul>
    </div>
    <div v-if="!this.$route.query.embeded">
      <small class="text-muted"
        >Сделано в <a href="https://dyakov.space/">dyakov.space</a></small
      >
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import SendTaskDialog from "@/components/SendTaskDialog.vue";
import TaskCompleteDialog from "@/components/TaskCompleteDialog.vue";

export default defineComponent({
  name: "Home",
  components: {
    SendTaskDialog,
    TaskCompleteDialog,
  },
  data() {
    return {
      hist: [],
      status: "PENDING",
      pin: "",
    };
  },
  methods: {
    showTaskCompleteDialog(status, pin, filename) {
      console.log(`${status}, ${pin}`);
      if (status === "OK") this.save_hist(pin, filename);
      var dialog = document.getElementById("send_task_dialog");
      this.status = status;
      this.pin = pin;
      if (dialog !== null) {
        dialog.style.display = "none";
      }
    },

    showSendTaskDialog() {
      this.status = "PENDING";
      this.pin = "";
      var dialog = document.getElementById("send_task_dialog");
      if (dialog !== null) {
        dialog.style.display = "block";
      }
    },

    get_hist() {
      var hist = localStorage.getItem("print-history") || "[]";
      this.hist = JSON.parse(hist);
    },

    save_hist(pin, name) {
      this.hist = this.hist.slice(-5, -1);
      this.hist.push({ pin: pin, name: name });
      localStorage.setItem("print-history", JSON.stringify(this.hist));
    },
  },

  mounted() {
    this.get_hist();
  },
});
</script>

<style>
.home {
  max-width: 500px;
  margin: 30px auto;
}

p,
.form-group,
.form-actions {
  font-family: "PT Sans", sans-serif;
  margin: 20px auto;
}

.form-actions {
  background-color: transparent;
  text-align: center;
}

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
