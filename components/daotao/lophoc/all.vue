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

export default defineComponent({
  setup() {
    interface RowData {
      id: string;
      subjectName: string;
      classType: string;
      startAt: string;
      status: number;
      endAt: string;
      name: string;
      code: string;
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
    const router = useRouter();

    const isCancelModalVisible = ref(false);
    const cancelReason = ref("");
    const cancelingClassId = ref<string | null>(null);

    //lọc theo loại lớp học
    const classTypeOptions = [
      { label: "Tất cả loại lớp học", value: "" },
      { label: "Online", value: "1" },
      { label: "Offline", value: "2" },
      { label: "Hybrid", value: "3" },
    ];
    const selectedClassType = ref("");
    // lọc theo môn học
    const subjectOptions = ref<{ label: string; value: string }[]>([
      { label: "Tất cả môn học", value: "" },
    ]);
    const selectedSubject = ref("");

    const filteredData = computed(() =>
      data.value.filter(
        (row) =>
          (!selectedClassType.value ||
            row.classType === selectedClassType.value) &&
          (!selectedSubject.value || row.subjectName === selectedSubject.value),
      ),
    );

    const loadData = async () => {
      isLoading.value = true;
      try {
        const { data: resData, error } = await restAPI.cms.getClasses({});

        if (error?.value) {
          throw new Error(error.value.data?.message || "Lỗi tải dữ liệu");
        }

        const rawData = toRaw(resData.value)?.data?.classes;

        data.value = rawData.map((item: any, index: number) => ({
          stt: index + 1,
          code: item.code || "N/A",
          id: item.id || "N/A",
          subjectName: item.subject?.name || "N/A",
          classType: item.type ? `${item.type}` : "N/A",
          startAt: item.start_at ? item.start_at.split("T")[0] : "N/A",
          endAt: item.end_at ? item.end_at.split("T")[0] : "N/A",
          status: item.status,
          name: item.name,
          totalLessons: item.total_lessons,
        }));

        // Lấy danh sách môn học từ dữ liệu
        const subjects = [
          ...new Set(
            rawData
              .map((item: any) => item.subject?.name)
              .filter((s: any) => typeof s === "string"),
          ),
          ...new Set(
            rawData
              .map((item: any) => item.subject?.total_lessons)
              .filter((s: any) => typeof s === "string"),
          ),
        ];

        subjectOptions.value = [
          { label: "Tất cả môn học", value: "" },
          ...subjects.map((subject) => ({
            label: String(subject), // Ép kiểu về string
            value: String(subject),
          })),
        ];
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

    // HÀM CHỈNH SỬA LỚP HỌC
    const editRow = (row: any) => {
      if (!row.id) {
        console.error("ID lớp học không hợp lệ:", row);
        return;
      }

      console.log("Edit:", row);
      router.push({
        path: "lophocinfo",
        query: { id: row.id.toString(), num: row.totalLessons },
      });
      message.success(`Chỉnh sửa lớp học: ${row.name}`);
    };
    //HÀM HỦY LỚP
    const confirmCancel = async () => {
      if (!cancelingClassId.value) return;
      try {
        const { error } = await restAPI.cms.cancelClass({
          id: cancelingClassId.value,
          body: { cancel_reason: cancelReason.value }, // Gửi lý do hủy
        });

        if (error?.value) {
          throw new Error(error.value.data?.message || "Lỗi khi hủy lớp học");
        }

        message.success("Lớp học đã được hủy.");
        isCancelModalVisible.value = false;
        await loadData();
      } catch (err) {
        console.error("Lỗi khi hủy lớp học:", err);
        message.error("Không thể hủy lớp học.");
      }
    };

    // LÝ DO HỦY LỚP
    const openCancelModal = (id: string) => {
      cancelingClassId.value = id;
      cancelReason.value = "";
      isCancelModalVisible.value = true;
    };

    // HÀM XÓA LỚP
    const deleteRow = async (row: RowData) => {
      if (confirm("Bạn có chắc chắn muốn xóa lớp học này không?")) {
        try {
          const { error } = await restAPI.cms.deleteClass({
            id: row.id,
          });
          if (error?.value) {
            message.error(error.value.data?.message || "Lỗi khi xóa lớp học");
            console.log("body", { id: row.id });
            return;
          }
          data.value = data.value.filter((item) => item.id !== row.id);
          message.success("Xóa lớp học thành công");
          await loadData();
        } catch (err) {
          console.error("lối khi xóa lớp học:", err);
          message.error("lỗi khi xóa lớp học");
        }
      }
    };

    // HÀM NHÂN BẢN LỚP
    const duplicateRow = (row: RowData) => {
      if (!row.id) {
        console.error("ID lớp học không hợp lệ:", row);
        return;
      }

      console.log("Duplicate:", row);

      router.push({
        path: "lophocinfo",
      });

      message.success(`Nhân bản lớp học: ${row.name}`);
    };

    function createColumns(): DataTableColumns<RowData> {
      return [
        { title: "STT", key: "stt", titleAlign: "center" },
        { title: "Mã lớp học", key: "code", titleAlign: "center" },
        { title: "Tên Lớp học", key: "name", titleAlign: "center" },
        { title: "Tên môn học", key: "subjectName", titleAlign: "center" },
        {
          title: "Loại lớp học",
          key: "classType",
          titleAlign: "center",
          render(row) {
            return convertClassType(Number(row.classType));
          },
        },
        {
          title: "Số buổi học",
          key: "totalLessons",
          titleAlign: "center",
        },
        {
          title: "Thời gian học",
          align: "center",
          key: "timeRange",
          render(row) {
            return (
              dayjs(row.startAt).format("DD/MM/YYYY") +
              " - " +
              dayjs(row.endAt).format("DD/MM/YYYY")
            );
          },
        },
        {
          title: "Trạng thái",
          align: "center",
          key: "status",
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
          align: "center",
          render(row) {
            const isCancelled = row.status === 4;
            const isFinished = row.status === 3;

            return h("div", { class: "flex gap-2 justify-center" }, [
              h(
                NButton,
                {
                  size: "small",
                  type: "primary",
                  quaternary: true,
                  onClick: () => editRow(row),

                  disabled: isCancelled,
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-regular fa-pen-to-square",
                      style: "color: green;",
                    }),
                },
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "error",
                  quaternary: true,

                  onClick: () => openCancelModal(row.id),

                  disabled: isCancelled || isFinished,
                },
                {
                  default: () =>
                    h("i", { class: "fas fa-ban", style: "color: red;" }),
                },
              ),

              h(
                NButton,
                {
                  size: "small",
                  type: "warning",
                  quaternary: true,
                  onClick: () => duplicateRow(row),
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-solid fa-square-plus",
                      style: "color: orange;",
                    }),
                },
              ),
              h(
                NButton,
                {
                  size: "small",
                  type: "error",
                  quaternary: true,
                  onClick: () => deleteRow(row),
                },
                {
                  default: () =>
                    h("i", {
                      class: "fa-solid fa-trash",
                      style: "color: red;",
                    }),
                },
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

      isCancelModalVisible,
      cancelReason,

      confirmCancel,
    };
  },
});
</script>

<template>
  <div class="h-full w-full overflow-auto rounded-2xl bg-white">
    <div class="flex gap-4 p-4">
      <n-select
        v-model:value="selectedSubject"
        :options="subjectOptions"
        style="width: 200px"
      />
      <n-select
        v-model:value="selectedClassType"
        :options="classTypeOptions"
        style="width: 200px"
      />
    </div>

    <div class="h-full bg-white text-black">
      <n-data-table
        :bordered="false"
        :single-line="false"
        :columns="columns"
        :data="filteredData"
        :scroll-x="1000"
        :pagination="pagination"
      />
    </div>

    <n-modal v-model:show="isCancelModalVisible">
      <n-card
        title="Xác nhận hủy lớp học"
        style="width: 400px"
        closable
        @close="isCancelModalVisible = false"
      >
        <n-input
          v-model:value="cancelReason"
          placeholder="Nhập lý do hủy lớp học..."
          type="textarea"
        />
        <template #footer>
          <div class="flex justify-end gap-2">
            <n-button @click="isCancelModalVisible = false">Hủy</n-button>
            <n-button type="error" @click="confirmCancel">Xác nhận</n-button>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>
