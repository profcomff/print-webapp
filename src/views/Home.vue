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
    <div></div>
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
      status: "PENDING",
      pin: "",
    };
  },
  methods: {
    showTaskCompleteDialog(status, pin) {
      console.log(`${status}, ${pin}`);
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
</style>
