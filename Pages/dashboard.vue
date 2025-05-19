<script setup>
import { ref, onMounted } from "vue";
import Today from "./Admin/AdminHomePage/today.vue";
import Week from "./Admin/AdminHomePage/week.vue";

const activeTab = ref("");

onMounted(() => {
  activeTab.value = "HomNay";
  sessionStorage.removeItem("loginfo");
  sessionStorage.removeItem("first_time");
});
</script>

<template>
  <div class="flex h-full w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="text-black">
        <main class="flex items-center justify-center p-8">
          <div class="text-center">
            <div class="min-h-screen bg-white p-6">
              <!-- Header -->
              <div class="mb-6 justify-between">
                <button
                  @click="activeTab = 'HomNay'"
                  :class="[
                    'px-6 py-2 font-medium',
                    activeTab === 'HomNay'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-600',
                  ]"
                >
                  Lịch học hôm nay
                </button>
                <button
                  @click="activeTab = 'TuanSau'"
                  :class="[
                    'px-6 py-2 font-medium',
                    activeTab === 'TuanSau'
                      ? 'border-b-2 border-blue-500 text-blue-500'
                      : 'text-gray-600',
                  ]"
                >
                  trong 7 ngày tới
                </button>
              </div>
              <div v-if="activeTab === 'HomNay'">
                <Today />
              </div>
              <div v-if="activeTab === 'TuanSau'">
                <Week />
              </div>

              <!-- Main Grid -->
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
