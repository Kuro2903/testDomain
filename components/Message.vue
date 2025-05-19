<script setup>
const isVisible = ref(false);
const message = ref("");
const type = ref("");

const typeClasses = {
  success: "border-l-green-500",
  info: "border-l-blue-500",
  warning: "border-l-yellow-400",
  error: "border-l-[#ff623d]",
};

const borderColor = {
  success: "green-500",
  info: "blue-500",
  warning: "yellow-400",
  error: "[#ff623d]",
};

// Hàm hiển thị toast message với loại cụ thể và thời gian tự động đóng
const showToast = (msg, messageType) => {
  message.value = msg;
  type.value = messageType;
  isVisible.value = true;
  setTimeout(hideToast, 3000); // Đóng toast sau 3 giây
};

// Hàm ẩn toast message
const hideToast = () => {
  isVisible.value = false;
};

// Hiển thị một toast message mẫu sau khi component được mounted
onMounted(() => {
  showToast("This is a sample toast message.", "info");
});
</script>

<template>Test</template>

<style scoped>
.toast-message {
  position: fixed;
  top: 3rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;
}

.toast-message div {
  max-width: 20rem;
}

.toast-message .text-black {
  color: #000;
}
</style>
