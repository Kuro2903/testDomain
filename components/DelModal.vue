<script setup>
import { ref } from "vue";

const emits = defineEmits(["confirm-delete"]);
const isModalVisible = ref(false);
const title = ref("");
const setAddNew = (value) => {
  isModalVisible.value = true;
  title.value = value;
};
defineExpose({ setAddNew });

const confirmDelete = () => {
  emits("confirm-delete");
  isModalVisible.value = false;
};
</script>

<template>
  <n-modal v-model:show="isModalVisible">
    <n-card
      title="Xác nhận xóa"
      @close="isModalVisible = false"
      style="width: 400px"
    >
      <p>{{ title }}</p>
      <template #footer>
        <n-space justify="end">
          <n-button @click="isModalVisible = false">Hủy</n-button>
          <n-button type="error" @click="confirmDelete"> Xóa </n-button>
        </n-space>
      </template>
    </n-card>
  </n-modal>
</template>
