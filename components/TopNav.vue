<script setup>
import { useDialog, useMessage } from "naive-ui";
import { useUserStore } from "@/stores/userStore";
import { NPopover } from "naive-ui";
import { onMounted } from "vue";

const dialog = useDialog();
const userStore = useUserStore();
const message = useMessage();
const avatar = userStore.userInfo?.avatar;
const doLogout = () => {
  dialog.info({
    title: "Chú ý",
    content: "Bạn có chắc chắn bạn muốn thoát",
    positiveText: "Đồng ý",
    negativeText: "Không đồng ý",
    onPositiveClick: () => {
      userStore.logOut();
      message.success("Đăng xuất thành công");
      return navigateTo(`/`);
    },
    onNegativeClick: () => {},
  });
};

onMounted(() => {
  console.log(userStore.userInfo);
});
</script>

<template>
  <div class="flex h-[60px] w-full bg-gray-200">
    <!-- <Sidebar /> -->

    <!-- Main Content -->
    <div class="flex-1">
      <!-- Top Navigation -->
      <header class="flex items-center justify-between bg-white p-4 shadow">
        <h1 class="text-lg font-semibold text-gray-700">Logo</h1>
        <div class="flex items-center space-x-4 pr-3">
          <div class="relative">
            <input
              type="text"
              placeholder="Tìm kiếm"
              class="flex w-full rounded-lg border px-3 py-2 text-sm text-black focus:outline-none focus:ring focus:ring-blue-200"
            />
            <div
              class="pointer-events-none absolute inset-y-0 right-2 flex items-center pl-3"
            >
              <i class="fas fa-magnifying-glass text-gray-400"></i>
            </div>
          </div>
          <n-popover
            trigger="hover"
            raw
            :show-arrow="false"
            class="rounded-xl bg-white p-4 shadow-lg"
          >
            <template #trigger>
              <div class="flex cursor-pointer items-center space-x-2">
                <img
                  :src="avatar"
                  alt="Profile"
                  class="h-10 w-10 rounded-full"
                />
                <p>
                  {{ userStore.userInfo?.full_name }}
                </p>
              </div>
            </template>
            <div class="flex cursor-pointer items-center space-x-2">
              <img :src="avatar" alt="Profile" class="h-10 w-10 rounded-full" />
              <p>
                {{ userStore.userInfo?.full_name }}
              </p>
            </div>
            <div class="mt-2 flex flex-col space-y-2">
              <button @click.prevent="$router.push('/user')" class="text-left">
                <i class="fa-solid fa-gear pr-2"></i>Cài đặt
              </button>
              <button @click.prevent="doLogout" class="text-left">
                <i class="fa-solid fa-right-from-bracket pr-2"></i>Đăng xuất
              </button>
            </div>
          </n-popover>
        </div>
      </header>
    </div>
  </div>
</template>
