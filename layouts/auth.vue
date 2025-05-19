<template>
  <div class="h-full w-full">
    <main class="hero font-customFont flex h-screen w-full bg-cover">
      <slot />
    </main>
  </div>
</template>

<script setup>
try {
  const $message = useMessage();
  if (typeof window !== "undefined") {
    window["$message"] = $message;
  }
} catch (error) {}
</script>

<style scoped>
.hero {
  background: url("../public/images/bg.png") center center/cover no-repeat;
}
</style>
