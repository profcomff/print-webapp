<script setup lang="ts">
withDefaults(
  defineProps<{
    name?:
      | "print"
      | "file"
      | "qr"
      | "history"
      | "check"
      | "arrow"
      | "copy"
      | "upload";
  }>(),
  { name: "print" },
);
const paths = {
  print:
    "M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6zM17 12h1",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  qr: "M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h2v2h-2zM21 15v3h-3v3M15 21h1M21 21h.01",
  history: "M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2",
  check: "M5 12l4 4L19 6",
  arrow: "M19 12H5M12 5l-7 7 7 7",
  copy: "M9 9h12v12H9zM15 5V3H3v12h2",
  upload: "M12 16V3M7 8l5-5 5 5M4 16v5h16v-5",
};
</script>
<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name]" />
  </svg>
</template>
