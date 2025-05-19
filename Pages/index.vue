<script setup>
import { onMounted } from "vue";
definePageMeta({
  layout: "form",
});
onMounted(() => {
  window.location.href = "/auth/login";
});
</script>

<template></template>
