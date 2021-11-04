<template>
  <div class="home">
    <SendTaskDialog id="send_task_dialog" @uploaded="showTaskCompleteDialog" />
    <TaskCompleteDialog
      v-if="['PENDING', 'PROGRESS'].indexOf(status) == -1"
      :status="status"
      :pin="pin"
      @click="showSendTaskDialog"
    />
  </div>
</template>

<script lang="ts">
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
    showTaskCompleteDialog(status: string, pin: string) {
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
  width: 100%;
  padding: 0;
  margin: 0;
}
</style>
