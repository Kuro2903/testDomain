<template>
  <MenuStudent
    v-if="userRole === ROLE_ID.STUDENT"
    v-model:collapsed="collapsed"
  />
  <MenuAdmin v-else v-model:collapsed="collapsed" />
</template>

<script setup>
const collapsed = defineModel("collapsed");

const userStore = useUserStore();

const userRole = computed(() => userStore.userInfo?.role_id);
</script>
