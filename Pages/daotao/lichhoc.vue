<script lang="ts">
import { NButton, type DataTableColumns } from "naive-ui";

import dayjs from "dayjs";
import {
  defineComponent,
  ref,
  h,
  reactive,
  computed,
  onMounted,
  toRaw,
} from "vue";
import { message } from "ant-design-vue";
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export default defineComponent({
  components: { VueDatePicker },
  setup() {
    interface RowData {
      id: string;
      subjectName: string;
      classType: string;
      startAt: string;
      status: string;
      endAt: string;
      name: string;
      totalLessons: number;
    }

    const paginationReactive = reactive({
      page: 1,
      pageSize: 10,
      showSizePicker: true,

      pageSizes: [5, 10, 15],
      itemCount: computed(() => filteredData.value.length),
      onUpdatePage: (page: number) => {
        paginationReactive.page = page;
      },
      onUpdatePageSize: (pageSize: number) => {
        paginationReactive.pageSize = pageSize;
        paginationReactive.page = 1;
      },
    });

    const { restAPI } = useApi();
    const data = ref<RowData[]>([]);
    const isLoading = ref(false);
    const selectedSubject = ref("");
    const selectedClassType = ref("");
    const dates = ref<Date[]>([]);
    // Biến để hiển thị/ẩn form xếp lịch
    const showSchedule = ref(false);
    // Lưu thông tin lớp học được chọn để xếp lịch
    const currentClass = ref<RowData | null>(null);
    const scheduleMode = ref<"date" | "week">("date");
    const displayDate = ref<Date>(new Date());
    const selectedValue = ref<Date | null>(null);
    const activeTab = ref("lichhoc");

    //lọc theo loại lớp học
    const classTypeOptions = [
      { label: "Tất cả loại lớp học", value: "" },
      { label: "Online", value: "1" },
      { label: "Offline", value: "2" },
      { label: "Hybrid", value: "3" },
    ];
    // lọc theo môn học
    const subjectOptions = ref<{ label: string; value: string }[]>([
      { label: "Tất cả môn học", value: "" },
    ]);

    const filteredData = computed(() =>
      data.value.filter(
        (row) =>
          (!selectedClassType.value ||
            row.classType === selectedClassType.value) &&
          (!selectedSubject.value || row.subjectName === selectedSubject.value),
      ),
    );

    const loadData = async () => {
      try {
        const { data: resData, error } = await restAPI.cms.getClasses({});

        if (error?.value) {
          message.error(error?.value?.data?.message || "Lỗi tải dữ liệu");
          return;
        }

        const rawData = toRaw(resData.value)?.data?.classes;
        if (Array.isArray(rawData)) {
          data.value = rawData.map((item: any, index: number) => ({
            stt: index + 1,
            id: item.id || "N/A",
            classType: item.type ? `${item.type}` : "N/A",
            startAt: item.start_at ? item.start_at.split("T")[0] : "N/A",
            endAt: item.end_at ? item.end_at.split("T")[0] : "N/A",
            status: item.status,
            name: item.name,
            subjectName: item.subject?.name || "N/A",
            totalLessons: item.total_lessons,
          }));

          // Lấy danh sách môn học từ dữ liệu
          const subjects = [
            ...new Set(rawData.map((item: any) => item.subject?.name || "N/A")),
            ...new Set(
              rawData.map((item: any) => item.subject?.total_lessons || "N/A"),
            ),
          ];
          subjectOptions.value = [
            { label: "Tất cả môn học", value: "" },
            ...subjects.map((subject) => ({ label: subject, value: subject })),
          ];
        } else {
          console.error("Unexpected API response:", rawData);
          message.error("Dữ liệu không hợp lệ từ API.");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        message.error("Lỗi tải dữ liệu.");
      }
    };

    function convertClassType(classType: number): string {
      const ClassTypeMap: Record<number, string> = {
        1: "Online",
        2: "Offline",
        3: "Hybrid",
      };
      return ClassTypeMap[classType] || "Không xác định";
    }

    function getClassStatus(status: number): string {
      const statusMap: Record<number, string> = {
        1: "Sắp diễn ra",
        2: "Đang diễn ra",
        3: "Đã kết thúc",
        4: "Đã hủy",
      };

      return statusMap[status] || "Không xác định";
    }
    const handleSave = () => {
      console.log("Lưu lịch học", {
        mode: scheduleMode.value,
        dates: dates.value,
      });
      showSchedule.value = false;
    };

    const handleClose = () => {
      showSchedule.value = false;
      currentClass.value = null;
      selectedValue.value = null;
      scheduleMode.value = "date";
      dates.value = [];
    };

    //button action
    const assignClass = (row: RowData) => {
      console.log("Xếp lịch cho lớp:", row);
      message.success(`Xếp lịch lớp học: ${row.name}`);
      // Gán thông tin lớp đang chọn
      currentClass.value = row;
      // Hiển thị phần xếp lịch
      showSchedule.value = true;
    };
    function createColumns(): DataTableColumns<RowData> {
      return [
        { title: "STT", key: "stt", align: "center" },
        { title: "tên Lớp học", key: "name", titleAlign: "center" },
        { title: "Tên môn học", key: "subjectName", titleAlign: "center" },
        {
          title: "Loại lớp học",
          key: "classType",
          align: "center",
          render(row) {
            return convertClassType(Number(row.classType));
          },
        },
        {
          title: "Thời gian học",
          key: "timeRange",
          align: "center",
          render(row) {
            return (
              dayjs(row.startAt).format("DD/MM/YYYY") +
              " - " +
              dayjs(row.endAt).format("DD/MM/YYYY")
            );
          },
        },
        {
          title: "Số buổi học",
          key: "totalLessons",
          align: "center",
        },
        {
          title: "Trạng thái",
          key: "status",
          align: "center",
          render(row) {
            const status = getClassStatus(Number(row.status));
            const statusStyles: Record<
              string,
              { color: string; background: string }
            > = {
              "Đang diễn ra": { color: "#00974F", background: "#F0FFF8" },
              "Sắp diễn ra": { color: "#FFA500", background: "#FFF8E5" },
              "Đã kết thúc": { color: "#4D6FA8", background: "#ECF1F9" },
              "Đã hủy": { color: "#D32F2F", background: "#FDECEA" },
            };

            return h(
              "span",
              {
                style: {
                  padding: "5px 10px",
                  borderRadius: "10px",
                  ...(statusStyles[status] || {
                    color: "#000",
                    background: "#FFF",
                  }),
                },
              },
              status,
            );
          },
        },
        {
          title: "Hành động",
          key: "actions",
          titleAlign: "center",
          render(row) {
            return h("div", { class: "flex gap-2 justify-center" }, [
              h(
                NButton,
                {
                  size: "small",
                  style: { color: "#fff", background: "#1890ff" },
                  quaternary: true,
                  onClick: () => assignClass(row), // Thay đổi hàm xử lý
                },
                { default: () => "Xếp lớp" },
              ),
            ]);
          },
        },
      ];
    }

    onMounted(() => {
      loadData();
    });

    return {
      isLoading,
      data,
      filteredData,
      columns: createColumns(),
      pagination: paginationReactive,
      classTypeOptions,
      selectedClassType,
      subjectOptions,
      selectedSubject,
      showSchedule,
      currentClass,
      scheduleMode,
      displayDate,
      selectedValue,
      dates,
      handleSave,
      VueDatePicker,
      handleClose,
      activeTab,
    };
  },
});
</script>

<template>
  <div class="h-min-fit flex w-full overflow-auto rounded-2xl bg-white">
    <!-- Main Content -->
    <div class="flex-1">
      <!-- Content Area -->
      <div class="flex w-full px-7 pt-6 text-[#133D85]">
        <button
          class="text-4xl font-bold"
          @click="activeTab = 'lichhoc'"
          :class="[
            'font-lichhoc px-6 py-2',
            activeTab === 'lichhoc'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-600',
          ]"
        >
          Lịch học
        </button>

        <n-button
          type="info"
          class="ml-auto h-12 w-40 text-xl"
          @click="$router.push('lophocinfo')"
        >
          Thêm mới
          <i class="fa-solid fa-plus ml-1 px-2"></i>
        </n-button>
      </div>
      <main
        class="mb-10 mr-5 mt-10 box-border flex"
        v-if="activeTab === 'lichhoc'"
      >
        <DaotaoLophocLich />
      </main>
    </div>
  </div>
</template>
