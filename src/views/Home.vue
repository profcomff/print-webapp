<template>
  <div class="home">
    <SendTaskDialog />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import SendTaskDialog from "@/components/SendTaskDialog.vue";

export default defineComponent({
  name: "Home",
  components: {
    SendTaskDialog,
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
