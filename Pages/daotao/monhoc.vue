<script setup lang="ts">
import { ref } from "vue";

const activeTab = ref("monhoc");
</script>
<template>
  <div class="h-min-fit flex w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="flex w-full px-7 pt-6 text-[#133D85]">
        <h1 class="text-4xl font-bold">Môn học</h1>
        <n-button
          type="info"
          class="ml-auto h-12 w-40 text-xl"
          @click="$router.push('monhocinfo')"
        >
          Thêm mới
          <i class="fa-solid fa-plus ml-1 px-2"></i>
        </n-button>
      </div>
      <main class="box-border flex">
        <div class="min-h-fit w-full bg-white p-6">
          <!-- Tabs -->
          <div class="mb-6 flex border-b">
            <button
              @click="activeTab = 'monhoc'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'monhoc'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Môn học
            </button>
            <button
              @click="activeTab = 'danhmuc'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'danhmuc'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Danh mục
            </button>
            <button
              @click="activeTab = 'phonghoc'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'phonghoc'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Phòng học
            </button>
          </div>
          <div v-if="activeTab === 'monhoc'"><DaotaoSubjectSub /></div>
          <div v-if="activeTab === 'danhmuc'"><DaotaoSubjectDanhmuc /></div>
          <div v-if="activeTab === 'chuongtrinh'">
            <DaotaoSubjectChuongtrinh />
          </div>
          <div v-if="activeTab === 'phonghoc'"><DaotaoSubjectPhonghoc /></div>
        </div>
      </main>
    </div>
  </div>
</template>
