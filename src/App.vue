<template>
  <div class="container-fluid">
    <router-view />

    <div v-if="!this.$route.query.embeded">
      <small class="text-muted">
        Сделано в
        <a href="https://dyakov.space/" target="_blank">dyakov.space</a>
      </small>
    </div>
  </div>
</template>

<style scoped>
.container-fluid {
  max-width: 500px;
  margin: 30px auto;
}
</style>
