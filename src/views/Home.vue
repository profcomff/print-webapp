<template>
  <div>
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
  </div>
</template>

<script>
import { defineComponent } from "vue";
import SendTaskDialog from "@/components/SendTaskDialog.vue";
import TaskCompleteDialog from "@/components/TaskCompleteDialog.vue";
import { add_history } from "@/utils/history";
import { log_open_app, log_print } from "@/utils/marketing";

export default defineComponent({
  name: "Home",
  components: {
    SendTaskDialog,
    TaskCompleteDialog,
  },
  data() {
    return {
      status: "PENDING",
      pin: "",
    };
  },
  methods: {
    showTaskCompleteDialog(status, pin, filename) {
      console.log(`${status}, ${pin}`);
      if (status === "OK") add_history(pin, filename);
      var dialog = document.getElementById("send_task_dialog");
      this.status = status;
      this.pin = pin;
      log_print(status, pin);
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
  },
  mounted() {
    log_open_app();
    document.dispatchEvent(
      new CustomEvent("change-header-layout", {
        detail: {
          layoutName: "back",
          text: "Бесплатный принтер",
        },
      })
    );
  },
});
</script>

<style>
p,
.form-group,
.form-actions {
  font-family: "PT Sans", sans-serif;
  margin: 20px auto;
}

.form-actions .btn {
  width: 100%;
  margin: 10px auto;
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
