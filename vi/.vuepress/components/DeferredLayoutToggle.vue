<template>
  <LayoutToggle v-if="shouldShow" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from "vue";

const LayoutToggle = defineAsyncComponent(() => import("./LayoutToggle.vue"));
const shouldShow = ref(false);

onMounted(() => {
  const show = () => {
    shouldShow.value = true;
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(show, { timeout: 2000 });
    return;
  }

  window.setTimeout(show, 1200);
});
</script>
