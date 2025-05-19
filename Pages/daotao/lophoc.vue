<script setup lang="ts">
import { ref, computed } from "vue";
import { message } from "ant-design-vue";

const activeTab = ref("all");
const { restAPI } = useApi();

// Định nghĩa kiểu dữ liệu
interface ClassData {
  id: string;
  subjectName: string;
  classType: number;
  startAt: string;
  endAt: string;
  status: number;
}

const data = ref<ClassData[]>([]);

// Hàm tải dữ liệu từ API
const loadData = async () => {
  try {
    const { data: resData, error } = await restAPI.cms.getClasses({});
    if (error?.value)
      throw new Error(error.value.data?.message || "Lỗi tải dữ liệu");

    data.value = resData.value?.data?.classes || [];
  } catch (err) {
    console.error("Error loading data:", err);
    message.error("Lỗi tải dữ liệu.");
  }
};

// Gọi API khi component được mount
loadData();

// Tính số lượng lớp học theo trạng thái
const totalClasses = computed(() => data.value.length);
const activeClasses = computed(
  () => data.value.filter((c) => c.status === 2).length,
);
const upcomingClasses = computed(
  () => data.value.filter((c) => c.status === 1).length,
);
const endedClasses = computed(
  () => data.value.filter((c) => c.status === 3).length,
);
const canceledClasses = computed(
  () => data.value.filter((c) => c.status === 4).length,
);
</script>
<template>
  <div class="h-min-fit flex w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="flex w-full px-7 pt-6 text-[#133D85]">
        <h1 class="text-4xl font-bold">Lớp học</h1>
        <n-button
          type="info"
          class="ml-auto h-12 w-40 text-xl"
          @click="$router.push('lophocinfo')"
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
              @click="activeTab = 'all'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'all'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Tất cả (<small>{{ totalClasses }}</small
              >)
            </button>
            <button
              @click="activeTab = 'isactive'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'isactive'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Đang diễn ra (<small>{{ activeClasses }}</small
              >)
            </button>
            <button
              @click="activeTab = 'unactive'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'unactive'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Sắp diễn ra (<small>{{ upcomingClasses }}</small
              >)
            </button>
            <button
              @click="activeTab = 'end'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'end'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Đã kết thúc (<small>{{ endedClasses }}</small
              >)
            </button>
            <button
              @click="activeTab = 'cancel'"
              :class="[
                'px-6 py-2 font-medium',
                activeTab === 'cancel'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600',
              ]"
            >
              Đã hủy (<small>{{ canceledClasses }}</small
              >)
            </button>
          </div>
          <div v-if="activeTab === 'all'"><DaotaoLophocAll /></div>
          <div v-if="activeTab === 'isactive'"><DaotaoLophocHoatdong /></div>
          <div v-if="activeTab === 'unactive'">
            <DaotaoLophocSapdienra />
          </div>
          <div v-if="activeTab === 'end'"><DaotaoLophocDaketthuc /></div>
          <div v-if="activeTab === 'cancel'"><DaotaoLophocDahuy /></div>
        </div>
      </main>
    </div>
  </div>
</template>
